'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { Zap, DollarSign, Layers } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const P = '#836EFB'
const L = '#CCFF00'
const C = '#00D1FF'

function useCountUp(target: number, inView: boolean, duration = 2200) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    let raf: number
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 4)
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
  tag: string
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
    tag: 'THROUGHPUT',
  },
  {
    icon: DollarSign,
    display: 'text',
    textValue: '<1¢',
    unit: 'Per Tx',
    label: 'Ultra-low gas cost',
    sub: 'Agent micro-payments are actually viable',
    color: C,
    tag: 'GAS COST',
  },
  {
    icon: Layers,
    display: 'text',
    textValue: 'EVM',
    unit: 'Compatible',
    label: 'Drop-in for Ethereum',
    sub: 'All Solidity tools work out of the box',
    color: L,
    tag: 'COMPATIBILITY',
  },
]

const CHAINS = [
  { chain: 'Ethereum', tps: '~15',     color: '#627EEA', width: '0.15%' },
  { chain: 'Solana',   tps: '~2,000',  color: '#9945FF', width: '20%'   },
  { chain: 'Monad',    tps: '10,000+', color: L,         width: '100%', highlight: true },
]

function TpsBar({ inView }: { inView: boolean }) {
  const heights = [22, 28, 18, 32, 24, 30, 20, 34, 26, 32, 18, 28, 24, 30, 22, 36, 26, 30]
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', height: 36, marginBottom: 12 }}>
      {heights.map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 3, opacity: 0 }}
          animate={inView ? { height: h, opacity: 0.3 + (i / heights.length) * 0.7 } : {}}
          transition={{ delay: 0.5 + i * 0.035, duration: 0.5, ease: EASE }}
          style={{ width: 5, borderRadius: 2, background: `linear-gradient(to top, ${P}40, ${P})` }}
        />
      ))}
    </div>
  )
}

const EASE = [0.16, 1, 0.3, 1] as const

const cardVariants = {
  hidden: { opacity: 0, y: 48, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: 0.2 + i * 0.15, duration: 0.8, ease: EASE },
  }),
}

