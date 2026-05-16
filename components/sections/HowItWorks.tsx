'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { MessageSquare, Cpu, Zap } from 'lucide-react'
import dynamic from 'next/dynamic'
import SectionAmbient from '@/components/ui/SectionAmbient'

const ParticleResidue = dynamic(() => import('@/components/ui/ParticleResidue'), { ssr: false })

const P = '#836EFB'
const L = '#CCFF00'

const STEPS = [
  {
    icon: MessageSquare,
    number: '01',
    title: 'Describe Your Task',
    description: 'Tell Parallex what you need in plain English. No technical setup, no configuration — just your intent.',
    color: P,
    tag: 'NATURAL LANGUAGE',
    detail: 'Parallex understands context, nuance, and nested goals — no prompting skills required.',
    terminal: [
      '> input: "research top DeFi protocols"',
      '> parsing intent…',
      '> context extracted ✓',
      '> routing to orchestrator…',
    ],
  },
  {
    icon: Cpu,
    number: '02',
    title: 'Agents Are Assembled',
    description: 'Our orchestrator selects the optimal agent team, builds the execution graph, and assigns roles — automatically.',
    color: '#00D1FF',
    tag: 'PARALLEL ORCHESTRATION',
    detail: 'Multiple specialist agents run concurrently. No bottlenecks. No single points of failure.',
    terminal: [
      '> agents selected: 3',
      '> Research Analyst  ↗ queued',
      '> Data Processor    ↗ queued',
      '> Content Writer    ↗ queued',
      '> escrow locked: 0.15 MON ✓',
    ],
  },
  {
    icon: Zap,
    number: '03',
    title: 'Executed On-Chain',
    description: "Agents execute in parallel on Monad's 10,000 TPS network. Every action, payment, and output is recorded on-chain.",
    color: L,
    tag: 'MONAD · 10,000 TPS',
    detail: 'Agent-to-agent micro-payments settle in milliseconds. Full audit trail, zero trust required.',
    terminal: [
      '> tx 0x7f3a… confirmed',
      '> agent_paid: Research  0.05 MON',
      '> agent_paid: Data      0.04 MON',
      '> agent_paid: Writer    0.06 MON',
      '> workflow_complete ✓',
    ],
  },
]

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState(0)
  const [terminalLines, setTerminalLines] = useState<string[]>([])

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  // Drive active step from scroll — no nested setState calls
  useEffect(() => {
    return scrollYProgress.on('change', v => {
      setActiveStep(v < 0.36 ? 0 : v < 0.70 ? 1 : 2)
    })
  }, [scrollYProgress])

  // Stream terminal lines on step change; cleanup clears any in-flight interval
  useEffect(() => {
    setTerminalLines([])
    const lines = STEPS[activeStep].terminal
    let i = 0
    const id = setInterval(() => {
      if (i < lines.length) {
        const line = lines[i]
        setTerminalLines(prev => [...prev, line])
        i++
      } else {
        clearInterval(id)
      }
    }, 420)
    return () => clearInterval(id)
  }, [activeStep])

  // Scroll-driven opacity/y for each step card
  const s0o = useTransform(scrollYProgress, [0, 0.08, 0.30, 0.40], [0, 1, 1, 0])
  const s0y = useTransform(scrollYProgress, [0, 0.08, 0.30, 0.40], [55, 0, 0, -55])
  const s1o = useTransform(scrollYProgress, [0.30, 0.42, 0.62, 0.72], [0, 1, 1, 0])
  const s1y = useTransform(scrollYProgress, [0.30, 0.42, 0.62, 0.72], [55, 0, 0, -55])
  const s2o = useTransform(scrollYProgress, [0.62, 0.74, 1.0], [0, 1, 1])
  const s2y = useTransform(scrollYProgress, [0.62, 0.74], [55, 0])
  const anims = [
    { opacity: s0o, y: s0y },
    { opacity: s1o, y: s1y },
    { opacity: s2o, y: s2y },
  ]

  const step = STEPS[activeStep]

  return (
    <div ref={containerRef} style={{ height: '300vh' }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
        <div className="absolute inset-0" style={{ background: 'rgba(3,2,10,0.95)' }} />
        <SectionAmbient variant="cyan" />
        <ParticleResidue variant="cyan" count={80} lineColor="131,110,251" />

        {/* Scroll progress bar */}
        <motion.div
          style={{
            position: 'absolute', top: 0, left: 0, height: 2, zIndex: 20,
            width: useTransform(scrollYProgress, [0, 1], ['0%', '100%']),
            background: `linear-gradient(to right, ${P}, #00D1FF, ${L})`,
          }}
        />

        {/* Giant background step number */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.2, y: -40 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(200px, 32vw, 420px)',
                fontWeight: 700,
                color: 'transparent',
                WebkitTextStroke: `1px ${step.color}15`,
                letterSpacing: '-0.06em',
                fontFamily: 'var(--font-space-grotesk)',
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              {step.number}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Two-column layout */}
        <div className="relative z-10 flex-1 flex items-center">
          <div style={{
            maxWidth: 1100, margin: '0 auto', padding: '0 40px', width: '100%',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center',
          }}>

            {/* Left — step content */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
                <div style={{ height: 1, width: 40, background: P, boxShadow: `0 0 8px ${P}` }} />
                <span style={{ fontSize: 9, letterSpacing: '0.5em', color: P, textTransform: 'uppercase', fontFamily: 'var(--font-space-grotesk)' }}>
                  HOW IT WORKS
                </span>
              </div>

              {/* Step pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
                {STEPS.map((s, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      width:     activeStep === i ? 32 : 8,
                      background: activeStep === i ? s.color : 'rgba(255,255,255,0.12)',
                      boxShadow: activeStep === i ? `0 0 12px ${s.color}` : 'none',
                    }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    style={{ height: 8, borderRadius: 4 }}
                  />
                ))}
              </div>

              {/* Step cards (absolutely stacked, driven by scroll) */}
              <div style={{ position: 'relative', minHeight: 280 }}>
                {STEPS.map((s, i) => {
                  const Icon = s.icon
                  const { opacity, y } = anims[i]
                  return (
                    <motion.div
                      key={i}
                      style={{
                        opacity, y,
                        position: 'absolute', top: 0, left: 0, right: 0,
                        pointerEvents: activeStep === i ? 'auto' : 'none',
                      }}
                    >
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 12px', borderRadius: 999,
                        background: `${s.color}14`, border: `1px solid ${s.color}30`,
                        marginBottom: 20,
                      }}>
                        <Icon size={11} color={s.color} />
                        <span style={{ fontSize: 9, color: s.color, letterSpacing: '0.25em', fontFamily: 'var(--font-space-grotesk)', textTransform: 'uppercase' }}>
                          {s.tag}
                        </span>
                      </div>

                      <h3 style={{
                        fontSize: 'clamp(30px, 4vw, 52px)', fontWeight: 700, color: '#fff',
                        letterSpacing: '-0.03em', marginBottom: 16,
                        fontFamily: 'var(--font-space-grotesk)', lineHeight: 1.05,
                      }}>
                        {s.title}
                      </h3>
                      <p style={{ fontSize: 16, lineHeight: 1.75, color: 'rgba(255,255,255,0.5)', marginBottom: 16, fontFamily: 'var(--font-space-grotesk)' }}>
                        {s.description}
                      </p>
                      <p style={{ fontSize: 13, lineHeight: 1.7, color: `${s.color}99`, fontFamily: 'var(--font-space-grotesk)' }}>
                        {s.detail}
                      </p>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Right — terminal panel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                style={{
                  background: 'rgba(0,0,0,0.6)',
                  border: `1px solid ${step.color}25`,
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: `0 0 40px ${step.color}10, inset 0 0 40px rgba(0,0,0,0.4)`,
                }}
              >
                {/* Title bar */}
                <div style={{
                  padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8,
                  background: `${step.color}08`, borderBottom: `1px solid ${step.color}18`,
                }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {['#FF5F56', '#FFBD2E', '#27C93F'].map(c => (
                      <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.8 }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 10, color: `${step.color}80`, fontFamily: 'monospace', marginLeft: 6, letterSpacing: '0.1em' }}>
                    parallex.terminal — step {step.number}
                  </span>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <motion.div
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      style={{ width: 6, height: 6, borderRadius: '50%', background: step.color }}
                    />
                    <span style={{ fontSize: 9, color: step.color, fontFamily: 'var(--font-space-grotesk)', letterSpacing: '0.15em' }}>LIVE</span>
                  </div>
                </div>

                {/* Output lines */}
                <div style={{ padding: '20px', minHeight: 200, fontFamily: 'monospace' }}>
                  {terminalLines.map((line, i) => (
                    <motion.div
                      key={`${activeStep}-${i}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        fontSize: 12, lineHeight: 1.9,
                        color: line.includes('✓')   ? step.color
                             : line.startsWith('>')  ? 'rgba(255,255,255,0.8)'
                             : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {line}
                    </motion.div>
                  ))}

                  {/* Blinking cursor while streaming */}
                  {terminalLines.length < step.terminal.length && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      style={{ display: 'inline-block', width: 8, height: 14, background: step.color, verticalAlign: 'middle' }}
                    />
                  )}
                </div>

                {/* Status bar */}
                <div style={{
                  padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  borderTop: `1px solid ${step.color}12`,
                }}>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                    STEP {activeStep + 1} OF 3
                  </span>
                  <span style={{ fontSize: 9, color: `${step.color}60`, fontFamily: 'var(--font-space-grotesk)', letterSpacing: '0.1em' }}>
                    SCROLL TO ADVANCE
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>
        </div>
      </div>
    </div>
  )
}
