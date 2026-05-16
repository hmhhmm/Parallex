'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useInView } from 'framer-motion'
import { Search, Code2, PenTool, Database, Languages, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import SectionAmbient from '@/components/ui/SectionAmbient'
const ParticleResidue = dynamic(() => import('@/components/ui/ParticleResidue'), { ssr: false })

const P = '#836EFB'
const L = '#CCFF00'

interface Agent {
  icon: LucideIcon
  name: string
  specialty: string
  tags: string[]
  price: string
  color: string
  jobs: string
  rating: string
  featured?: boolean
}

const AGENTS: Agent[] = [
  {
    icon: Search,
    name: 'Research Analyst',
    specialty: 'Intelligence Gathering',
    tags: ['web research', 'data gathering', 'summarization'],
    price: '0.8 MON',
    color: P,
    jobs: '3.2k',
    rating: '4.9',
    featured: true,
  },
  {
    icon: Code2,
    name: 'Code Engineer',
    specialty: 'On-Chain Development',
    tags: ['smart contracts', 'debugging', 'architecture'],
    price: '2.4 MON',
    color: '#00D1FF',
    jobs: '1.8k',
    rating: '4.8',
  },
  {
    icon: PenTool,
    name: 'Content Writer',
    specialty: 'Narrative Intelligence',
    tags: ['copywriting', 'tech writing', 'docs'],
    price: '0.6 MON',
    color: L,
    jobs: '4.1k',
    rating: '4.9',
  },
  {
    icon: Database,
    name: 'Data Processor',
    specialty: 'Pattern Recognition',
    tags: ['CSV analysis', 'pattern recognition', 'reporting'],
    price: '1.2 MON',
    color: P,
    jobs: '2.6k',
    rating: '4.7',
  },
  {
    icon: Languages,
    name: 'Translator',
    specialty: 'Multilingual Ops',
    tags: ['multilingual', 'localization', 'content'],
    price: '0.4 MON',
    color: '#00D1FF',
    jobs: '5.9k',
    rating: '4.9',
  },
  {
    icon: TrendingUp,
    name: 'Strategy Advisor',
    specialty: 'Market Intelligence',
    tags: ['market analysis', 'competitive research', 'planning'],
    price: '3.2 MON',
    color: L,
    jobs: '0.9k',
    rating: '4.8',
  },
]

function AgentCard({ agent, index }: { agent: Agent; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const springRx = useSpring(rx, { stiffness: 220, damping: 22 })
  const springRy = useSpring(ry, { stiffness: 220, damping: 22 })
  const glowX = useMotionValue(50)
  const glowY = useMotionValue(50)

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    rx.set((y - 0.5) * -12)
    ry.set((x - 0.5) * 12)
    glowX.set(x * 100)
    glowY.set(y * 100)
  }

  function onMouseLeave() {
    rx.set(0); ry.set(0)
    glowX.set(50); glowY.set(50)
  }

  const Icon = agent.icon
  const slideFrom = index % 3 === 0 ? -20 : index % 3 === 2 ? 20 : 0

  return (
    <div style={{ perspective: 900 }}>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 40, x: slideFrom }}
        whileInView={{ opacity: 1, y: 0, x: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ delay: index * 0.08, duration: 0.75, ease: [0.16, 1, 0.3, 1] as const }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="group relative cursor-none overflow-hidden"
        style={{
          rotateX: springRx,
          rotateY: springRy,
          transformStyle: 'preserve-3d',
          background: agent.featured ? `rgba(131,110,251,0.06)` : 'rgba(255,255,255,0.02)',
          border: agent.featured ? `1px solid ${P}30` : '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14,
          padding: '22px 20px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'border-color 0.3s ease',
        }}
      >
        {/* Mouse-follow glow */}
        <motion.div
          style={{
            position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
            background: `radial-gradient(circle at ${glowX.get()}% ${glowY.get()}%, ${agent.color}14 0%, transparent 65%)`,
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
        {/* Inner glow border on hover */}
        <div className="absolute inset-0 rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ boxShadow: `inset 0 0 0 1px ${agent.color}35` }} />

        {/* Top row: icon + status + featured */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 10,
            background: `${agent.color}12`, border: `1px solid ${agent.color}28`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={20} color={agent.color} strokeWidth={1.5} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            {/* Online dot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399' }}
              />
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-space-grotesk)', letterSpacing: '0.1em' }}>ONLINE</span>
            </div>
            {agent.featured && (
              <div style={{
                padding: '2px 8px', borderRadius: 4,
                background: `${P}20`, border: `1px solid ${P}40`,
                fontSize: 8, color: P, letterSpacing: '0.12em',
                fontFamily: 'var(--font-space-grotesk)', textTransform: 'uppercase',
              }}>
                ★ TOP AGENT
              </div>
            )}
          </div>
        </div>

        {/* Name + specialty */}
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 3, letterSpacing: '-0.01em', fontFamily: 'var(--font-space-grotesk)' }}>
          {agent.name}
        </h3>
        <p style={{ fontSize: 10, color: agent.color, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14, fontFamily: 'var(--font-space-grotesk)', opacity: 0.9 }}>
          {agent.specialty}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {agent.tags.map((tag, j) => (
            <span key={j} style={{
              fontSize: 9, padding: '3px 9px', borderRadius: 4,
              background: `${agent.color}0A`, border: `1px solid ${agent.color}20`,
              color: 'rgba(255,255,255,0.45)', letterSpacing: '0.04em',
              fontFamily: 'var(--font-space-grotesk)',
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', marginBottom: 14 }} />

        {/* Footer row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: 'var(--font-space-grotesk)' }}>per task</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-space-grotesk)', letterSpacing: '-0.01em' }}>{agent.price}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#fbbf24', fontFamily: 'var(--font-space-grotesk)' }}>★ {agent.rating}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-space-grotesk)' }}>{agent.jobs} jobs</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function MarketplacePreview() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="relative py-36 px-6">
      <div className="absolute inset-0" style={{ background: 'rgba(3,2,10,0.88)' }} />
      <SectionAmbient variant="magenta" />
      <ParticleResidue variant="magenta" count={80} lineColor="131,110,251" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 64 }}>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as const }}
            style={{ height: 1, width: 48, background: P, boxShadow: `0 0 10px ${P}`, transformOrigin: 'left', marginBottom: 18 }}
          />
          <motion.p
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.7 }}
            style={{ fontSize: 9, letterSpacing: '0.55em', color: P, textTransform: 'uppercase', marginBottom: 18, fontFamily: 'var(--font-space-grotesk)' }}
          >
            THE AGENT MARKETPLACE
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.8 }}
            style={{
              fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 700, color: '#fff',
              textAlign: 'center', letterSpacing: '-0.03em', textTransform: 'uppercase',
              fontFamily: 'var(--font-space-grotesk)', lineHeight: 1.0, marginBottom: 12,
            }}
          >
            Specialized agents.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
            style={{
              fontSize: 'clamp(22px, 3vw, 40px)', fontWeight: 300, color: 'rgba(255,255,255,0.3)',
              textAlign: 'center', letterSpacing: '-0.02em',
              fontFamily: 'var(--font-space-grotesk)', marginBottom: 28,
            }}
          >
            Infinite combinations.
          </motion.p>

          {/* Live count badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.35, duration: 0.5 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 999,
              background: 'rgba(204,255,0,0.07)', border: '1px solid rgba(204,255,0,0.2)',
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: 7, height: 7, borderRadius: '50%', background: L, boxShadow: `0 0 8px ${L}` }}
            />
            <span style={{ fontSize: 11, color: L, fontFamily: 'var(--font-space-grotesk)', fontWeight: 600 }}>
              247 agents live on Monad
            </span>
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AGENTS.map((agent, i) => (
            <AgentCard key={i} agent={agent} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
