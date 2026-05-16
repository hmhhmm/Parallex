'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import {
  createWalletClient,
  custom,
  decodeEventLog,
  type EIP1193Provider,
} from 'viem'
import { monadTestnet, publicClient } from '@/lib/chain'
import { ESCROW_ADDRESS, ESCROW_ABI } from '@/lib/contracts'

export type AgentStatus = 'idle' | 'running' | 'paid' | 'complete'

export interface AgentState {
  id: string
  status: AgentStatus
  output: string[]
  txHash?: string
  amount?: string
}

export interface WorkflowSummary {
  totalCost: string
  duration: string
  txCount: number
  tps: string
}

export interface PaymentEvent {
  agentId: string
  amount: string
  txHash: string
  ts: number
}

// UI uses string IDs ('research', 'data', etc); the on-chain registry uses
// numeric IDs assigned in deploy.js. Keep this in sync with the seeded order.
const STRING_TO_NUMERIC: Record<string, number> = {
  research:  0, // Research Analyst
  contract:  1, // Code Engineer (UI's "Contract Deployer" maps here)
  writer:    2, // Content Writer
  data:      3, // Data Processor
  translate: 4, // Translator
  trader:    5, // Strategy Advisor (UI's "DeFi Trader" maps here)
}

const NUMERIC_TO_STRING: Record<number, string> = Object.fromEntries(
  Object.entries(STRING_TO_NUMERIC).map(([s, n]) => [n, s])
)

function makeInitial(ids: string[]): Record<string, AgentState> {
  return Object.fromEntries(
    ids.map(id => [id, { id, status: 'idle' as AgentStatus, output: [] }])
  )
}

// Append a token chunk to the line-array state, splitting on newlines so the
// log feed UI shows nicely separated lines as they stream in.
function appendChunk(output: string[], chunk: string): string[] {
  const lastLine = output[output.length - 1] ?? ''
  const combined = lastLine + chunk
  const parts = combined.split('\n')
  return [...output.slice(0, -1), ...parts]
}

type StreamEvent = {
  type: string
  agentId?: number
  chunk?: string
  output?: string
  txHash?: string
  message?: string
}

