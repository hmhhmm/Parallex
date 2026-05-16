'use client'

import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Clock } from 'lucide-react'
import type { AgentDef } from './WorkflowBuilder'
import type { AgentState, WorkflowSummary } from '@/hooks/useWorkflow'

const P = '#836EFB'
const L = '#CCFF00'

interface Props {
  workflow: AgentDef[]
  agents: Record<string, AgentState>
  complete: boolean
  summary: WorkflowSummary | null
  cardRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
}

export default function ExecutionTimeline({ workflow, agents, complete, summary, cardRefs }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 14 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 9, letterSpacing: '0.45em', color: L, textTransform: 'uppercase', margin: '0 0 4px', fontFamily: 'var(--font-space-grotesk)' }}>
            EXECUTION TIMELINE
          </p>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: 0, fontFamily: 'var(--font-space-grotesk)', letterSpacing: '-0.02em' }}>
            {complete ? 'Workflow complete' : 'Live execution feed'}
          </h2>
        </div>
        {complete && summary && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, background: 'rgba(204,255,0,0.1)', border: '1px solid rgba(204,255,0,0.3)' }}>
            <CheckCircle2 size={13} color={L} />
            <span style={{ fontSize: 11, color: L, fontFamily: 'var(--font-space-grotesk)', fontWeight: 600 }}>SUCCESS</span>
          </div>
        )}
      </div>

      {/* Cards */}
      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {workflow.length === 0 ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: 200, color: 'rgba(255,255,255,0.15)', fontSize: 12,
            fontFamily: 'var(--font-space-grotesk)', gap: 8,
          }}>
            <Clock size={14} />
            Waiting for workflow…
          </div>
        ) : (
          workflow.map((agent, i) => {
            const state = agents[agent.id] ?? { id: agent.id, status: 'idle' as const, output: [] }
            return (
              <ExecutionCard
                key={agent.id}
                agent={agent}
                state={state}
                index={i}
                refCallback={el => { cardRefs.current[agent.id] = el }}
              />
            )
          })
        )}
      </div>

      {/* Summary strip — AnimatePresence is safe here (top-level, no ref conflicts) */}
      <AnimatePresence>
        {complete && summary && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 1, borderRadius: 12, overflow: 'hidden',
              border: `1px solid rgba(204,255,0,0.2)`,
            }}
          >
            {[
              { label: 'Total Cost', value: `${summary.totalCost} MON` },
              { label: 'Duration',   value: summary.duration           },
              { label: 'Txns',       value: summary.txCount.toString() },
              { label: 'Monad TPS',  value: summary.tps               },
            ].map((s, i) => (
              <div key={s.label} style={{
                padding: '10px 12px',
                background: i === 3 ? 'rgba(204,255,0,0.08)' : 'rgba(131,110,251,0.08)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: i === 3 ? L : P, fontFamily: 'var(--font-space-grotesk)' }}>{s.value}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-space-grotesk)', marginTop: 3, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  )
}

function ExecutionCard({
  agent, state, index, refCallback,
}: {
  agent: AgentDef
  state: AgentState
  index: number
  refCallback: (el: HTMLDivElement | null) => void
}) {
  const outputRef = useRef<HTMLDivElement>(null)
  const status = state.status

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [state.output])

  const borderColor =
    status === 'running' ? agent.color :
    status === 'paid'    ? L :
    'rgba(255,255,255,0.07)'

  const glowColor =
    status === 'running' ? `${agent.color}40` :
    status === 'paid'    ? 'rgba(204,255,0,0.25)' :
    'transparent'

  return (
    <motion.div
      ref={refCallback}
      animate={
        status === 'running'
          ? { boxShadow: [`0 0 0px ${glowColor}`, `0 0 20px ${glowColor}`, `0 0 0px ${glowColor}`] }
          : { boxShadow: status === 'paid' ? '0 0 16px rgba(204,255,0,0.2)' : 'none' }
      }
      transition={
        status === 'running'
          ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.4 }
      }
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${borderColor}`,
        borderRadius: 14,
        padding: '13px 15px',
        transition: 'border-color 0.4s ease, opacity 0.4s ease',
        opacity: status === 'idle' ? 0.4 : 1,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: state.output.length > 0 ? 10 : 0 }}>

        {/* Pulsing status dot */}
        <div style={{ position: 'relative', width: 10, height: 10, flexShrink: 0 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: status === 'running' ? agent.color : status === 'paid' ? L : 'rgba(255,255,255,0.15)',
          }} />
          {status === 'running' && (
            <motion.div
              animate={{ scale: [1, 2.2], opacity: [0.8, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: agent.color }}
            />
          )}
        </div>

        <span style={{ fontSize: 16 }}>{agent.icon}</span>

        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', fontFamily: 'var(--font-space-grotesk)' }}>
            {agent.name}
          </span>
        </div>

        {/* Status badge */}
        {status === 'running' && (
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ fontSize: 9, color: agent.color, fontFamily: 'var(--font-space-grotesk)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            RUNNING
          </motion.span>
        )}
        {status === 'paid' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 9, color: L, fontFamily: 'var(--font-space-grotesk)', letterSpacing: '0.1em' }}>PAID</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: L, fontFamily: 'monospace' }}>{state.amount} MON</span>
          </div>
        )}
        {status === 'idle' && (
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-space-grotesk)', letterSpacing: '0.1em' }}>QUEUED</span>
        )}
      </div>

      {/* Terminal output — no AnimatePresence needed; motion.div handles enter animation alone */}
      {state.output.length > 0 && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.25 }}
          ref={outputRef}
          style={{
            background: 'rgba(0,0,0,0.4)', borderRadius: 8,
            padding: '8px 10px', maxHeight: 110, overflowY: 'auto',
            scrollbarWidth: 'none', fontFamily: 'monospace',
          }}
        >
          {state.output.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                fontSize: 10, lineHeight: 1.65,
                color: i === state.output.length - 1 ? '#fff' : 'rgba(255,255,255,0.5)',
              }}
            >
              <span style={{ color: agent.color, marginRight: 6 }}>›</span>{line}
            </motion.div>
          ))}
          {status === 'running' && (
            <span style={{
              display: 'inline-block', width: 6, height: 10,
              background: agent.color, marginLeft: 2, verticalAlign: 'middle',
              animation: 'blink 1s step-end infinite',
            }} />
          )}
        </motion.div>
      )}

      {/* Tx hash */}
      {status === 'paid' && state.txHash && (
        <div style={{ marginTop: 8, fontSize: 9, color: 'rgba(204,255,0,0.45)', fontFamily: 'monospace', letterSpacing: '0.03em' }}>
          TX {state.txHash.slice(0, 28)}…
        </div>
      )}
    </motion.div>
  )
}
