'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

const PROMPTS = [
  'Research the top 5 DeFi protocols by TVL…',
  'Write and deploy a simple smart contract…',
  'Translate this content into Bahasa Melayu…',
  'Analyse market trends and write a report…',
]

const CHIPS = [
  { label: 'Research DeFi protocols',  full: 'Research the top 5 DeFi protocols by TVL and summarise key metrics including fees, growth, and risks.' },
  { label: 'Smart contract',           full: 'Write and deploy a simple ERC-20 smart contract on Monad testnet with mint and transfer functions.' },
  { label: 'Translate to Bahasa',      full: 'Translate this technical whitepaper into Bahasa Melayu, preserving all technical terminology accurately.' },
  { label: 'Market analysis',          full: 'Analyse current crypto market trends and write an executive report with actionable insights.' },
  { label: 'Write documentation',      full: 'Write clear, comprehensive developer documentation for my Solidity smart contract with examples.' },
  { label: 'Data report',              full: 'Process this on-chain dataset and generate a structured analytics report with charts and key findings.' },
]

interface Props { onComplete: (task: string) => void }

export default function Step1Describe({ onComplete }: Props) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)

  // Typewriter state
  const [display, setDisplay] = useState('')
  const [pidx, setPidx]       = useState(0)
  const [deleting, setDeleting] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const target = PROMPTS[pidx]
    const clear = () => { if (timer.current) clearTimeout(timer.current) }

    if (!deleting) {
      if (display.length < target.length) {
        timer.current = setTimeout(() => setDisplay(target.slice(0, display.length + 1)), 45)
      } else {
        timer.current = setTimeout(() => setDeleting(true), 2200)
      }
    } else {
      if (display.length > 0) {
        timer.current = setTimeout(() => setDisplay(d => d.slice(0, -1)), 18)
      } else {
        setDeleting(false)
        setPidx(p => (p + 1) % PROMPTS.length)
      }
    }
    return clear
  }, [display, deleting, pidx])

  const canSubmit = value.trim().length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <p style={{ fontSize: 10, letterSpacing: '0.4em', color: '#7c3aed', textTransform: 'uppercase', marginBottom: 14, fontFamily: 'var(--font-space-grotesk)' }}>
        NEW TASK
      </p>
      <h1 style={{ fontSize: 32, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em', marginBottom: 8, fontFamily: 'var(--font-space-grotesk)' }}>
        What do you need done?
      </h1>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)', marginBottom: 18, fontFamily: 'var(--font-space-grotesk)' }}>
        Plain English. No code. No blockchain knowledge needed.
      </p>

      {/* Typewriter */}
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.22)', marginBottom: 20, minHeight: 20, fontFamily: 'var(--font-space-grotesk)' }}>
        {display}
        <span style={{ display: 'inline-block', width: 2, height: 13, background: '#7c3aed', marginLeft: 2, verticalAlign: 'middle', animation: 'blink 1s step-end infinite' }} />
      </p>

      {/* Input box */}
      <div style={{
        background: '#0d0d14',
        border: `1px solid ${focused ? 'rgba(124,58,237,0.55)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        boxShadow: focused ? '0 0 0 3px rgba(124,58,237,0.12)' : 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}>
        <textarea
          value={value}
          onChange={e => setValue(e.target.value.slice(0, 300))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Describe your task here…"
          style={{
            width: '100%', height: 72, background: 'transparent', border: 'none', outline: 'none',
            color: '#fff', fontSize: 14, fontFamily: 'var(--font-space-grotesk)', resize: 'none', lineHeight: 1.65,
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-space-grotesk)' }}>or try an example ↓</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>{value.length} / 300</span>
        </div>
      </div>

      {/* Chips */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 28, scrollbarWidth: 'none' }}>
        {CHIPS.map(c => (
          <button
            key={c.label}
            onClick={() => setValue(c.full)}
            style={{
              flexShrink: 0, padding: '6px 12px', borderRadius: 999,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.55)', fontSize: 11, cursor: 'pointer',
              fontFamily: 'var(--font-space-grotesk)', transition: 'all 0.15s ease', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; e.currentTarget.style.color = '#c4b5fd' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* CTA */}
      <motion.button
        whileHover={canSubmit ? { scale: 1.01, filter: 'brightness(1.1)' } : {}}
        whileTap={canSubmit ? { scale: 0.99 } : {}}
        onClick={() => canSubmit && onComplete(value)}
        style={{
          width: '100%', height: 52, borderRadius: 12,
          background: canSubmit ? 'linear-gradient(to right, #7c3aed, #4f46e5)' : 'rgba(255,255,255,0.06)',
          border: 'none', color: canSubmit ? '#fff' : 'rgba(255,255,255,0.25)',
          fontSize: 15, fontWeight: 600, cursor: canSubmit ? 'pointer' : 'not-allowed',
          fontFamily: 'var(--font-space-grotesk)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'background 0.25s ease',
        }}
      >
        <Sparkles size={17} />
        Find my agents →
      </motion.button>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </motion.div>
  )
}
