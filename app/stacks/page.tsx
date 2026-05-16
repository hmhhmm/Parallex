'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Play, Trash2, Sparkles, Bookmark } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loadStacks, deleteStack, type SavedStack } from '@/lib/stacks'
import { AGENT_LIBRARY } from '@/components/workflow/WorkflowBuilder'

const P = '#836EFB'
const L = '#CCFF00'

function timeAgo(ms: number): string {
  const diff = Date.now() - ms
  const s = Math.floor(diff / 1000)
  if (s < 60)    return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60)    return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)    return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30)    return `${d}d ago`
  return new Date(ms).toLocaleDateString()
}

export default function StacksPage() {
  const router = useRouter()
  const [stacks, setStacks] = useState<SavedStack[]>([])
  const [mounted, setMounted] = useState(false)

  // Defer reading localStorage to after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    setStacks(loadStacks())
  }, [])

  const refresh = useCallback(() => setStacks(loadStacks()), [])

  const handleUse = (stack: SavedStack) => {
    const params = new URLSearchParams()
    params.set('agents', stack.agentIds.join(','))
    params.set('stackId', stack.id)
    if (stack.intent) params.set('intent', stack.intent)
    router.push(`/workflow?${params.toString()}`)
  }

  const handleDelete = (stack: SavedStack) => {
    if (!confirm(`Delete "${stack.name}"?`)) return
    deleteStack(stack.id)
    refresh()
  }

  return (
    <main style={{
      width: '100vw', minHeight: '100vh',
      background: '#03020a', overflow: 'hidden auto',
      fontFamily: 'var(--font-space-grotesk)',
      paddingBottom: 80,
    }}>
      {/* Top bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        height: 54, padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(3,2,10,0.85)',
        borderBottom: '1px solid rgba(131,110,251,0.12)',
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/workflow" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 12 }}>
            <ArrowLeft size={14} />
            Back to builder
          </Link>
          <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.55em', textTransform: 'uppercase',
            background: `linear-gradient(to right, ${P}, #4f46e5)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>PARALLEX</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.2em' }}>MY STACKS</span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 999,
          background: 'rgba(131,110,251,0.08)',
          border: '1px solid rgba(131,110,251,0.25)',
        }}>
          <Bookmark size={12} color={P} fill={P} />
          <span style={{ fontSize: 11, color: '#fff', fontFamily: 'var(--font-space-grotesk)', fontWeight: 600 }}>
            {stacks.length} {stacks.length === 1 ? 'stack' : 'stacks'}
          </span>
        </div>
      </header>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <p style={{
            fontSize: 10, letterSpacing: '0.45em', color: P,
            textTransform: 'uppercase', marginBottom: 6,
            fontFamily: 'var(--font-space-grotesk)', fontWeight: 700,
          }}>
            COLLECTION
          </p>
          <h1 style={{
            fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em',
            margin: 0, fontFamily: 'var(--font-space-grotesk)',
          }}>
            Your saved agent pipelines
          </h1>
          <p style={{
            marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,0.4)',
            fontFamily: 'var(--font-space-grotesk)',
          }}>
            Each stack is a reusable AI workflow. Click <strong style={{ color: '#fff' }}>Use</strong> to run again.
          </p>
        </div>

        {!mounted ? (
          <EmptyShell label="Loading…" />
        ) : stacks.length === 0 ? (
          <EmptyShell label="No saved stacks yet.">
            <p style={{
              fontSize: 13, color: 'rgba(255,255,255,0.45)',
              fontFamily: 'var(--font-space-grotesk)', marginBottom: 14,
            }}>
              Build a pipeline on the workflow page, run it once, then save it here.
            </p>
            <Link
              href="/workflow"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 18px', borderRadius: 10,
                background: `linear-gradient(135deg, ${P}, #4f46e5)`,
                color: '#fff', textDecoration: 'none',
                fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
                fontFamily: 'var(--font-space-grotesk)',
              }}
            >
              <Sparkles size={13} />
              GO BUILD ONE
            </Link>
          </EmptyShell>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 16,
          }}>
            <AnimatePresence>
              {stacks.map(stack => (
                <StackCard
                  key={stack.id}
                  stack={stack}
                  onUse={() => handleUse(stack)}
                  onDelete={() => handleDelete(stack)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  )
}

function EmptyShell({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div style={{
      border: '1px dashed rgba(131,110,251,0.22)',
      borderRadius: 18, padding: '48px 24px',
      textAlign: 'center',
      background: 'rgba(131,110,251,0.03)',
    }}>
      <p style={{
        fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.6)',
        marginBottom: children ? 8 : 0,
        fontFamily: 'var(--font-space-grotesk)',
      }}>{label}</p>
      {children}
    </div>
  )
}

function StackCard({ stack, onUse, onDelete }: {
  stack: SavedStack
  onUse: () => void
  onDelete: () => void
}) {
  const agents = stack.agentIds
    .map(id => AGENT_LIBRARY.find(a => a.id === id))
    .filter((a): a is NonNullable<typeof a> => !!a)

  const totalCostMon = agents
    .reduce((s, a) => s + parseFloat(a.fee), 0)
    .toFixed(3)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      style={{
        background: 'rgba(131,110,251,0.04)',
        border: '1px solid rgba(131,110,251,0.18)',
        borderRadius: 16, padding: 18,
        display: 'flex', flexDirection: 'column', gap: 14,
        position: 'relative',
      }}
    >
      {/* Header: name + delete */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontSize: 16, fontWeight: 700, color: '#fff',
            margin: 0, letterSpacing: '-0.01em',
            fontFamily: 'var(--font-space-grotesk)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {stack.name}
          </h3>
          {stack.intent && (
            <p style={{
              fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0',
              fontFamily: 'var(--font-space-grotesk)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              &ldquo;{stack.intent}&rdquo;
            </p>
          )}
        </div>
        <button
          onClick={onDelete}
          title="Delete this stack"
          style={{
            background: 'none', border: 'none', padding: 4,
            color: 'rgba(255,255,255,0.3)', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#FF6B6B' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Agent chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {agents.map((a, i) => (
          <span
            key={i}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 8px', borderRadius: 999,
              background: `${a.color}15`,
              border: `1px solid ${a.color}40`,
              color: '#fff',
              fontSize: 10,
              fontFamily: 'var(--font-space-grotesk)',
              fontWeight: 600,
            }}
          >
            <span style={{ fontSize: 11 }}>{a.icon}</span>
            {a.name}
          </span>
        ))}
        {agents.length === 0 && (
          <span style={{
            fontSize: 11, color: 'rgba(255,107,107,0.7)',
            fontFamily: 'var(--font-space-grotesk)',
          }}>
            ⚠ Agents missing from library
          </span>
        )}
      </div>

      {/* Footer: meta + Use button */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-space-grotesk)', display: 'flex', gap: 10 }}>
          <span>≈ <strong style={{ color: '#fff' }}>{totalCostMon}</strong> MON</span>
          <span>·</span>
          <span>{stack.runCount} run{stack.runCount === 1 ? '' : 's'}</span>
          <span>·</span>
          <span title={new Date(stack.createdAt).toLocaleString()}>
            {stack.lastUsed ? timeAgo(stack.lastUsed) : timeAgo(stack.createdAt)}
          </span>
        </div>
        <button
          onClick={onUse}
          disabled={agents.length === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '7px 14px', borderRadius: 8,
            background: agents.length === 0
              ? 'rgba(255,255,255,0.05)'
              : `linear-gradient(135deg, ${L}, #a3e635)`,
            color: agents.length === 0 ? 'rgba(255,255,255,0.3)' : '#000',
            border: 'none',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
            cursor: agents.length === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-space-grotesk)',
          }}
        >
          <Play size={11} fill="currentColor" />
          USE
        </button>
      </div>
    </motion.div>
  )
}
