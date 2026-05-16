'use client'

import { Check } from 'lucide-react'

const STEPS = ['Describe', 'Agents', 'Execute', 'Results']

interface Props { step: number }

export default function Topbar({ step }: Props) {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        backdropFilter: 'blur(20px)',
        background: 'rgba(0,0,0,0.65)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Logo */}
      <span style={{
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.5em',
        background: 'linear-gradient(to right, #7c3aed, #4f46e5)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontFamily: 'var(--font-space-grotesk)',
        userSelect: 'none',
      }}>
        PARALLEX
      </span>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {STEPS.map((label, i) => {
          const n = i + 1
          const done   = step > n
          const active = step === n
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
              {/* Connector line before (not for first) */}
              {i > 0 && (
                <div style={{
                  width: 36,
                  height: 1,
                  background: '#1e1e2e',
                  position: 'relative',
                  overflow: 'hidden',
                  marginTop: 14,
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    height: '100%',
                    width: step > i ? '100%' : '0%',
                    background: '#34d399',
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              )}

              {/* Step */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  background: done   ? 'rgba(52,211,153,0.18)'
                             : active ? '#7c3aed'
                             : '#1a1a2e',
                  border: `1px solid ${done   ? 'rgba(52,211,153,0.45)'
                                      : active ? '#7c3aed'
                                      : '#1e1e2e'}`,
                  color: done   ? '#34d399'
                        : active ? '#fff'
                        : 'rgba(255,255,255,0.2)',
                }}>
                  {done ? <Check size={12} /> : n}
                </div>
                <span style={{
                  fontSize: 10,
                  marginTop: 4,
                  letterSpacing: '0.04em',
                  fontFamily: 'var(--font-space-grotesk)',
                  transition: 'color 0.3s ease',
                  color: done   ? '#34d399'
                        : active ? '#a78bfa'
                        : 'rgba(255,255,255,0.22)',
                }}>
                  {label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Wallet badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        borderRadius: 999,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#34d399',
          boxShadow: '0 0 6px #34d399',
          animation: 'walletPulse 2s ease-in-out infinite',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>0x4a3b…f92c</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.9)', fontFamily: 'var(--font-space-grotesk)' }}>2.84 MON</span>
      </div>

      <style>{`
        @keyframes walletPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 6px #34d399; }
          50%       { opacity: 0.55; box-shadow: 0 0 2px #34d399; }
        }
      `}</style>
    </header>
  )
}
