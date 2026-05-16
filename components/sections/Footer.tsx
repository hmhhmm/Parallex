'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="relative py-28 px-6 bg-black overflow-hidden">
      {/* Subtle top border glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '10%',
        right: '10%',
        height: 1,
        background: 'linear-gradient(to right, transparent, rgba(0,255,255,0.18), transparent)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.9 }}
        className="max-w-4xl mx-auto text-center"
      >
        {/* Final CTA */}
        <p style={{
          fontSize: 10,
          letterSpacing: '0.4em',
          color: '#00FFFF',
          textTransform: 'uppercase',
          marginBottom: 24,
          fontFamily: 'var(--font-space-grotesk)',
        }}>
          Ready to begin
        </p>

        <h2 style={{
          fontSize: 'clamp(28px, 4.5vw, 56px)',
          fontWeight: 700,
          color: '#FFFFFF',
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
          marginBottom: 16,
          fontFamily: 'var(--font-space-grotesk)',
          lineHeight: 1.05,
        }}>
          The Agent Economy<br />Starts Here.
        </h2>

        <p style={{
          fontSize: 15,
          color: '#6B7895',
          letterSpacing: '0.02em',
          marginBottom: 44,
          fontFamily: 'var(--font-space-grotesk)',
          lineHeight: 1.7,
        }}>
          Deploy your first agent workflow on Monad.<br />
          No config. No friction. Just intelligence.
        </p>

        <Link href="/workflow">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '16px 52px',
              border: '1px solid rgba(0,255,255,0.5)',
              borderRadius: '2px',
              background: 'rgba(0,255,255,0.05)',
              color: '#FFFFFF',
              fontSize: '11px',
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'var(--font-space-grotesk)',
              boxShadow: '0 0 40px rgba(0,255,255,0.10)',
              transition: 'all 0.35s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(0,255,255,0.9)'
              e.currentTarget.style.color = '#00FFFF'
              e.currentTarget.style.boxShadow = '0 0 48px rgba(0,255,255,0.22), 0 0 80px rgba(0,255,255,0.08)'
              e.currentTarget.style.background = 'rgba(0,255,255,0.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(0,255,255,0.5)'
              e.currentTarget.style.color = '#FFFFFF'
              e.currentTarget.style.boxShadow = '0 0 40px rgba(0,255,255,0.10)'
              e.currentTarget.style.background = 'rgba(0,255,255,0.05)'
            }}
          >
            Launch Parallex →
          </motion.button>
        </Link>

        {/* Divider */}
        <div style={{
          height: 1,
          background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)',
          margin: '52px 0 32px',
        }} />

        {/* Large faded brand */}
        <div style={{
          fontSize: 'clamp(48px, 10vw, 110px)',
          fontWeight: 700,
          color: 'rgba(255,255,255,0.03)',
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
          lineHeight: 1,
          marginBottom: 24,
          fontFamily: 'var(--font-space-grotesk)',
          userSelect: 'none',
        }}>
          PARALLEX
        </div>

        <p style={{
          fontSize: 10,
          letterSpacing: '0.35em',
          color: '#333A48',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-space-grotesk)',
        }}>
          BUILT ON MONAD
        </p>
      </motion.div>
    </footer>
  )
}
