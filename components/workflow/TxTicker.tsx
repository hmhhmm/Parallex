'use client'

import { useEffect, useRef, useState } from 'react'

const L = '#CCFF00'

function randomHash() {
  return '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

function randomAmount() {
  return (Math.random() * 0.1 + 0.01).toFixed(4)
}

const TYPES = ['TRANSFER', 'SWAP', 'STAKE', 'EXEC', 'DEPLOY', 'SETTLE', 'BRIDGE']

interface Tx {
  id: number
  hash: string
  amount: string
  type: string
}

let _id = 0

interface Props { active: boolean }

export default function TxTicker({ active }: Props) {
  // Seed empty so server-rendered HTML matches the first client render.
  // Math.random() during initial render causes a hydration mismatch.
  const [txs, setTxs] = useState<Tx[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Populate the initial 12 rows on the client only (post-hydration).
  useEffect(() => {
    setTxs(Array.from({ length: 12 }, () => ({
      id:     _id++,
      hash:   randomHash(),
      amount: randomAmount(),
      type:   TYPES[Math.floor(Math.random() * TYPES.length)],
    })))
  }, [])

  useEffect(() => {
    const rate = active ? 120 : 600

    intervalRef.current = setInterval(() => {
      const count = active ? 3 : 1
      setTxs(prev => {
        const next = [...prev]
        for (let i = 0; i < count; i++) {
          next.push({
            id:     _id++,
            hash:   randomHash(),
            amount: randomAmount(),
            type:   TYPES[Math.floor(Math.random() * TYPES.length)],
          })
        }
        return next.slice(-40)  // keep last 40
      })
    }, rate)

    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [active])

  const trackRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.scrollLeft = trackRef.current.scrollWidth
    }
  }, [txs])

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
      height: 36,
      background: 'rgba(0,0,0,0.85)',
      borderTop: `1px solid ${active ? `rgba(204,255,0,0.25)` : 'rgba(131,110,251,0.15)'}`,
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', gap: 0,
      overflow: 'hidden',
      transition: 'border-color 0.4s ease',
    }}>
      {/* Label */}
      <div style={{
        flexShrink: 0,
        padding: '0 12px',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        {active && (
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: L,
            boxShadow: `0 0 6px ${L}`,
            animation: 'tpulse 0.8s ease-in-out infinite',
            flexShrink: 0,
          }} />
        )}
        <span style={{ fontSize: 9, letterSpacing: '0.35em', color: active ? L : 'rgba(131,110,251,0.7)', fontFamily: 'var(--font-space-grotesk)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          MONAD MAINNET
        </span>
      </div>

      {/* Scrolling txs */}
      <div
        ref={trackRef}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 0,
          overflowX: 'hidden',
          animation: `ticker-scroll ${active ? '8s' : '20s'} linear infinite`,
        }}
      >
        {txs.map(tx => (
          <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 18px', flexShrink: 0 }}>
            <span style={{ fontSize: 9, color: active ? L : '#836EFB', fontFamily: 'var(--font-space-grotesk)', fontWeight: 700, letterSpacing: '0.05em' }}>
              {tx.type}
            </span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
              {tx.hash.slice(0, 14)}…
            </span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>
              {tx.amount} MON
            </span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.1)', fontFamily: 'monospace' }}>·</span>
          </div>
        ))}
      </div>

      {/* TPS counter */}
      <div style={{
        flexShrink: 0, padding: '0 12px',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: active ? L : '#836EFB', fontFamily: 'var(--font-space-grotesk)', lineHeight: 1 }}>
          {active ? '10,000+' : '9,847'}
        </span>
        <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-space-grotesk)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>TPS</span>
      </div>

      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0) }
          to   { transform: translateX(-50%) }
        }
        @keyframes tpulse {
          0%,100% { opacity: 1; box-shadow: 0 0 6px #CCFF00 }
          50%      { opacity: 0.5; box-shadow: 0 0 2px #CCFF00 }
        }
      `}</style>
    </div>
  )
}
