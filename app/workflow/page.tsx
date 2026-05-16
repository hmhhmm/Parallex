'use client'

import dynamic from 'next/dynamic'
import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, ArrowLeft, Wallet, Sparkles, Bookmark, FolderOpen, Check } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import WorkflowBuilder, { type AgentDef, AGENT_LIBRARY } from '@/components/workflow/WorkflowBuilder'
import ExecutionTimeline from '@/components/workflow/ExecutionTimeline'
import TxTicker from '@/components/workflow/TxTicker'
import EscrowOverlay from '@/components/workflow/EscrowOverlay'
import { useWorkflow } from '@/hooks/useWorkflow'
import { publicClient } from '@/lib/chain'
import { saveStack, touchStack } from '@/lib/stacks'

function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

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
  const [intent, setIntent] = useState('')

  const searchParams = useSearchParams()
  const router = useRouter()

  // Deep-link loader: /workflow?agents=research,outliner,writer&intent=...&stackId=...
  // Lets /stacks send the user here with a pre-filled pipeline.
  const loadedStackIdRef = useRef<string | null>(null)
  const [loadedFromStack, setLoadedFromStack] = useState(false)
  useEffect(() => {
    const agentsParam = searchParams.get('agents')
    if (!agentsParam) return
    const ids = agentsParam.split(',').map(s => s.trim()).filter(Boolean)
    const next = ids
      .map(id => AGENT_LIBRARY.find(a => a.id === id))
      .filter((a): a is AgentDef => !!a)
    if (next.length > 0) {
      setWorkflow(next)
      const stackId = searchParams.get('stackId')
      if (stackId) {
        loadedStackIdRef.current = stackId
        setLoadedFromStack(true)
      }
      const intentParam = searchParams.get('intent')
      if (intentParam) setIntent(intentParam)
    }
    // Strip params so refresh doesn't keep reloading them
    router.replace('/workflow', { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const agentIds = workflow.map(a => a.id)
  const { agents, running, complete, summary, payments, start, reset, escrow } = useWorkflow(
    agentIds,
    { task: intent },
  )

  // Bump "lastUsed" when a deep-linked stack actually runs to completion
  useEffect(() => {
    if (complete && loadedStackIdRef.current) {
      touchStack(loadedStackIdRef.current)
      loadedStackIdRef.current = null
    }
  }, [complete])

  const cardRefs  = useRef<Record<string, HTMLDivElement | null>>({})
  const vaultRef  = useRef<HTMLDivElement | null>(null)

  // Wallet state — live address + on-chain MON balance
  const { ready, authenticated, login, logout } = usePrivy()
  const { wallets } = useWallets()
  const wallet = wallets[0]
  const [balance, setBalance] = useState<string>('—')

  useEffect(() => {
    if (!wallet?.address) { setBalance('—'); return }
    let cancelled = false
    const refresh = () => {
      publicClient
        .getBalance({ address: wallet.address as `0x${string}` })
        .then(wei => { if (!cancelled) setBalance((Number(wei) / 1e18).toFixed(3)) })
        .catch(() => { if (!cancelled) setBalance('?') })
    }
    refresh()
    // Refresh after a workflow finishes (balance has changed)
    if (complete) refresh()
    return () => { cancelled = true }
  }, [wallet?.address, complete])

  const handleRun = useCallback(() => {
    if (workflow.length === 0) return
    start()
  }, [workflow.length, start])

  const handleReset = useCallback(() => {
    reset()
  }, [reset])

  // ───── AI auto-compose: user types a goal, Ollama picks agents ─────
  const [composing, setComposing] = useState(false)
  const [composeNote, setComposeNote] = useState<string | null>(null)

  // ───── Save-stack flow: collect a name post-run and persist locally ─────
  const [stackName, setStackName] = useState('')
  const [savedStackId, setSavedStackId] = useState<string | null>(null)
  const [suggestingName, setSuggestingName] = useState(false)

  // Keep a live ref of stackName so the async name-suggest can decide whether
  // to overwrite, without re-running on every keystroke.
  const stackNameRef = useRef(stackName)
  stackNameRef.current = stackName

  const workflowKey = workflow.map(a => a.id).join(',')

  // If the workflow composition changes, clear "saved" so the user can save the new shape
  useEffect(() => {
    setSavedStackId(null)
    // Also reset the name-suggest gate so the next completion can suggest again
    nameSuggestionRequestedRef.current = false
  }, [workflowKey])

  // Auto-suggest a stack name after a successful run.
  // Fires once per workflow composition. Won't overwrite a name the user typed.
  const nameSuggestionRequestedRef = useRef(false)
  useEffect(() => {
    if (!complete || workflow.length === 0) return
    if (nameSuggestionRequestedRef.current) return
    if (stackNameRef.current.trim().length > 0) return
    nameSuggestionRequestedRef.current = true

    const ac = new AbortController()
    setSuggestingName(true)
    fetch('/api/compose-name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: intent || undefined,
        agentNames: workflow.map(a => a.name),
      }),
      signal: ac.signal,
    })
      .then(r => r.json() as Promise<{ name?: string }>)
      .then(data => {
        // Only fill if the user STILL hasn't typed anything by now
        if (data.name && !stackNameRef.current.trim()) {
          setStackName(data.name)
        }
      })
      .catch(() => { /* silent — user can still type their own name */ })
      .finally(() => setSuggestingName(false))
    return () => ac.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete, workflowKey])

  const [savingStack, setSavingStack] = useState(false)
  const handleSaveStack = useCallback(async () => {
    if (workflow.length === 0 || savingStack) return
    setSavingStack(true)

    // Generalise the intent first so the saved stack is a reusable template,
    // not a one-off "RM 87 with Ali / Ahmad" instance.
    let templateIntent = intent.trim()
    if (templateIntent) {
      try {
        const res = await fetch('/api/generalize-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intent: templateIntent }),
        })
        const data = await res.json() as { generalized?: string }
        if (data.generalized) templateIntent = data.generalized
      } catch {
        // network/LLM hiccup — fall through with the raw intent
      }
    }

    const stack = saveStack({
      name: stackName,
      agentIds: workflow.map(a => a.id),
      intent: templateIntent || undefined,
    })
    setSavedStackId(stack.id)
    setStackName('')
    setSavingStack(false)
  }, [workflow, intent, stackName, savingStack])

  const handleCompose = useCallback(async () => {
    const task = intent.trim()
    if (!task || composing) return
    setComposing(true)
    setComposeNote(null)
    try {
      const res = await fetch('/api/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task }),
      })
      const data = await res.json() as { agentIds?: string[]; source?: string }
      const ids = data.agentIds ?? []
      const next = ids
        .map(id => AGENT_LIBRARY.find(a => a.id === id))
        .filter((a): a is AgentDef => !!a)
      if (next.length === 0) {
        setComposeNote('Could not compose a pipeline — try a more specific goal.')
      } else {
        setWorkflow(next)
        setComposeNote(
          data.source === 'fallback'
            ? `${next.length} agents picked (keyword fallback — model declined).`
            : `${next.length} agents picked for you. Review, then run.`
        )
      }
    } catch (e) {
      setComposeNote(`Compose failed: ${e instanceof Error ? e.message : 'unknown'}`)
    } finally {
      setComposing(false)
    }
  }, [intent, composing])

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

      {/* Escrow lock-funds overlay — pre/during/just-after MetaMask */}
      <EscrowOverlay
        stage={escrow.stage}
        preview={escrow.preview}
        totalMon={escrow.totalMon}
        txHash={escrow.txHash}
      />

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
          <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.08)', marginLeft: 6 }} />
          <Link
            href="/stacks"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              color: 'rgba(255,255,255,0.5)', textDecoration: 'none',
              fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase',
              fontFamily: 'var(--font-space-grotesk)', fontWeight: 600,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
          >
            <FolderOpen size={12} />
            My Stacks
          </Link>
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

        {/* Right: wallet / vault */}
        {(() => {
          const isConnected = ready && authenticated && !!wallet?.address
          const handleClick = () => {
            if (!ready) return
            if (!authenticated) login()
            else logout()
          }
          return (
            <div
              ref={vaultRef}
              role={isConnected ? undefined : 'button'}
              tabIndex={isConnected ? -1 : 0}
              onClick={isConnected ? undefined : handleClick}
              title={isConnected ? `Click to disconnect (${wallet!.address})` : 'Connect wallet'}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '6px 14px', borderRadius: 999,
                background: running
                  ? 'rgba(204,255,0,0.08)'
                  : isConnected
                    ? 'rgba(131,110,251,0.08)'
                    : 'rgba(131,110,251,0.18)',
                border: `1px solid ${
                  running
                    ? 'rgba(204,255,0,0.3)'
                    : isConnected
                      ? 'rgba(131,110,251,0.25)'
                      : 'rgba(131,110,251,0.5)'
                }`,
                cursor: ready ? (isConnected ? 'pointer' : 'pointer') : 'wait',
                userSelect: 'none',
                transition: 'all 0.5s ease',
              }}
              onMouseEnter={e => {
                if (isConnected) e.currentTarget.style.borderColor = 'rgba(255,107,107,0.5)'
              }}
              onMouseLeave={e => {
                if (isConnected) e.currentTarget.style.borderColor = running
                  ? 'rgba(204,255,0,0.3)' : 'rgba(131,110,251,0.25)'
              }}
            >
              {!ready ? (
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>
                  Initialising…
                </span>
              ) : !isConnected ? (
                <>
                  <Wallet size={14} color={P} />
                  <span style={{ fontSize: 11, color: '#fff', fontWeight: 700, letterSpacing: '0.15em' }}>
                    {authenticated ? 'LOADING…' : 'CONNECT WALLET'}
                  </span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 14 }}>🏛️</span>
                  <div style={{ lineHeight: 1.1 }}>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', fontFamily: 'monospace' }}>
                      {shortAddr(wallet!.address)}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: running ? L : P }}>
                      {balance} MON
                    </div>
                  </div>
                </>
              )}
            </div>
          )
        })()}
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
          {/* Template-loaded hint — only appears when /stacks deep-linked here */}
          {loadedFromStack && (
            <div style={{
              marginBottom: 12,
              padding: '8px 12px',
              background: 'rgba(204,255,0,0.06)',
              border: '1px solid rgba(204,255,0,0.25)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
            }}>
              <span style={{
                fontSize: 11, color: 'rgba(255,255,255,0.7)',
                fontFamily: 'var(--font-space-grotesk)',
              }}>
                <span style={{ color: L, fontWeight: 700, letterSpacing: '0.08em' }}>💡 TEMPLATE LOADED</span>
                {'  '}— refine the goal with this run&apos;s specifics, then click RUN.
              </span>
              <button
                onClick={() => setLoadedFromStack(false)}
                title="Dismiss"
                style={{
                  background: 'none', border: 'none', padding: 0,
                  color: 'rgba(255,255,255,0.35)', cursor: 'pointer',
                  fontSize: 14, lineHeight: 1,
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
              >
                ✕
              </button>
            </div>
          )}

          {/* AI auto-compose: describe goal → Ollama picks agents */}
          <div style={{
            marginBottom: 16,
            padding: '12px 14px',
            background: 'rgba(131,110,251,0.06)',
            border: '1px solid rgba(131,110,251,0.22)',
            borderRadius: 12,
          }}>
            <p style={{
              fontSize: 9, letterSpacing: '0.45em', color: P, textTransform: 'uppercase',
              margin: '0 0 8px', fontFamily: 'var(--font-space-grotesk)', fontWeight: 700,
            }}>
              DESCRIBE YOUR GOAL
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={intent}
                onChange={e => setIntent(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleCompose() }}
                placeholder='e.g. "research for my FYP", "translate my whitepaper to Bahasa"'
                disabled={composing || running}
                style={{
                  flex: 1, height: 38, padding: '0 12px',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 9,
                  color: '#fff', fontSize: 12, outline: 'none',
                  fontFamily: 'var(--font-space-grotesk)',
                }}
              />
              <button
                onClick={handleCompose}
                disabled={composing || running || !intent.trim()}
                style={{
                  height: 38, padding: '0 14px',
                  background: composing || !intent.trim() || running
                    ? 'rgba(131,110,251,0.25)'
                    : `linear-gradient(135deg, ${P}, #4f46e5)`,
                  border: 'none', borderRadius: 9,
                  color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                  cursor: composing || !intent.trim() || running ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-space-grotesk)',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {composing ? (
                  <>
                    <span style={{
                      width: 11, height: 11, borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff',
                      animation: 'wspin 0.7s linear infinite',
                    }} />
                    THINKING
                  </>
                ) : (
                  <>
                    <Sparkles size={12} />
                    AUTO-COMPOSE
                  </>
                )}
              </button>
            </div>
            {composeNote && (
              <p style={{
                marginTop: 8, marginBottom: 0,
                fontSize: 10, color: 'rgba(204,255,0,0.7)',
                fontFamily: 'var(--font-space-grotesk)', letterSpacing: '0.02em',
              }}>
                {composeNote}
              </p>
            )}
          </div>

          <WorkflowBuilder
            workflow={workflow}
            onWorkflowChange={setWorkflow}
            onRun={handleRun}
            onReset={handleReset}
            running={running}
            complete={complete}
          />

          {/* Save-stack UI: appears after a successful run */}
          {complete && workflow.length > 0 && (
            <div style={{
              marginTop: 14,
              padding: '12px 14px',
              background: savedStackId ? 'rgba(204,255,0,0.06)' : 'rgba(204,255,0,0.04)',
              border: `1px solid ${savedStackId ? 'rgba(204,255,0,0.35)' : 'rgba(204,255,0,0.18)'}`,
              borderRadius: 12,
              transition: 'all 0.3s ease',
            }}>
              {savedStackId ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: L, fontFamily: 'var(--font-space-grotesk)', fontWeight: 600 }}>
                    <Check size={14} />
                    Stack saved to your collection.
                  </span>
                  <Link
                    href="/stacks"
                    style={{
                      fontSize: 11, color: L, textDecoration: 'none',
                      letterSpacing: '0.1em', textTransform: 'uppercase',
                      fontFamily: 'var(--font-space-grotesk)', fontWeight: 700,
                    }}
                  >
                    View →
                  </Link>
                </div>
              ) : (
                <>
                  <p style={{
                    fontSize: 9, letterSpacing: '0.45em', color: L, textTransform: 'uppercase',
                    margin: '0 0 8px', fontFamily: 'var(--font-space-grotesk)', fontWeight: 700,
                  }}>
                    SAVE THIS STACK
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={stackName}
                      onChange={e => setStackName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveStack() }}
                      placeholder={
                        suggestingName
                          ? '✨ Suggesting a name…'
                          : intent
                            ? intent.slice(0, 40)
                            : 'Name this pipeline (e.g. "FYP Research")'
                      }
                      style={{
                        flex: 1, height: 36, padding: '0 12px',
                        background: 'rgba(0,0,0,0.4)',
                        border: `1px solid ${suggestingName ? 'rgba(204,255,0,0.35)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: 9,
                        color: '#fff', fontSize: 12, outline: 'none',
                        fontFamily: 'var(--font-space-grotesk)',
                        transition: 'border-color 0.3s ease',
                      }}
                    />
                    <button
                      onClick={handleSaveStack}
                      disabled={workflow.length === 0 || savingStack}
                      style={{
                        height: 36, padding: '0 14px',
                        background: savingStack
                          ? 'rgba(204,255,0,0.35)'
                          : `linear-gradient(135deg, ${L}, #a3e635)`,
                        border: 'none', borderRadius: 9,
                        color: savingStack ? 'rgba(0,0,0,0.6)' : '#000',
                        fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
                        cursor: savingStack ? 'wait' : 'pointer', whiteSpace: 'nowrap',
                        fontFamily: 'var(--font-space-grotesk)',
                        display: 'flex', alignItems: 'center', gap: 5,
                      }}
                    >
                      <Bookmark size={12} fill="currentColor" />
                      {savingStack ? 'GENERALISING…' : 'SAVE'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
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
