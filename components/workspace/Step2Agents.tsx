'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Zap, Loader2 } from 'lucide-react'

const AGENTS = [
  {
    id: 'research',
    name: 'Research Analyst',
    role: 'Finds, filters, and synthesises on-chain data',
    fee: '0.05 MON',
    dotColor: '#3b82f6',
    orbColor: 'rgba(59,130,246,0.15)',
    orbBorder: 'rgba(59,130,246,0.35)',
    skills: ['DeFi analytics', 'Protocol research', 'Risk assessment'],
    rating: 4.9,
    jobs: '2.4k',
  },
  {
    id: 'data',
    name: 'Data Processor',
    role: 'Structures raw data into clean, usable formats',
    fee: '0.04 MON',
    dotColor: '#7c3aed',
    orbColor: 'rgba(124,58,237,0.15)',
    orbBorder: 'rgba(124,58,237,0.35)',
    skills: ['Data cleaning', 'Schema mapping', 'Report generation'],
    rating: 4.8,
    jobs: '1.8k',
  },
  {
    id: 'writer',
    name: 'Content Writer',
    role: 'Turns structured findings into polished prose',
    fee: '0.06 MON',
    dotColor: '#10b981',
    orbColor: 'rgba(16,185,129,0.15)',
    orbBorder: 'rgba(16,185,129,0.35)',
    skills: ['Technical writing', 'Localisation', 'Executive summaries'],
    rating: 4.9,
    jobs: '3.1k',
  },
]

interface Props { onComplete: () => void }

export default function Step2Agents({ onComplete }: Props) {
  const [locking, setLocking] = useState(false)

  const handleStart = () => {
    if (locking) return
    setLocking(true)
    // 1.2s escrow UX delay, then parent starts the real SSE connection
    setTimeout(onComplete, 1200)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <p style={{ fontSize: 10, letterSpacing: '0.4em', color: '#7c3aed', textTransform: 'uppercase', marginBottom: 14, fontFamily: 'var(--font-space-grotesk)' }}>
        AUTO-SELECTED FOR YOUR TASK
      </p>
      <h1 style={{ fontSize: 32, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em', marginBottom: 8, fontFamily: 'var(--font-space-grotesk)' }}>
        Meet your team
      </h1>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', marginBottom: 24, fontFamily: 'var(--font-space-grotesk)' }}>
        3 specialist agents picked by Parallex. Each has its own wallet on Monad.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        {AGENTS.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.35, ease: 'easeOut' }}
            style={{
              background: '#0d0d14', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '14px 16px',
              display: 'flex', alignItems: 'flex-start', gap: 14,
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: agent.orbColor, border: `1px solid ${agent.orbBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: agent.dotColor, boxShadow: `0 0 8px ${agent.dotColor}` }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#fff', fontFamily: 'var(--font-space-grotesk)' }}>{agent.name}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: agent.dotColor, fontFamily: 'var(--font-space-grotesk)' }}>{agent.fee}</span>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)', marginBottom: 8, fontFamily: 'var(--font-space-grotesk)', lineHeight: 1.4 }}>
                {agent.role}
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {agent.skills.map(s => (
                  <span key={s} style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 999,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-space-grotesk)',
                  }}>{s}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: '#fbbf24', fontFamily: 'var(--font-space-grotesk)' }}>★ {agent.rating}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-space-grotesk)' }}>{agent.jobs} jobs</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 16px', borderRadius: 12,
        background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.18)',
        marginBottom: 20,
      }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-space-grotesk)' }}>Total estimate</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#a78bfa', fontFamily: 'var(--font-space-grotesk)' }}>0.15 MON</span>
      </div>

      <motion.button
        whileHover={!locking ? { scale: 1.01, filter: 'brightness(1.1)' } : {}}
        whileTap={!locking ? { scale: 0.99 } : {}}
        onClick={handleStart}
        disabled={locking}
        style={{
          width: '100%', height: 52, borderRadius: 12,
          background: locking ? 'rgba(124,58,237,0.35)' : 'linear-gradient(to right, #7c3aed, #4f46e5)',
          border: 'none', color: '#fff',
          fontSize: 15, fontWeight: 600, cursor: locking ? 'wait' : 'pointer',
          fontFamily: 'var(--font-space-grotesk)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'background 0.25s ease',
        }}
      >
        {locking ? (
          <>
            <Loader2 size={17} style={{ animation: 'spin 0.8s linear infinite' }} />
            Locking escrow on Monad…
          </>
        ) : (
          <>
            <Zap size={17} />
            Start — 0.15 MON
          </>
        )}
      </motion.button>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </motion.div>
  )
}
