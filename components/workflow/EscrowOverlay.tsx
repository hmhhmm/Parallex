'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ShieldCheck, ExternalLink } from 'lucide-react'
import type { EscrowStage, EscrowPreviewItem } from '@/hooks/useWorkflow'

const P = '#836EFB'
const L = '#CCFF00'

interface Props {
  stage: EscrowStage
  preview: EscrowPreviewItem[]
  totalMon: string
  txHash: `0x${string}` | null
}

export default function EscrowOverlay({ stage, preview, totalMon, txHash }: Props) {
  const visible = stage !== 'idle'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="escrow-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(3, 2, 10, 0.78)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, pointerEvents: 'auto',
          }}
        >
          {stage === 'locked' ? (
            <LockedCard txHash={txHash} totalMon={totalMon} />
          ) : (
            <PreviewCard
              stage={stage}
              preview={preview}
              totalMon={totalMon}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function PreviewCard({
  stage, preview, totalMon,
}: {
  stage: EscrowStage
  preview: EscrowPreviewItem[]
  totalMon: string
}) {
  const isWaiting = stage === 'awaiting_signature' || stage === 'confirming'

  const headline =
    stage === 'preview'              ? 'LOCKING FUNDS INTO ESCROW' :
    stage === 'awaiting_signature'   ? 'CONFIRM IN METAMASK'        :
    stage === 'confirming'           ? 'WAITING FOR MONAD BLOCK…'   :
    'LOCKING FUNDS INTO ESCROW'

  return (
    <motion.div
      key={`preview-${stage}`}
      initial={{ scale: 0.92, opacity: 0, y: 16 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.96, opacity: 0 }}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      style={{
        width: 'min(440px, calc(100vw - 48px))',
        background: 'linear-gradient(180deg, rgba(131,110,251,0.12), rgba(131,110,251,0.04))',
        border: '1px solid rgba(131,110,251,0.4)',
        borderRadius: 18,
        padding: '22px 22px 18px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(131,110,251,0.15) inset',
        fontFamily: 'var(--font-space-grotesk)',
      }}
    >
      {/* Headline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        {isWaiting && (
          <Loader2 size={13} color={P} style={{ animation: 'eo-spin 0.9s linear infinite' }} />
        )}
        <p style={{
          fontSize: 10, letterSpacing: '0.4em', color: P, textTransform: 'uppercase',
          margin: 0, fontWeight: 700,
        }}>
          {headline}
        </p>
      </div>

      {/* Big total */}
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 8,
        marginBottom: 16,
      }}>
        <span style={{ fontSize: 38, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {totalMon}
        </span>
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>MON</span>
      </div>

      {/* Per-agent breakdown */}
      <div style={{
        background: 'rgba(0,0,0,0.35)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: '10px 12px',
        marginBottom: 14,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {preview.map((item, i) => (
          <motion.div
            key={`${item.agentId}-${i}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: i * 0.04 }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>└</span>
              {item.name}
            </span>
            <span style={{ fontSize: 11, color: '#fff', fontFamily: 'monospace', fontWeight: 600 }}>
              {item.costMon} MON
            </span>
          </motion.div>
        ))}
      </div>

      {/* Footer status line */}
      <p style={{
        fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0,
        textAlign: 'center', letterSpacing: '0.02em',
      }}>
        {stage === 'preview' &&
          'Each agent earns its share when it completes — in parallel on Monad.'}
        {stage === 'awaiting_signature' &&
          'Review the transaction in MetaMask, then approve.'}
        {stage === 'confirming' &&
          'Locking funds on Monad Testnet…'}
      </p>

      <style>{`@keyframes eo-spin { to { transform: rotate(360deg) } }`}</style>
    </motion.div>
  )
}

function LockedCard({
  txHash, totalMon,
}: {
  txHash: `0x${string}` | null
  totalMon: string
}) {
  const explorerUrl = txHash
    ? `https://testnet.monadexplorer.com/tx/${txHash}`
    : null
  const short = txHash ? `${txHash.slice(0, 10)}…${txHash.slice(-6)}` : '—'

  return (
    <motion.div
      key="locked-card"
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.96, opacity: 0 }}
      transition={{ duration: 0.4, ease: 'backOut' }}
      style={{
        width: 'min(440px, calc(100vw - 48px))',
        background: 'linear-gradient(180deg, rgba(204,255,0,0.16), rgba(204,255,0,0.04))',
        border: '1px solid rgba(204,255,0,0.45)',
        borderRadius: 18,
        padding: '26px 22px 20px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 0 60px rgba(204,255,0,0.25), 0 20px 60px rgba(0,0,0,0.55)',
        fontFamily: 'var(--font-space-grotesk)',
        textAlign: 'center',
      }}
    >
      <motion.div
        initial={{ scale: 0.5, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.45, type: 'spring', stiffness: 220, damping: 14 }}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 56, height: 56, borderRadius: '50%',
          background: 'rgba(204,255,0,0.15)',
          border: '1px solid rgba(204,255,0,0.5)',
          marginBottom: 14,
          boxShadow: '0 0 24px rgba(204,255,0,0.35)',
        }}
      >
        <ShieldCheck size={28} color={L} />
      </motion.div>

      <p style={{
        fontSize: 11, letterSpacing: '0.4em', color: L, textTransform: 'uppercase',
        margin: '0 0 6px', fontWeight: 700,
      }}>
        ESCROW LOCKED
      </p>

      <h3 style={{
        fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em',
        margin: '0 0 16px',
      }}>
        {totalMon} MON secured on Monad
      </h3>

      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 8,
            background: 'rgba(204,255,0,0.08)',
            border: '1px solid rgba(204,255,0,0.3)',
            color: L, textDecoration: 'none',
            fontFamily: 'monospace', fontSize: 11,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(204,255,0,0.16)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(204,255,0,0.08)' }}
        >
          {short}
          <ExternalLink size={11} />
        </a>
      )}

      <p style={{
        fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 14, marginBottom: 0,
        letterSpacing: '0.04em',
      }}>
        Agents will be paid in parallel as they complete.
      </p>
    </motion.div>
  )
}