export function useWorkflow(agentIds: string[]) {
  const idsKey = agentIds.join(',')
  const { authenticated, login, ready } = usePrivy()
  const { wallets } = useWallets()
  const wallet = wallets[0]

  const [agents,   setAgents]   = useState<Record<string, AgentState>>(() => makeInitial(agentIds))
  const [running,  setRunning]  = useState(false)
  const [complete, setComplete] = useState(false)
  const [summary,  setSummary]  = useState<WorkflowSummary | null>(null)
  const [payments, setPayments] = useState<PaymentEvent[]>([])

  const agentPricesRef  = useRef<Record<number, bigint>>({})
  const pendingStartRef = useRef(false)
  const abortRef        = useRef<AbortController | null>(null)

  // Reset whenever the workflow composition changes
  useEffect(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setRunning(false)
    setComplete(false)
    setSummary(null)
    setPayments([])
    setAgents(makeInitial(agentIds))
  }, [idsKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cancel any in-flight stream on unmount
  useEffect(() => () => { abortRef.current?.abort() }, [])

  // Apply a single SSE event from the orchestrator
  const applyEvent = useCallback((event: StreamEvent) => {
    switch (event.type) {
      case 'agent_thinking': {
        const stringId = event.agentId !== undefined ? NUMERIC_TO_STRING[event.agentId] : undefined
        if (!stringId) return
        setAgents(prev => {
          if (!prev[stringId]) return prev
          return { ...prev, [stringId]: { ...prev[stringId], status: 'running' } }
        })
        return
      }

      case 'agent_output_chunk': {
        const stringId = event.agentId !== undefined ? NUMERIC_TO_STRING[event.agentId] : undefined
        if (!stringId || !event.chunk) return
        setAgents(prev => {
          const a = prev[stringId]
          if (!a) return prev
          return { ...prev, [stringId]: { ...a, output: appendChunk(a.output, event.chunk!) } }
        })
        return
      }

      case 'agent_output': {
        const stringId = event.agentId !== undefined ? NUMERIC_TO_STRING[event.agentId] : undefined
        if (!stringId) return
        const lines = (event.output ?? '').split('\n').map(s => s.trim()).filter(Boolean)
        setAgents(prev => {
          if (!prev[stringId]) return prev
          return { ...prev, [stringId]: { ...prev[stringId], output: lines } }
        })
        return
      }

      case 'agent_paid': {
        const numericId = event.agentId
        const stringId  = numericId !== undefined ? NUMERIC_TO_STRING[numericId] : undefined
        const txHash    = event.txHash ?? '0x'
        if (numericId === undefined || !stringId) return

        const priceWei = agentPricesRef.current[numericId] ?? 0n
        const amount = (Number(priceWei) / 1e18).toFixed(4)

        setAgents(prev => {
          if (!prev[stringId]) return prev
          return { ...prev, [stringId]: { ...prev[stringId], status: 'paid', txHash, amount } }
        })
        setPayments(prev => [...prev, { agentId: stringId, amount, txHash, ts: Date.now() }])
        return
      }

      case 'error': {
        console.error('[orchestrator]', event.message)
        return
      }
    }
  }, [])

  const doRun = useCallback(async () => {
    if (!wallet) return

    setRunning(true)
    setAgents(makeInitial(agentIds))
    setComplete(false)
    setSummary(null)
    setPayments([])

    const startedAt = Date.now()
    const ac = new AbortController()
    abortRef.current = ac

    try {
      // 1. Translate UI string IDs to on-chain numeric IDs
      const numericIds: number[] = []
      for (const s of agentIds) {
        const n = STRING_TO_NUMERIC[s]
        if (n !== undefined) numericIds.push(n)
      }
      if (numericIds.length === 0) {
        throw new Error(`No mappable agents in [${agentIds.join(', ')}]`)
      }

      // 2. Fetch on-chain agent prices so we can compute total cost
      const agentsRes  = await fetch('/api/agents', { signal: ac.signal })
      const agentsData = await agentsRes.json() as {
        agents?: Array<{ id: number; pricePerTask: string }>
      }
      const allAgents = agentsData.agents ?? []

      let totalCost = 0n
      for (const id of numericIds) {
        const a = allAgents.find(x => x.id === id)
        const price = BigInt(a?.pricePerTask ?? '0')
        agentPricesRef.current[id] = price
        totalCost += price
      }

      // 3. Build viem wallet client from Privy's embedded/injected provider
      const provider = (await wallet.getEthereumProvider()) as EIP1193Provider
      const walletClient = createWalletClient({
        chain: monadTestnet,
        transport: custom(provider),
        account: wallet.address as `0x${string}`,
      })

      // Make sure the user's wallet is on Monad testnet before tx
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${monadTestnet.id.toString(16)}` }],
        })
      } catch {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${monadTestnet.id.toString(16)}`,
            chainName: monadTestnet.name,
            nativeCurrency: monadTestnet.nativeCurrency,
            rpcUrls: monadTestnet.rpcUrls.default.http,
            blockExplorerUrls: [monadTestnet.blockExplorers.default.url],
          }],
        })
      }

      // 4. Deposit into escrow — this is the user's MetaMask popup
      const txHash = await walletClient.writeContract({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: 'startWorkflow',
        args: [numericIds.map(BigInt)],
        value: totalCost,
      })

      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash })

      // Parse the WorkflowStarted event to learn our on-chain workflow id
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
          // not our event — keep looking
        }
      }
      if (workflowId === null) {
        throw new Error('Could not find WorkflowStarted event in receipt')
      }

      // 5. Tell the orchestrator to start. One agent per step → sequential UX
      //    (the UI shows agents as a vertical timeline, not parallel columns).
      const def = {
        task: `Workflow with ${numericIds.length} agent${numericIds.length === 1 ? '' : 's'}`,
        steps: numericIds.map(id => ({ agentIds: [id] })),
      }

      const res = await fetch('/api/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId: workflowId.toString(), def }),
        signal: ac.signal,
      })

      if (!res.ok || !res.body) {
        throw new Error(`Workflow API returned ${res.status}`)
      }

      // 6. Drain the SSE stream, mutating UI state per event
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

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
            applyEvent(JSON.parse(json))
          } catch {
            // skip malformed
          }
        }
      }

      // 7. Finalise summary
      const durationSec  = (Date.now() - startedAt) / 1000
      const totalCostMon = (Number(totalCost) / 1e18).toFixed(3)
      setSummary({
        totalCost: totalCostMon,
        duration: `${durationSec.toFixed(1)}s`,
        txCount: numericIds.length,
        tps: durationSec > 0 ? (numericIds.length / durationSec).toFixed(2) : '0',
      })
      setComplete(true)
      setRunning(false)
    } catch (err) {
      if ((err as { name?: string }).name === 'AbortError') return
      console.error('[useWorkflow] failed:', err)
      setRunning(false)
    } finally {
      abortRef.current = null
    }
  }, [idsKey, wallet, applyEvent]) // eslint-disable-line react-hooks/exhaustive-deps

  const start = useCallback(async () => {
    if (running || agentIds.length === 0) return

    if (!ready) {
      pendingStartRef.current = true
      return
    }
    if (!authenticated) {
      pendingStartRef.current = true
      try {
        await login()
      } catch {
        pendingStartRef.current = false
      }
      return
    }
    pendingStartRef.current = false
    await doRun()
  }, [running, agentIds.length, ready, authenticated, login, doRun])

  // If start() was called before Privy/wallet was ready, retry once it is.
  useEffect(() => {
    if (pendingStartRef.current && ready && authenticated && wallet) {
      pendingStartRef.current = false
      doRun()
    }
  }, [ready, authenticated, wallet, doRun])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    pendingStartRef.current = false
    setRunning(false)
    setComplete(false)
    setSummary(null)
    setPayments([])
    setAgents(makeInitial(agentIds))
  }, [idsKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return { agents, running, complete, summary, payments, start, reset }
}
