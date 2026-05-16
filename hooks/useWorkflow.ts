import { useState, useCallback, useRef, useEffect } from 'react'

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

function makeInitial(ids: string[]): Record<string, AgentState> {
  return Object.fromEntries(
    ids.map(id => [id, { id, status: 'idle' as AgentStatus, output: [] }])
  )
}

export function useWorkflow(agentIds: string[]) {
  const idsKey = agentIds.join(',')

  const [agents,   setAgents]   = useState<Record<string, AgentState>>(() => makeInitial(agentIds))
  const [running,  setRunning]  = useState(false)
  const [complete, setComplete] = useState(false)
  const [summary,  setSummary]  = useState<WorkflowSummary | null>(null)
  const [payments, setPayments] = useState<PaymentEvent[]>([])

  const esRef = useRef<EventSource | null>(null)

  // Reset state whenever the workflow composition changes
  useEffect(() => {
    esRef.current?.close()
    setRunning(false)
    setComplete(false)
    setSummary(null)
    setPayments([])
    setAgents(makeInitial(agentIds))
  }, [idsKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const start = useCallback(() => {
    if (running) return

    setAgents(makeInitial(agentIds))
    setComplete(false)
    setSummary(null)
    setPayments([])
    setRunning(true)

    const es = new EventSource('/api/workflow')
    esRef.current = es

    es.addEventListener('step_start', e => {
      const { agentId } = JSON.parse((e as MessageEvent).data)
      setAgents(prev => {
        if (!prev[agentId]) return prev
        return { ...prev, [agentId]: { ...prev[agentId], status: 'running' } }
      })
    })

    es.addEventListener('agent_output', e => {
      const { agentId, text } = JSON.parse((e as MessageEvent).data)
      setAgents(prev => {
        const agent = prev[agentId]
        if (!agent) return prev
        return {
          ...prev,
          [agentId]: { ...agent, output: [...agent.output, text] },
        }
      })
    })

    es.addEventListener('agent_paid', e => {
      const { agentId, amount, txHash } = JSON.parse((e as MessageEvent).data)
      setAgents(prev => {
        if (!prev[agentId]) return prev
        return { ...prev, [agentId]: { ...prev[agentId], status: 'paid', txHash, amount } }
      })
      setPayments(prev => [...prev, { agentId, amount, txHash, ts: Date.now() }])
    })

    es.addEventListener('workflow_complete', e => {
      setSummary(JSON.parse((e as MessageEvent).data))
      setComplete(true)
      setRunning(false)
      es.close()
    })

    es.onerror = () => {
      setRunning(false)
      es.close()
    }
  }, [running, idsKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const reset = useCallback(() => {
    esRef.current?.close()
    setRunning(false)
    setComplete(false)
    setSummary(null)
    setPayments([])
    setAgents(makeInitial(agentIds))
  }, [idsKey]) // eslint-disable-line react-hooks/exhaustive-deps

  return { agents, running, complete, summary, payments, start, reset }
}