function StatCard({ stat, index, inView }: { stat: Stat; index: number; inView: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const cardInView = useInView(ref, { once: true, margin: '-40px' })
  const count = useCountUp(stat.countTarget ?? 0, inView && cardInView)
  const Icon = stat.icon

  return (
    <motion.div
      ref={ref}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
      style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        padding: '1px',
        background: `linear-gradient(135deg, ${stat.color}30, transparent 60%)`,
      }}
    >
      {/* Inner card */}
      <div style={{
        background: 'rgba(8,7,20,0.92)',
        borderRadius: 19,
        padding: '28px 26px 24px',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Corner glow */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 160, height: 160, borderRadius: '50%',
          background: `${stat.color}10`, filter: 'blur(40px)',
          pointerEvents: 'none',
        }} />

        {/* Top stripe */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(to right, transparent, ${stat.color}60, transparent)`,
        }} />

        {/* Icon + tag */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `${stat.color}15`,
            border: `1px solid ${stat.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={20} color={stat.color} strokeWidth={1.5} />
          </div>
          <span style={{
            fontSize: 8, color: `${stat.color}70`, letterSpacing: '0.3em',
            textTransform: 'uppercase', fontFamily: 'var(--font-space-grotesk)', fontWeight: 600,
          }}>
            {stat.tag}
          </span>
        </div>

        {/* TPS bar (first card only) */}
        {index === 0 && <TpsBar inView={inView && cardInView} />}

        {/* Big value */}
        <div style={{
          fontSize: 'clamp(48px, 5.5vw, 76px)',
          fontWeight: 800, color: '#fff',
          lineHeight: 1, letterSpacing: '-0.05em',
          fontFamily: 'var(--font-space-grotesk)',
          marginBottom: 4,
          textShadow: `0 0 60px ${stat.color}30`,
        }}>
          {stat.display === 'count' ? count.toLocaleString() : stat.textValue}
        </div>

        {/* Unit */}
        <div style={{
          fontSize: 11, fontWeight: 700, color: stat.color,
          letterSpacing: '0.25em', textTransform: 'uppercase',
          fontFamily: 'var(--font-space-grotesk)', marginBottom: 4,
        }}>
          {stat.unit}
        </div>

        {/* Label */}
        <div style={{
          fontSize: 12, color: 'rgba(255,255,255,0.3)',
          fontFamily: 'var(--font-space-grotesk)', marginBottom: 18,
        }}>
          {stat.label}
        </div>

        {/* Sub pill */}
        <div style={{
          fontSize: 11, color: `${stat.color}80`,
          fontFamily: 'var(--font-space-grotesk)',
          padding: '7px 12px', borderRadius: 8,
          background: `${stat.color}08`,
          border: `1px solid ${stat.color}18`,
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: stat.color, flexShrink: 0 }} />
          {stat.sub}
        </div>
      </div>
    </motion.div>
  )
}

export default function WhyMonad() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="relative py-36 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(3,2,10,0.95) 0%, rgba(5,3,18,0.98) 50%, rgba(3,2,10,0.95) 100%)' }} />

      {/* Center radial glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 30%, ${P}0A 0%, transparent 70%)`,
        }}
      />

      {/* Subtle grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(131,110,251,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(131,110,251,0.025) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      <div className="relative max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          className="flex flex-col items-center mb-20"
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.p
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
            style={{ fontSize: 9, letterSpacing: '0.55em', color: P, textTransform: 'uppercase', marginBottom: 16, fontFamily: 'var(--font-space-grotesk)' }}
          >
            WHY MONAD
          </motion.p>

          <motion.h2
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } } }}
            style={{
              fontSize: 'clamp(36px, 5.5vw, 72px)', fontWeight: 800, color: '#fff',
              textAlign: 'center', letterSpacing: '-0.04em', textTransform: 'uppercase',
              fontFamily: 'var(--font-space-grotesk)', lineHeight: 1.0, marginBottom: 20,
            }}
          >
            Built for speed.<br />Built for scale.
          </motion.h2>

          <motion.p
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.8 } } }}
            style={{
              fontSize: 15, lineHeight: 1.8, color: 'rgba(255,255,255,0.35)',
              textAlign: 'center', maxWidth: 480, fontFamily: 'var(--font-space-grotesk)',
            }}
          >
            10,000 TPS. Real-time agent payments. Fully on-chain.
          </motion.p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {STATS.map((stat, i) => (
            <StatCard key={i} stat={stat} index={i} inView={inView} />
          ))}
        </div>

        {/* Chain comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.85, duration: 0.7 }}
          style={{
            borderRadius: 14,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '20px 28px',
            display: 'flex', flexDirection: 'column', gap: 14,
          }}
        >
          {CHAINS.map((row, i) => (
            <div key={row.chain} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                background: row.color,
                boxShadow: row.highlight ? `0 0 10px ${row.color}` : 'none',
              }} />
              <span style={{
                fontSize: 12, color: row.highlight ? '#fff' : 'rgba(255,255,255,0.35)',
                fontFamily: 'var(--font-space-grotesk)', width: 80, flexShrink: 0,
                fontWeight: row.highlight ? 600 : 400,
              }}>
                {row.chain}
              </span>
              <div style={{ flex: 1, height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={inView ? { width: row.width } : {}}
                  transition={{ delay: 1 + i * 0.15, duration: 1.4, ease: EASE }}
                  style={{ height: '100%', borderRadius: 99, background: row.color }}
                />
              </div>
              <span style={{
                fontSize: 12, fontFamily: 'monospace', width: 80, textAlign: 'right', flexShrink: 0,
                color: row.highlight ? L : 'rgba(255,255,255,0.25)',
                fontWeight: row.highlight ? 700 : 400,
              }}>
                {row.tps} TPS
              </span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
