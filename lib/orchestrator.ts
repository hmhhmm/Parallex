import { callOllamaStream } from './ollama'
import { getAgent } from './agents'
import { getOperatorClient, publicClient } from './monad'
import { ESCROW_ADDRESS, ESCROW_ABI } from './contracts'

export type WorkflowStep = { agentIds: number[] }
export type WorkflowDef = { task: string; steps: WorkflowStep[] }

export type StreamEvent =
  | { type: 'workflow_start'; workflowId: string; task: string }
  | { type: 'step_start'; stepIndex: number; agentIds: number[] }
  | { type: 'agent_thinking'; agentId: number; agentIndex: number }
  | { type: 'agent_output_chunk'; agentId: number; agentIndex: number; chunk: string }
  | { type: 'agent_output'; agentId: number; agentIndex: number; output: string }
  | {
      type: 'agent_paid'
      agentId: number
      agentIndex: number
      txHash: string
      blockNumber: string  // ← all agents in same block = visual proof of parallel exec
      gasUsed: string
      latencyMs: number    // submit-to-confirm latency
    }
  | {
      type: 'step_complete'
      stepIndex: number
      blocksUsed: string[]      // distinct block numbers where this step's txs landed
      txsInSameBlock: number    // max count of step txs that shared one block
    }
  | { type: 'workflow_complete'; finalOutput: string }
  | { type: 'error'; message: string }

/**
 * Run a workflow. Each step's agents run in parallel (Promise.all).
 * Between steps, outputs are merged and fed forward as context.
 *
 * Monad parallel-execution flex: when a step has N agents, after they all
 * finish, N on-chain `completeAgent` txs fire concurrently — Monad processes
 * them in parallel because each touches a different storage slot.
 */
export async function* runWorkflow(
  workflowId: bigint,
  def: WorkflowDef
): AsyncGenerator<StreamEvent> {
  yield { type: 'workflow_start', workflowId: workflowId.toString(), task: def.task }

  const operator = getOperatorClient()
  let context = def.task
  let agentIndexCounter = 0

  for (let s = 0; s < def.steps.length; s++) {
    const step = def.steps[s]
    yield { type: 'step_start', stepIndex: s, agentIds: [...step.agentIds] }

    const stepBaseIndex = agentIndexCounter

    // STREAM each agent SEQUENTIALLY within step.
    // Why sequential not parallel: (a) Ollama queues locally anyway,
    // (b) sequential streaming is much cleaner UX — audience reads
    // each agent's output cleanly instead of interleaved chaos.
    // The actual parallel flex is the on-chain payments that fire after.
    const agentResults: Array<{
      agentId: number
      agentIndex: number
      output: string
      ok: boolean
    }> = []

    for (let i = 0; i < step.agentIds.length; i++) {
      const agentId = step.agentIds[i]
      const agentIndex = stepBaseIndex + i
      const agent = getAgent(agentId)

      yield { type: 'agent_thinking', agentId, agentIndex }

      let fullOutput = ''
      let agentOk = true

      try {
        for await (const chunk of callOllamaStream(agent.systemPrompt, context)) {
          fullOutput += chunk
          yield { type: 'agent_output_chunk', agentId, agentIndex, chunk }
        }
        if (!fullOutput.trim()) {
          fullOutput = '[empty response]'
          agentOk = false
        }
      } catch (e) {
        fullOutput = `[agent ${agentId} failed: ${e instanceof Error ? e.message : 'unknown'}]`
        agentOk = false
      }

      yield { type: 'agent_output', agentId, agentIndex, output: fullOutput }
      agentResults.push({ agentId, agentIndex, output: fullOutput, ok: agentOk })
    }

    // PARALLEL ON-CHAIN PAYMENTS — THIS IS THE MONAD FLEX
    // Fire all completeAgent() txs concurrently AND wait for receipts.
    // Each touches a different (workflowId, agentIndex) slot, so Monad
    // can execute them in parallel — often landing in the same block.
    const txPromises = agentResults.map(r => {
      const submittedAt = Date.now()
      return operator
        .writeContract({
          address: ESCROW_ADDRESS,
          abi: ESCROW_ABI,
          functionName: 'completeAgent',
          args: [workflowId, BigInt(r.agentIndex)],
        })
        .then(async txHash => {
          // Wait for actual confirmation — agent_paid is only truthful
          // when the tx is mined, not just submitted to the mempool.
          const receipt = await publicClient.waitForTransactionReceipt({
            hash: txHash,
            timeout: 30_000,
          })
          return {
            ...r,
            txHash,
            txOk: receipt.status === 'success',
            blockNumber: receipt.blockNumber.toString(),
            gasUsed: receipt.gasUsed.toString(),
            latencyMs: Date.now() - submittedAt,
          }
        })
        .catch(err => ({
          ...r,
          txHash: '0x' as `0x${string}`,
          txOk: false as const,
          txError: err instanceof Error ? err.message : String(err),
          blockNumber: '0',
          gasUsed: '0',
          latencyMs: Date.now() - submittedAt,
        }))
    })

    const txResults = await Promise.all(txPromises)

    for (const r of txResults) {
      if (r.txOk) {
        yield {
          type: 'agent_paid',
          agentId: r.agentId,
          agentIndex: r.agentIndex,
          txHash: r.txHash,
          blockNumber: r.blockNumber,
          gasUsed: r.gasUsed,
          latencyMs: r.latencyMs,
        }
      } else {
        yield {
          type: 'error',
          message: `payment for agent ${r.agentId} failed: ${'txError' in r ? r.txError : 'unknown'}`,
        }
      }
    }

    // Compute step-level "parallel landed" metric — the demo flex number
    const successBlocks = txResults
      .filter(r => r.txOk)
      .map(r => r.blockNumber)
    const distinctBlocks = Array.from(new Set(successBlocks))
    // How many of our txs landed in the SAME block? Higher = better parallel proof.
    const blockCounts = successBlocks.reduce<Record<string, number>>((acc, b) => {
      acc[b] = (acc[b] ?? 0) + 1
      return acc
    }, {})
    const maxInOneBlock = Object.values(blockCounts).reduce((max, n) => Math.max(max, n), 0)

    // Merge step outputs to feed into next step
    context = agentResults
      .map(r => `[${getAgent(r.agentId).name}]:\n${r.output}`)
      .join('\n\n')

    agentIndexCounter += step.agentIds.length

    yield {
      type: 'step_complete',
      stepIndex: s,
      blocksUsed: distinctBlocks,
      txsInSameBlock: maxInOneBlock,
    }
  }

  yield { type: 'workflow_complete', finalOutput: context }
}
