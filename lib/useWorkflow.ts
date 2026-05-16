'use client'

import { useCallback, useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import {
  createWalletClient,
  custom,
  parseEther,
  decodeEventLog,
  type EIP1193Provider,
} from 'viem'
import { monadTestnet, publicClient } from './chain'
import { ESCROW_ADDRESS, ESCROW_ABI, REGISTRY_ADDRESS, REGISTRY_ABI } from './contracts'

// ──────────────────────────────────────────────────────────────────────────
// Types matching the backend orchestrator
// ──────────────────────────────────────────────────────────────────────────

export type WorkflowStep = { agentIds: number[] }
export type WorkflowDef = { task: string; steps: WorkflowStep[] }

export type AgentInfo = {
  id: number
  name: string
  specialty: string
  pricePerTask: string // wei MON as string
  wallet: string
  active: boolean
}

export type AgentRunState = {
  agentId: number
  agentIndex: number
  status: 'idle' | 'thinking' | 'streaming' | 'done' | 'paid' | 'error'
  output: string // accumulated tokens
  txHash?: string
  blockNumber?: string
  gasUsed?: string
  latencyMs?: number
}

export type StepRunState = {
  stepIndex: number
  agentIds: number[]
  status: 'pending' | 'running' | 'complete'
  blocksUsed?: string[]
  txsInSameBlock?: number
}

export type WorkflowRunState = {
  status: 'idle' | 'depositing' | 'started' | 'running' | 'complete' | 'error'
  workflowId?: string
  task: string
  agents: Record<number, AgentRunState> // keyed by agentIndex
  steps: StepRunState[]
  finalOutput?: string
  error?: string
}

// ──────────────────────────────────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────────────────────────────────

export function useWorkflow() {
  const { authenticated, login, ready } = usePrivy()
  const { wallets } = useWallets()
  const wallet = wallets[0]

  const [run, setRun] = useState<WorkflowRunState>({
    status: 'idle',
    task: '',
    agents: {},
    steps: [],
  })

  /// Fetch the registered agents from chain (or fall back to off-chain definitions).
  const loadAgents = useCallback(async (): Promise<AgentInfo[]> => {
    const res = await fetch('/api/agents')
    const data = await res.json()
    return data.agents ?? []
  }, [])

  /// Run a workflow end-to-end:
  /// 1. Compute total cost from agent prices
  /// 2. Have user pay escrow.startWorkflow() via Privy wallet
  /// 3. Parse WorkflowStarted event for the workflowId
  /// 4. POST to /api/workflow with workflowId — backend orchestrates execution
  /// 5. Stream SSE events back, update state as they arrive
  const startWorkflow = useCallback(
    async (def: WorkflowDef, agentPrices: Record<number, bigint>) => {
      if (!ready) throw new Error('Privy not ready')
      if (!authenticated) {
        await login()
        return
      }
      if (!wallet) throw new Error('No wallet connected')

      // 1. Compute total cost
      const allAgentIds = def.steps.flatMap(s => s.agentIds)
      const totalCost = allAgentIds.reduce(
        (sum, id) => sum + (agentPrices[id] ?? 0n),
        0n
      )

      // Initialize state for all agents
      let agentIndexCounter = 0
      const initialAgents: Record<number, AgentRunState> = {}
      const initialSteps: StepRunState[] = def.steps.map((step, sIdx) => {
        const stepAgents = step.agentIds.map((agentId, i) => {
          const agentIndex = agentIndexCounter++
          initialAgents[agentIndex] = {
            agentId,
            agentIndex,
            status: 'idle',
            output: '',
          }
          return agentIndex
        })
        void stepAgents
        return {
          stepIndex: sIdx,
          agentIds: [...step.agentIds],
          status: 'pending',
        }
      })

      setRun({
        status: 'depositing',
        task: def.task,
        agents: initialAgents,
        steps: initialSteps,
      })

      try {
        // 2. Get viem wallet client from Privy provider
        const provider = (await wallet.getEthereumProvider()) as EIP1193Provider
        const walletClient = createWalletClient({
          chain: monadTestnet,
          transport: custom(provider),
          account: wallet.address as `0x${string}`,
        })

        // Switch to Monad testnet if not already
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${monadTestnet.id.toString(16)}` }],
          })
        } catch {
          // chain might not be added — try adding then switching
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${monadTestnet.id.toString(16)}`,
                chainName: monadTestnet.name,
                nativeCurrency: monadTestnet.nativeCurrency,
                rpcUrls: monadTestnet.rpcUrls.default.http,
                blockExplorerUrls: [monadTestnet.blockExplorers.default.url],
              },
            ],
          })
        }

        // 3. Send startWorkflow tx
        const txHash = await walletClient.writeContract({
          address: ESCROW_ADDRESS,
          abi: ESCROW_ABI,
          functionName: 'startWorkflow',
          args: [allAgentIds.map(id => BigInt(id))],
          value: totalCost,
        })

        // Wait for receipt + extract workflowId from WorkflowStarted event
        const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })
        let workflowId: bigint | null = null
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: ESCROW_ABI,
              data: log.data,
              topics: log.topics,
            })
            if (decoded.eventName === 'WorkflowStarted') {
              workflowId = (decoded.args as { workflowId: bigint }).workflowId
              break
            }
          } catch {
            // not our event
          }
        }
        if (workflowId === null) {
          throw new Error('Could not find WorkflowStarted event in receipt')
        }

        setRun(r => ({ ...r, status: 'started', workflowId: workflowId!.toString() }))

        // 4. POST to /api/workflow — backend orchestrates from here
        const res = await fetch('/api/workflow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workflowId: workflowId.toString(), def }),
        })

        if (!res.ok || !res.body) {
          throw new Error(`Workflow API returned ${res.status}`)
        }

        // 5. Subscribe to SSE stream
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        setRun(r => ({ ...r, status: 'running' }))

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed.startsWith('data:')) continue
            const json = trimmed.slice(5).trim()
            if (!json) continue
            try {
              const event = JSON.parse(json)
              applyEvent(event)
            } catch {
              // skip malformed
            }
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setRun(r => ({ ...r, status: 'error', error: msg }))
        throw err
      }
    },
    [authenticated, login, ready, wallet]
  )

  /// Apply a single SSE event to the run state.
  const applyEvent = useCallback((event: { type: string; [k: string]: unknown }) => {
    setRun(r => {
      const next = { ...r, agents: { ...r.agents }, steps: [...r.steps] }

      switch (event.type) {
        case 'workflow_start':
          next.workflowId = event.workflowId as string
          next.task = event.task as string
          break

        case 'step_start': {
          const idx = event.stepIndex as number
          if (next.steps[idx]) next.steps[idx] = { ...next.steps[idx], status: 'running' }
          break
        }

        case 'agent_thinking': {
          const ai = event.agentIndex as number
          const existing = next.agents[ai]
          if (existing) {
            next.agents[ai] = { ...existing, status: 'thinking' }
          }
          break
        }

        case 'agent_output_chunk': {
          const ai = event.agentIndex as number
          const existing = next.agents[ai]
          if (existing) {
            next.agents[ai] = {
              ...existing,
              status: 'streaming',
              output: existing.output + (event.chunk as string),
            }
          }
          break
        }

        case 'agent_output': {
          const ai = event.agentIndex as number
          const existing = next.agents[ai]
          if (existing) {
            next.agents[ai] = {
              ...existing,
              status: 'done',
              output: event.output as string, // overwrite with canonical
            }
          }
          break
        }

        case 'agent_paid': {
          const ai = event.agentIndex as number
          const existing = next.agents[ai]
          if (existing) {
            next.agents[ai] = {
              ...existing,
              status: 'paid',
              txHash: event.txHash as string,
              blockNumber: event.blockNumber as string,
              gasUsed: event.gasUsed as string,
              latencyMs: event.latencyMs as number,
            }
          }
          break
        }

        case 'step_complete': {
          const idx = event.stepIndex as number
          if (next.steps[idx]) {
            next.steps[idx] = {
              ...next.steps[idx],
              status: 'complete',
              blocksUsed: event.blocksUsed as string[],
              txsInSameBlock: event.txsInSameBlock as number,
            }
          }
          break
        }

        case 'workflow_complete':
          next.status = 'complete'
          next.finalOutput = event.finalOutput as string
          break

        case 'error':
          next.status = 'error'
          next.error = event.message as string
          break
      }

      return next
    })
  }, [])

  const reset = useCallback(() => {
    setRun({ status: 'idle', task: '', agents: {}, steps: [] })
  }, [])

  return {
    // State
    run,
    authenticated,
    ready,
    walletAddress: wallet?.address,

    // Actions
    login,
    loadAgents,
    startWorkflow,
    reset,
  }
}
