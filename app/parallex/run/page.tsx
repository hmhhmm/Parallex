'use client'

/**
 * Workflow Runner — minimal end-to-end demo page.
 *
 * Hand this off to the frontend dev as a reference implementation.
 * They can replace the bare-bones JSX with the polished Parallex theme.
 *
 * What this page proves works:
 * - Privy login + wallet connection on Monad Testnet
 * - Reading registered agents from on-chain registry
 * - Composing a hybrid sequential/parallel workflow
 * - Paying escrow tx via user wallet
 * - Subscribing to SSE stream from /api/workflow
 * - Live agent text streaming token-by-token
 * - On-chain payment confirmation with block numbers
 * - "X txs in same block" parallel-execution flex metric
 */

import { useEffect, useState } from 'react'
import { useWorkflow, type AgentInfo, type WorkflowStep } from '@/lib/useWorkflow'

export default function RunPage() {
  const { run, authenticated, ready, walletAddress, login, loadAgents, startWorkflow, reset } =
    useWorkflow()

  const [agents, setAgents] = useState<AgentInfo[]>([])
  const [task, setTask] = useState('Find the best mamak in PJ')
  const [steps, setSteps] = useState<WorkflowStep[]>([
    { agentIds: [0, 4] }, // Research + Translator in parallel
    { agentIds: [2] },    // Then Content Writer
  ])

  useEffect(() => {
    loadAgents().then(setAgents).catch(console.error)
  }, [loadAgents])

  const agentPrices = Object.fromEntries(
    agents.map(a => [a.id, BigInt(a.pricePerTask)])
  )

  const totalCost = steps
    .flatMap(s => s.agentIds)
    .reduce((sum, id) => sum + (agentPrices[id] ?? 0n), 0n)

  const totalCostMon = Number(totalCost) / 1e18

  return (
    <main style={{ padding: 32, fontFamily: 'monospace', color: '#eee', background: '#0a0612', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 28, marginBottom: 8, color: '#836EFB' }}>Parallex / Workflow Runner</h1>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 12 }}>
        Demo page — replace with the polished UI. Backend integration via{' '}
        <code>useWorkflow()</code>.
      </p>

      {/* Wallet status */}
      <Section title="Wallet">
        {!ready ? (
          <p>Initializing Privy...</p>
        ) : !authenticated ? (
          <button onClick={login} style={btnStyle}>
            Connect Wallet
          </button>
        ) : (
          <p>Connected: {walletAddress}</p>
        )}
      </Section>

      {/* Agent list */}
      <Section title={`Agents (${agents.length})`}>
        {agents.length === 0 ? (
          <p style={{ color: '#888' }}>Loading agents from chain...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
            {agents.map(a => (
              <div key={a.id} style={{ border: '1px solid #333', padding: 8, fontSize: 11 }}>
                <div style={{ fontWeight: 600 }}>[{a.id}] {a.name}</div>
                <div style={{ color: '#888' }}>{a.specialty}</div>
                <div style={{ color: '#836EFB' }}>
                  {(Number(a.pricePerTask) / 1e18).toFixed(4)} MON
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Task + workflow composition */}
      <Section title="Task">
        <textarea
          value={task}
          onChange={e => setTask(e.target.value)}
          style={{ ...inputStyle, height: 60 }}
          disabled={run.status === 'running' || run.status === 'started'}
        />
      </Section>

      <Section title="Workflow Steps">
        <p style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
          Each step runs sequentially. Agents within a step run in parallel — and their on-chain
          payments fire in parallel too (= the Monad flex moment).
        </p>
        {steps.map((step, i) => (
          <div key={i} style={{ marginBottom: 8, padding: 8, border: '1px dashed #444' }}>
            <div style={{ fontSize: 11, color: '#836EFB', marginBottom: 4 }}>
              Step {i + 1} — agents in parallel:
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {step.agentIds.map((id, j) => (
                <span key={j} style={{ padding: '2px 8px', background: '#222', fontSize: 11 }}>
                  {agents.find(a => a.id === id)?.name ?? `Agent ${id}`}
                </span>
              ))}
            </div>
          </div>
        ))}
        <p style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
          Total cost: <strong>{totalCostMon.toFixed(4)} MON</strong>
        </p>
      </Section>

      {/* Run button */}
      <Section title="Execute">
        {run.status === 'idle' ? (
          <button
            onClick={() => startWorkflow({ task, steps }, agentPrices).catch(console.error)}
            style={{ ...btnStyle, opacity: authenticated ? 1 : 0.5 }}
            disabled={!authenticated}
          >
            ▶ Run Workflow
          </button>
        ) : run.status === 'complete' || run.status === 'error' ? (
          <button onClick={reset} style={btnStyle}>
            ↺ Reset
          </button>
        ) : (
          <p style={{ color: '#FFD700' }}>Status: {run.status}</p>
        )}
        {run.workflowId && (
          <p style={{ fontSize: 11, color: '#888', marginTop: 8 }}>
            Workflow ID on-chain: <code>{run.workflowId}</code>
          </p>
        )}
      </Section>

      {/* Live execution view */}
      {run.status !== 'idle' && (
        <Section title="Live Execution">
          {run.steps.map((step, sIdx) => (
            <div key={sIdx} style={{ marginBottom: 16, padding: 12, border: '1px solid #333' }}>
              <div style={{ fontSize: 12, color: '#836EFB', marginBottom: 8 }}>
                Step {sIdx + 1} — {step.status}
                {step.txsInSameBlock !== undefined && step.txsInSameBlock > 1 && (
                  <span style={{ marginLeft: 12, color: '#00FFAA' }}>
                    🚀 {step.txsInSameBlock} txs landed in same block
                  </span>
                )}
              </div>
              {Object.values(run.agents)
                .filter(a => step.agentIds.includes(a.agentId))
                .map(a => (
                  <AgentCard key={a.agentIndex} agent={a} agents={agents} />
                ))}
            </div>
          ))}

          {run.status === 'complete' && (
            <div style={{ marginTop: 16, padding: 16, border: '1px solid #00FFAA' }}>
              <div style={{ fontSize: 12, color: '#00FFAA', marginBottom: 8 }}>
                ✓ Workflow Complete — Final Output
              </div>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{run.finalOutput}</pre>
            </div>
          )}

          {run.status === 'error' && (
            <div style={{ marginTop: 16, padding: 16, border: '1px solid #FF5577', color: '#FF5577' }}>
              <div style={{ fontSize: 12, marginBottom: 8 }}>✗ Error</div>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11 }}>{run.error}</pre>
            </div>
          )}
        </Section>
      )}
    </main>
  )
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2
        style={{
          fontSize: 11,
          letterSpacing: '0.2em',
          color: '#836EFB',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function AgentCard({
  agent,
  agents,
}: {
  agent: ReturnType<typeof useWorkflow>['run']['agents'][number]
  agents: AgentInfo[]
}) {
  const def = agents.find(a => a.id === agent.agentId)
  const statusColor = {
    idle: '#666',
    thinking: '#FFD700',
    streaming: '#00D1FF',
    done: '#888',
    paid: '#00FFAA',
    error: '#FF5577',
  }[agent.status]

  return (
    <div
      style={{
        marginBottom: 8,
        padding: 8,
        border: `1px solid ${statusColor}`,
        background: 'rgba(0,0,0,0.4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          marginBottom: 4,
        }}
      >
        <span style={{ color: statusColor }}>
          [{agent.agentIndex}] {def?.name ?? `Agent ${agent.agentId}`} — {agent.status}
        </span>
        {agent.blockNumber && (
          <span style={{ color: '#00FFAA' }}>
            block #{agent.blockNumber}
            {agent.latencyMs && ` (${agent.latencyMs}ms)`}
          </span>
        )}
      </div>
      <pre
        style={{
          fontSize: 11,
          whiteSpace: 'pre-wrap',
          margin: 0,
          color: '#ccc',
          minHeight: 20,
        }}
      >
        {agent.output || (agent.status === 'thinking' ? '...' : '')}
      </pre>
      {agent.txHash && agent.txHash !== '0x' && (
        <a
          href={`https://testnet.monadexplorer.com/tx/${agent.txHash}`}
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: 10, color: '#836EFB', textDecoration: 'none' }}
        >
          {agent.txHash.slice(0, 10)}...{agent.txHash.slice(-6)} ↗
        </a>
      )}
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  padding: '10px 20px',
  background: 'rgba(131, 110, 251, 0.2)',
  border: '1px solid #836EFB',
  color: '#fff',
  cursor: 'pointer',
  fontFamily: 'monospace',
  fontSize: 12,
  letterSpacing: '0.1em',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 8,
  background: '#1a0e2a',
  border: '1px solid #444',
  color: '#eee',
  fontFamily: 'monospace',
  fontSize: 12,
}
