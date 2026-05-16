'use client'

import dynamic from 'next/dynamic'
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import WorkflowBuilder, { type AgentDef } from '@/components/workflow/WorkflowBuilder'
import ExecutionTimeline from '@/components/workflow/ExecutionTimeline'
import TxTicker from '@/components/workflow/TxTicker'
import { useWorkflow } from '@/hooks/useWorkflow'

const PaymentParticleEffect = dynamic(
  () => import('@/components/workflow/PaymentParticleEffect'),
  { ssr: false }
)

const P = '#836EFB'
const L = '#CCFF00'

// Lightweight star-field background
const StarField = dynamic(() => import('@/components/workflow/StarField'), { ssr: false })

export default function WorkflowPage() {
  const [workflow, setWorkflow] = useState<AgentDef[]>([])

  const agentIds = workflow.map(a => a.id)
  const { agents, running, complete, summary, payments, start, reset } = useWorkflow(agentIds)

  const cardRefs  = useRef<Record<string, HTMLDivElement | null>>({})
  const vaultRef  = useRef<HTMLDivElement | null>(null)

  const handleRun = useCallback(() => {
    if (workflow.length === 0) return
    start()
  }, [workflow.length, start])

  const handleReset = useCallback(() => {
    reset()
  }, [reset])

  const activePayments = running || complete

  return (
    <main style={{
      width: '100vw', minHeight: '100vh',
      background: '#03020a',
      overflow: 'hidden',
      fontFamily: 'var(--font-space-grotesk)',
    }}>
      {/* Particle background */}
      <StarField />

      {/* Payment coins overlay */}
      <PaymentParticleEffect payments={payments} cardRefs={cardRefs} vaultRef={vaultRef} />

      {/* Ticker */}
      <TxTicker active={activePayments} />

      {/* ── Top bar ────────────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 54, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        background: 'rgba(3,2,10,0.8)',
        borderBottom: '1px solid rgba(131,110,251,0.12)',
        backdropFilter: 'blur(16px)',
      }}>
        {/* Left: back + brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: 12 }}>
            <ArrowLeft size={14} />
          </Link>
          <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.55em', textTransform: 'uppercase',
            background: `linear-gradient(to right, ${P}, #4f46e5)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>PARALLEX</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em' }}>COMMAND CENTER</span>
        </div>

        {/* Center: status */}
        <AnimatePresence mode="wait">
          {running && (
            <motion.div key="running" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ width: 7, height: 7, borderRadius: '50%', background: L }}
              />
              <span style={{ fontSize: 11, color: L, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Live execution</span>
            </motion.div>
          )}
          {complete && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(204,255,0,0.1)', border: `1px solid rgba(204,255,0,0.3)` }}
            >
              <Zap size={12} color={L} />
              <span style={{ fontSize: 11, color: L, fontWeight: 700, letterSpacing: '0.1em' }}>COMPLETE</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right: vault */}
        <div
          ref={vaultRef}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 999,
            background: running ? 'rgba(204,255,0,0.08)' : 'rgba(131,110,251,0.08)',
            border: `1px solid ${running ? 'rgba(204,255,0,0.3)' : 'rgba(131,110,251,0.25)'}`,
            transition: 'all 0.5s ease',
          }}
        >
          <span style={{ fontSize: 14 }}>🏛️</span>
          <div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>VAULT</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: running ? L : P }}>2.84 MON</div>
          </div>
        </div>
      </header>

      {/* ── Main split layout ─────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 16,
        padding: '78px 24px 52px',
        minHeight: '100vh',
        maxWidth: 1280,
        margin: '0 auto',
      }}>

        {/* Left: Workflow Builder */}
        <div style={{
          background: 'rgba(131,110,251,0.04)',
          border: '1px solid rgba(131,110,251,0.14)',
          borderRadius: 20,
          padding: '22px 20px',
          backdropFilter: 'blur(24px)',
          display: 'flex', flexDirection: 'column',
          minHeight: 500,
        }}>
          <WorkflowBuilder
            workflow={workflow}
            onWorkflowChange={setWorkflow}
            onRun={handleRun}
            onReset={handleReset}
            running={running}
            complete={complete}
          />
        </div>

        {/* Right: Execution Timeline */}
        <div style={{
          background: 'rgba(204,255,0,0.02)',
          border: `1px solid ${running || complete ? 'rgba(204,255,0,0.14)' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: 20,
          padding: '22px 20px',
          backdropFilter: 'blur(24px)',
          display: 'flex', flexDirection: 'column',
          minHeight: 500,
          transition: 'border-color 0.5s ease',
        }}>
          <ExecutionTimeline
            workflow={workflow}
            agents={agents}
            complete={complete}
            summary={summary}
            cardRefs={cardRefs}
          />
        </div>
      </div>

      {/* Corner grid decorations */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(131,110,251,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(131,110,251,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }} />

      {/* Corner brackets */}
      <CornerBrackets />
    </main>
  )
}

function CornerBrackets() {
  const s = (pos: React.CSSProperties): React.CSSProperties => ({
    position: 'fixed', width: 28, height: 28, zIndex: 20, pointerEvents: 'none', ...pos,
  })
  const lineH: React.CSSProperties = { position: 'absolute', height: 2, width: 28, background: 'rgba(131,110,251,0.4)' }
  const lineV: React.CSSProperties = { position: 'absolute', width: 2, height: 28, background: 'rgba(131,110,251,0.4)' }
  return (
    <>
      <div style={s({ top: 62, left: 16 })}>
        <div style={{ ...lineH, top: 0, left: 0 }} /><div style={{ ...lineV, top: 0, left: 0 }} />
      </div>
      <div style={s({ top: 62, right: 16 })}>
        <div style={{ ...lineH, top: 0, right: 0 }} /><div style={{ ...lineV, top: 0, right: 0 }} />
      </div>
      <div style={s({ bottom: 44, left: 16 })}>
        <div style={{ ...lineH, bottom: 0, left: 0 }} /><div style={{ ...lineV, bottom: 0, left: 0 }} />
      </div>
      <div style={s({ bottom: 44, right: 16 })}>
        <div style={{ ...lineH, bottom: 0, right: 0 }} /><div style={{ ...lineV, bottom: 0, right: 0 }} />
      </div>
    </>
  )
}
