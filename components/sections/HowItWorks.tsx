'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { MessageSquare, Cpu, Zap } from 'lucide-react'
import Link from 'next/link'
import { GetStartedButton } from '@/components/ui/get-started-button'

const P = '#836EFB'
const C = '#00D1FF'
const L = '#CCFF00'

const STEPS = [
  {
    icon: MessageSquare,
    number: '01',
    title: 'Describe Your Task',
    description: 'Tell Parallex what you need in plain English. Just your intent.',
    color: P,
    tag: 'NATURAL LANGUAGE',
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
    description: 'Orchestrator picks the optimal team and assigns roles — automatically.',
    color: C,
    tag: 'PARALLEL ORCHESTRATION',
    terminal: [
      '> agents selected: 3',
      '> Research Analyst  ↗ queued',
      '> Data Processor    ↗ queued',
      '> escrow locked: 0.15 MON ✓',
    ],
  },
  {
    icon: Zap,
    number: '03',
    title: 'Executed On-Chain',
    description: "Agents run in parallel on Monad's 10,000 TPS. Every output recorded on-chain.",
    color: L,
    tag: 'MONAD · 10,000 TPS',
    terminal: [
      '> tx 0x7f3a… confirmed',
      '> agent_paid: Research  0.05 MON',
      '> agent_paid: Writer    0.06 MON',
      '> workflow_complete ✓',
    ],
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
    },
  },
}

const EASE = [0.16, 1, 0.3, 1] as const

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE },
  },
}

const headerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

export default function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="relative py-32 px-6" style={{ background: 'rgba(3,2,10,0.97)' }}>
      {/* Grid bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(131,110,251,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(131,110,251,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      <div ref={ref} className="relative max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          className="flex flex-col items-center mb-16"
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.p
            variants={headerVariants}
            style={{ fontSize: 9, letterSpacing: '0.5em', color: P, textTransform: 'uppercase', marginBottom: 14, fontFamily: 'var(--font-space-grotesk)' }}
          >
            HOW IT WORKS
          </motion.p>
          <motion.h2
            variants={headerVariants}
            style={{
              fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 700, color: '#fff',
              textAlign: 'center', letterSpacing: '-0.03em',
              fontFamily: 'var(--font-space-grotesk)', lineHeight: 1.1, marginBottom: 12,
            }}
          >
            From intent to on-chain output.
          </motion.h2>
          <motion.p
            variants={headerVariants}
            style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontFamily: 'var(--font-space-grotesk)' }}
          >
            Three steps. Fully automated. Verifiable on Monad.
          </motion.p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16"
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                variants={cardVariants}
                className="group flex flex-col"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${step.color}20`,
                  borderRadius: 20,
                  padding: '28px 24px',
                  overflow: 'hidden',
                  transition: 'border-color 0.4s ease, background 0.4s ease',
                }}
                whileHover={{
                  borderColor: `${step.color}50`,
                  backgroundColor: 'rgba(255,255,255,0.035)',
                }}
              >
                {/* Icon + tag */}
                <div className="flex items-start justify-between mb-6">
                  <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: `${step.color}18`,
                    border: `1px solid ${step.color}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={26} color={step.color} strokeWidth={1.5} />
                  </div>
                  <div style={{
                    padding: '5px 11px', borderRadius: 999,
                    background: `${step.color}12`, border: `1px solid ${step.color}30`,
                  }}>
                    <span style={{ fontSize: 9, color: step.color, letterSpacing: '0.2em', fontFamily: 'var(--font-space-grotesk)', textTransform: 'uppercase', fontWeight: 600 }}>
                      {step.tag}
                    </span>
                  </div>
                </div>

                {/* Text */}
                <h3 style={{
                  fontSize: 24, fontWeight: 700, color: '#fff',
                  letterSpacing: '-0.02em', marginBottom: 10,
                  fontFamily: 'var(--font-space-grotesk)', lineHeight: 1.2,
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.4)',
                  fontFamily: 'var(--font-space-grotesk)', marginBottom: 20,
                }}>
                  {step.description}
                </p>

                {/* Terminal */}
                <div className="mt-auto" style={{
                  background: 'rgba(0,0,0,0.5)',
                  border: `1px solid ${step.color}15`,
                  borderRadius: 10, overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 6,
                    background: `${step.color}08`, borderBottom: `1px solid ${step.color}10`,
                  }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {['#FF5F56', '#FFBD2E', '#27C93F'].map(c => (
                        <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c, opacity: 0.7 }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 9, color: `${step.color}60`, fontFamily: 'monospace', marginLeft: 4, letterSpacing: '0.08em' }}>
                      parallex.terminal — step {step.number}
                    </span>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                        style={{ width: 5, height: 5, borderRadius: '50%', background: step.color }}
                      />
                      <span style={{ fontSize: 8, color: step.color, letterSpacing: '0.12em', fontFamily: 'var(--font-space-grotesk)' }}>LIVE</span>
                    </div>
                  </div>
                  <div style={{ padding: '14px 16px', fontFamily: 'monospace' }}>
                    {step.terminal.map((line, i) => (
                      <div key={i} style={{
                        fontSize: 12, lineHeight: 1.85,
                        color: line.includes('✓') ? step.color
                          : line.startsWith('>') ? 'rgba(255,255,255,0.78)'
                          : 'rgba(255,255,255,0.35)',
                      }}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.75, duration: 0.7 }}
          className="flex flex-col items-center gap-3"
        >
          <Link href="/workspace">
            <GetStartedButton />
          </Link>
        </motion.div>

      </div>
    </section>
  )
}
