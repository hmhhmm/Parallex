'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { Zap, DollarSign, Layers } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import SectionAmbient from '@/components/ui/SectionAmbient'
const ParticleResidue = dynamic(() => import('@/components/ui/ParticleResidue'), { ssr: false })

const P = '#836EFB'
const L = '#CCFF00'

function useCountUp(target: number, inView: boolean, duration = 2000) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    let raf: number
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(eased * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, duration])
  return value
}

interface Stat {
  icon: LucideIcon
  display: 'count' | 'text'
  countTarget?: number
  textValue?: string
  unit: string
  label: string
  sub: string
  color: string
}

const STATS: Stat[] = [
  {
    icon: Zap,
    display: 'count',
    countTarget: 10000,
    unit: 'TPS',
    label: 'Transactions per second',
    sub: '50× faster than Ethereum mainnet',
    color: P,
  },
  {
    icon: DollarSign,
    display: 'text',
    textValue: '<1¢',
    unit: 'Per Tx',
    label: 'Ultra-low gas cost',
    sub: 'Agent micro-payments are actually viable',
    color: '#00D1FF',
  },
  {
    icon: Layers,
    display: 'text',
    textValue: 'EVM',
    unit: 'Compatible',
    label: 'Drop-in for Ethereum',
    sub: 'All Solidity tools work out of the box',
    color: L,
  },
]

function TpsBar({ inView }: { inView: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 32, marginBottom: 8 }}>
      {Array.from({ length: 18 }, (_, i) => {
        const h = 20 + Math.sin(i * 0.8) * 10 + Math.random() * 8
        return (
          <motion.div
            key={i}
            initial={{ height: 4 }}
            animate={inView ? { height: h } : { height: 4 }}
            transition={{ delay: 0.6 + i * 0.04, duration: 0.5, ease: 'easeOut' }}
            style={{ width: 6, borderRadius: 2, background: P, opacity: 0.35 + (i / 18) * 0.65 }}
          />
        )
      })}
    </div>
  )
}

function StatCard({ stat, index, sectionInView }: { stat: Stat; index: number; sectionInView: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const cardInView = useInView(ref, { once: true, margin: '-60px' })
  const count = useCountUp(stat.countTarget ?? 0, sectionInView && cardInView)
  const Icon = stat.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={sectionInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.25 + index * 0.15, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: `rgba(255,255,255,0.02)`,
        border: `1px solid ${stat.color}20`,
        borderRadius: 16,
        padding: '28px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(to right, transparent, ${stat.color}50, transparent)`,
      }} />
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: '50%',
        background: `${stat.color}08`, filter: 'blur(30px)', pointerEvents: 'none',
      }} />

      {/* Icon + label row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${stat.color}14`, border: `1px solid ${stat.color}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={stat.color} strokeWidth={1.5} />
        </div>
        <div style={{
          fontSize: 9, color: `${stat.color}80`, letterSpacing: '0.25em',
          textTransform: 'uppercase', fontFamily: 'var(--font-space-grotesk)',
        }}>
          MONAD
        </div>
      </div>

      {/* Mini bar chart for TPS card */}
      {index === 0 && <TpsBar inView={sectionInView && cardInView} />}

      {/* Big number */}
      <div style={{
        fontSize: 'clamp(42px, 5.5vw, 72px)',
        fontWeight: 700, color: '#fff',
        lineHeight: 1, marginBottom: 6,
        letterSpacing: '-0.04em',
        fontFamily: 'var(--font-space-grotesk)',
        textShadow: `0 0 40px ${stat.color}25`,
      }}>
        {stat.display === 'count' ? count.toLocaleString() : stat.textValue}
      </div>

      {/* Unit */}
      <div style={{
        fontSize: 12, fontWeight: 600, color: stat.color,
        marginBottom: 6, letterSpacing: '0.2em',
        textTransform: 'uppercase', fontFamily: 'var(--font-space-grotesk)',
      }}>
        {stat.unit}
      </div>

      {/* Label */}
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-space-grotesk)', marginBottom: 10 }}>
        {stat.label}
      </div>

      {/* Sub-detail */}
      <div style={{
        fontSize: 11, color: `${stat.color}70`,
        fontFamily: 'var(--font-space-grotesk)', lineHeight: 1.5,
        padding: '8px 10px', borderRadius: 8,
        background: `${stat.color}08`, border: `1px solid ${stat.color}15`,
      }}>
        {stat.sub}
      </div>
    </motion.div>
  )
}

export default function WhyMonad() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="relative py-36 px-6">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(3,2,10,0.9), rgba(3,2,10,0.96), rgba(3,2,10,0.9))' }} />
      <SectionAmbient variant="blue" />
      <ParticleResidue variant="blue" count={70} lineColor="131,110,251" />

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 72 }}>
          <motion.div
            initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ height: 1, width: 48, background: P, boxShadow: `0 0 10px ${P}`, transformOrigin: 'left', marginBottom: 18 }}
          />
          <motion.p
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7 }}
            style={{ fontSize: 9, letterSpacing: '0.55em', color: P, textTransform: 'uppercase', marginBottom: 18, fontFamily: 'var(--font-space-grotesk)' }}
          >
            WHY MONAD
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.8 }}
            style={{
              fontSize: 'clamp(34px, 5.5vw, 70px)', fontWeight: 700, color: '#fff',
              textAlign: 'center', marginBottom: 20, letterSpacing: '-0.03em',
              textTransform: 'uppercase', fontFamily: 'var(--font-space-grotesk)', lineHeight: 1.0,
            }}
          >
            Built for speed.<br />Built for scale.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.25, duration: 0.8 }}
            style={{
              fontSize: 16, lineHeight: 1.8, color: 'rgba(255,255,255,0.4)',
              textAlign: 'center', maxWidth: 560,
              fontFamily: 'var(--font-space-grotesk)',
            }}
          >
            Monad&apos;s parallel execution engine processes 10,000 transactions per second —
            making real-time agent-to-agent payments not just possible, but instant.
          </motion.p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STATS.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} sectionInView={inView} />
          ))}
        </div>

        {/* Bottom comparison strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.7 }}
          style={{
            marginTop: 36,
            padding: '16px 24px',
            borderRadius: 12,
            background: 'rgba(131,110,251,0.05)',
            border: '1px solid rgba(131,110,251,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 16,
          }}
        >
          {[
            { chain: 'Ethereum', tps: '~15', color: '#627EEA' },
            { chain: 'Solana',   tps: '~2,000', color: '#9945FF' },
            { chain: 'Monad',    tps: '10,000+', color: L, highlight: true },
          ].map(row => (
            <div key={row.chain} style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 140 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: row.color, boxShadow: row.highlight ? `0 0 10px ${row.color}` : 'none' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontFamily: 'var(--font-space-grotesk)', minWidth: 72 }}>{row.chain}</span>
              <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: row.chain === 'Monad' ? '100%' : row.chain === 'Solana' ? '20%' : '0.15%' } : {}}
                  transition={{ delay: 0.9, duration: 1.2, ease: 'easeOut' }}
                  style={{ height: '100%', borderRadius: 2, background: row.color }}
                />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: row.highlight ? L : 'rgba(255,255,255,0.3)', fontFamily: 'monospace', minWidth: 60, textAlign: 'right' }}>
                {row.tps} TPS
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
