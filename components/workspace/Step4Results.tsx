'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, ExternalLink } from 'lucide-react'
import type { WorkflowSummary, PaymentEvent } from '@/hooks/useWorkflow'

const AGENT_NAMES: Record<string, string> = {
  research: 'Research Analyst',
  data:     'Data Processor',
  writer:   'Content Writer',
}

const AGENT_COLORS: Record<string, string> = {
  research: '#3b82f6',
  data:     '#7c3aed',
  writer:   '#10b981',
}

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles = Array.from({ length: 50 }, () => ({
      x: canvas.width / 2,
      y: canvas.height * 0.2,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 6 - 2,
      color: ['#7c3aed', '#4f46e5', '#a78bfa', '#34d399', '#fbbf24'][Math.floor(Math.random() * 5)],
      size: 4 + Math.random() * 5,
      gravity: 0.18,
      alpha: 1,
    }))

    let id: number
    function draw() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false
      for (const p of particles) {
        p.vy += p.gravity
        p.x  += p.vx
        p.y  += p.vy
        p.alpha -= 0.012
        if (p.alpha <= 0) continue
        alive = true
        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.rect(p.x, p.y, p.size, p.size * 0.5)
        ctx.fill()
        ctx.restore()
      }
      if (alive) id = requestAnimationFrame(draw)
    }
    id = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  )
}

function useCountUp(end: number, duration = 1200, decimals = 0) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => {
      const progress = Math.min((Date.now() - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setVal(end * eased)
      if (progress >= 1) clearInterval(id)
    }, 16)
    return () => clearInterval(id)
  }, [end, duration])
  return decimals > 0 ? val.toFixed(decimals) : Math.round(val).toString()
}

function StatCard({ label, value, color = '#a78bfa', delay = 0 }: { label: string; value: string; color?: string; delay?: number }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t) }, [delay])
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.35 }}
      style={{ flex: 1, textAlign: 'center', padding: '14px 10px', background: '#0d0d14', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: 'var(--font-space-grotesk)' }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-space-grotesk)', marginTop: 4 }}>{label}</div>
    </motion.div>
  )
}

interface Props {
  task: string
  summary: WorkflowSummary
  payments: PaymentEvent[]
  onRestart: () => void
}

export default function Step4Results({ task, summary, payments, onRestart }: Props) {
  const lastTxHash = payments[payments.length - 1]?.txHash ?? '—'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{ position: 'relative' }}
    >
      <Confetti />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <CheckCircle2 size={22} color="#34d399" />
        <p style={{ fontSize: 10, letterSpacing: '0.4em', color: '#34d399', textTransform: 'uppercase', fontFamily: 'var(--font-space-grotesk)', margin: 0 }}>
          TASK COMPLETE
        </p>
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em', marginBottom: 8, fontFamily: 'var(--font-space-grotesk)' }}>
        Your results are ready
      </h1>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', marginBottom: 20, fontFamily: 'var(--font-space-grotesk)', lineHeight: 1.55 }}>
        All outputs are stored on-chain. Your agents have been paid and escrow released.
      </p>

      {/* Task recap */}
      {task && (
        <div style={{
          padding: '10px 14px', borderRadius: 10,
          background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.18)',
          marginBottom: 16,
        }}>
          <p style={{ fontSize: 10, color: '#a78bfa', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 4px', fontFamily: 'var(--font-space-grotesk)' }}>Task</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: 0, fontFamily: 'var(--font-space-grotesk)', lineHeight: 1.5 }}>{task}</p>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <StatCard label="Total Cost"    value={`${summary.totalCost} MON`} color="#a78bfa" delay={0}   />
        <StatCard label="Duration"      value={summary.duration}            color="#a78bfa" delay={120} />
        <StatCard label="Transactions"  value={summary.txCount.toString()}  color="#a78bfa" delay={240} />
      </div>

      {/* Agent payments breakdown */}
      <div style={{
        background: '#080810', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12, padding: '10px 14px', marginBottom: 16,
      }}>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 10px', fontFamily: 'var(--font-space-grotesk)' }}>
          Agent Payments
        </p>
        {payments.length === 0 ? (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', margin: 0, fontFamily: 'var(--font-space-grotesk)' }}>No payments recorded.</p>
        ) : (
          payments.map((p, i) => (
            <motion.div
              key={p.txHash}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: i < payments.length - 1 ? 10 : 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: AGENT_COLORS[p.agentId] ?? '#a78bfa',
                  boxShadow: `0 0 6px ${AGENT_COLORS[p.agentId] ?? '#a78bfa'}`,
                }} />
                <span style={{ fontSize: 13, color: '#fff', fontFamily: 'var(--font-space-grotesk)' }}>
                  {AGENT_NAMES[p.agentId] ?? p.agentId}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#34d399', fontFamily: 'monospace' }}>{p.amount} MON</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>{p.txHash.slice(0, 20)}…</div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* On-chain proof */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderRadius: 12,
        background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.18)',
        marginBottom: 20,
      }}>
        <div>
          <p style={{ fontSize: 10, color: '#34d399', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 3px', fontFamily: 'var(--font-space-grotesk)' }}>On-chain proof</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, fontFamily: 'monospace' }}>{lastTxHash.slice(0, 30)}{lastTxHash.length > 30 ? '…' : ''}</p>
        </div>
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: '1px solid rgba(52,211,153,0.3)',
            borderRadius: 8, padding: '6px 12px',
            color: '#34d399', fontSize: 12, cursor: 'pointer',
            fontFamily: 'var(--font-space-grotesk)',
          }}
        >
          <ExternalLink size={12} />
          Monad Explorer
        </button>
      </div>

      {/* New task */}
      <motion.button
        whileHover={{ scale: 1.01, filter: 'brightness(1.1)' }}
        whileTap={{ scale: 0.99 }}
        onClick={onRestart}
        style={{
          width: '100%', height: 52, borderRadius: 12,
          background: 'linear-gradient(to right, #7c3aed, #4f46e5)',
          border: 'none', color: '#fff',
          fontSize: 15, fontWeight: 600, cursor: 'pointer',
          fontFamily: 'var(--font-space-grotesk)',
        }}
      >
        Start a new task →
      </motion.button>
    </motion.div>
  )
}
