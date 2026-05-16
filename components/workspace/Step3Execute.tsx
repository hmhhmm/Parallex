'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { SkipForward } from 'lucide-react'
import type { AgentState } from '@/hooks/useWorkflow'

const NODES = [
  { id: 'task',     label: 'Your Task',       color: '#7c3aed', x: 50, y: 12 },
  { id: 'research', label: 'Research Analyst', color: '#3b82f6', x: 16, y: 46 },
  { id: 'data',     label: 'Data Processor',   color: '#7c3aed', x: 50, y: 46 },
  { id: 'writer',   label: 'Content Writer',   color: '#10b981', x: 84, y: 46 },
  { id: 'result',   label: 'Final Output',     color: '#f59e0b', x: 50, y: 80 },
]

const EDGES = [
  { from: 'task',     to: 'research' },
  { from: 'task',     to: 'data'     },
  { from: 'task',     to: 'writer'   },
  { from: 'research', to: 'result'   },
  { from: 'data',     to: 'result'   },
  { from: 'writer',   to: 'result'   },
]

const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]))

interface Props {
  agents: Record<string, AgentState>
  running: boolean
  complete: boolean
  onComplete: () => void
}

export default function Step3Execute({ agents, running, complete, onComplete }: Props) {
  const [elapsed, setElapsed] = useState(0)
  const [txCount, setTxCount] = useState(0)
  const startRef = useRef(Date.now())
  const doneRef  = useRef(false)

  // Tick elapsed time & derived tx count
  useEffect(() => {
    const id = setInterval(() => {
      const ms = Date.now() - startRef.current
      setElapsed(ms)
      setTxCount(Math.floor(ms / 420))
    }, 80)
    return () => clearInterval(id)
  }, [])

  // Auto-advance when SSE signals completion
  useEffect(() => {
    if (complete && !doneRef.current) {
      doneRef.current = true
      onComplete()
    }
  }, [complete, onComplete])

  const handleSkip = () => {
    if (!doneRef.current) { doneRef.current = true; onComplete() }
  }

  // Derive node active state from real agent statuses
  const isActive = (id: string) => {
    if (id === 'task') return running || complete
    if (id === 'result') return complete
    return (agents[id]?.status === 'running' || agents[id]?.status === 'paid')
  }

  // Merge all agent output lines into a flat log feed
  const logs = ['research', 'data', 'writer'].flatMap(id =>
    (agents[id]?.output ?? []).map(line => ({ line, color: nodeMap[id]?.color ?? '#fff' }))
  )

  const paidCount = Object.values(agents).filter(a => a.status === 'paid').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <p style={{ fontSize: 10, letterSpacing: '0.4em', color: '#7c3aed', textTransform: 'uppercase', marginBottom: 14, fontFamily: 'var(--font-space-grotesk)' }}>
        LIVE EXECUTION
      </p>
      <h1 style={{ fontSize: 32, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em', marginBottom: 8, fontFamily: 'var(--font-space-grotesk)' }}>
        Agents are working
      </h1>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', marginBottom: 20, fontFamily: 'var(--font-space-grotesk)' }}>
        Every action is recorded on-chain. Watch your team execute in real time.
      </p>

      {/* Node graph */}
      <div style={{ position: 'relative', width: '100%', paddingBottom: '48%', marginBottom: 16 }}>
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          {EDGES.map(({ from, to }) => {
            const f = nodeMap[from]
            const t = nodeMap[to]
            const active = isActive(from) && isActive(to)
            return (
              <line
                key={`${from}-${to}`}
                x1={f.x} y1={f.y} x2={t.x} y2={t.y}
                stroke={active ? f.color : 'rgba(255,255,255,0.06)'}
                strokeWidth={active ? 0.5 : 0.3}
                style={{ transition: 'stroke 0.6s ease' }}
              />
            )
          })}
        </svg>

        {NODES.map(node => {
          const on = isActive(node.id)
          return (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: `${node.x}%`, top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}
            >
              <motion.div
                animate={on ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={on ? { duration: 0.5, ease: 'easeOut' } : {}}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: on ? `${node.color}22` : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${on ? node.color : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: on ? `0 0 12px ${node.color}44` : 'none',
                  transition: 'border-color 0.4s ease, background 0.4s ease, box-shadow 0.4s ease',
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: on ? node.color : 'rgba(255,255,255,0.1)', transition: 'background 0.4s ease' }} />
              </motion.div>
              <span style={{ fontSize: 7, color: on ? '#fff' : 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-space-grotesk)', textAlign: 'center', maxWidth: 60, lineHeight: 1.3, transition: 'color 0.4s ease' }}>
                {node.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Live stats */}
      <div style={{
        display: 'flex', background: '#0d0d14',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12, overflow: 'hidden', marginBottom: 14,
      }}>
        {[
          { label: 'Elapsed',       value: `${(elapsed / 1000).toFixed(1)}s` },
          { label: 'Txns',          value: txCount.toString()                 },
          { label: 'Agents Paid',   value: `${paidCount} / 3`                },
        ].map((stat, i) => (
          <div key={stat.label} style={{
            flex: 1, padding: '10px 14px', textAlign: 'center',
            borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none',
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#a78bfa', fontFamily: 'monospace' }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', fontFamily: 'var(--font-space-grotesk)', marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Log feed from real SSE output */}
      <div style={{
        background: '#080810', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12, padding: '10px 14px', height: 96, overflowY: 'auto',
        marginBottom: 20, scrollbarWidth: 'none', fontFamily: 'monospace',
      }}>
        {logs.length === 0 ? (
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', margin: 0, lineHeight: 1.6 }}>
            Connecting to agents…
          </p>
        ) : (
          logs.map((entry, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}
            >
              <span style={{ color: entry.color, marginRight: 6 }}>›</span>{entry.line}
            </motion.p>
          ))
        )}
      </div>

      <button
        onClick={handleSkip}
        style={{
          width: '100%', height: 44, borderRadius: 12,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.35)', fontSize: 13, cursor: 'pointer',
          fontFamily: 'var(--font-space-grotesk)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
      >
        <SkipForward size={14} />
        Skip to results
      </button>
    </motion.div>
  )
}
