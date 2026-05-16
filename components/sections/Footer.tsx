'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { LaunchButton } from '@/components/ui/launch-button'
import { ExternalLink } from 'lucide-react'

function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function GithubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

const NAV_COLS = [
  {
    heading: 'Product',
    links: [
      { label: 'How it works', href: '#' },
      { label: 'Agent marketplace', href: '#' },
      { label: 'Workflow builder', href: '/workspace' },
      { label: 'Pricing', href: '#' },
    ],
  },
  {
    heading: 'Developers',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'API reference', href: '#' },
      { label: 'SDK', href: '#' },
      { label: 'GitHub', href: 'https://github.com' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="relative overflow-hidden" style={{ background: '#03020A' }}>

      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(131,110,251,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(131,110,251,0.04) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      {/* Top-left purple glow */}
      <div style={{
        position: 'absolute', top: -200, left: -200,
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(131,110,251,0.12) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Bottom-right cyan glow */}
      <div style={{
        position: 'absolute', bottom: -100, right: -100,
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,209,255,0.07) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Top border glow */}
      <div style={{
        position: 'absolute', top: 0, left: '8%', right: '8%', height: 1,
        background: 'linear-gradient(to right, transparent, rgba(131,110,251,0.4), rgba(0,255,255,0.2), transparent)',
      }} />

      {/* ── CTA block ── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.9 }}
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '96px 24px 72px',
          textAlign: 'center',
          position: 'relative', zIndex: 1,
        }}
      >
        <p style={{
          fontSize: 10,
          letterSpacing: '0.45em',
          color: '#00FFFF',
          textTransform: 'uppercase',
          marginBottom: 20,
          fontFamily: 'var(--font-space-grotesk)',
          textShadow: '0 0 16px rgba(0,255,255,0.4)',
        }}>
          Ready to begin
        </p>

        <h2 style={{
          fontSize: 'clamp(32px, 5vw, 64px)',
          fontWeight: 800,
          color: '#FFFFFF',
          letterSpacing: '-0.03em',
          textTransform: 'uppercase',
          marginBottom: 18,
          fontFamily: 'var(--font-space-grotesk)',
          lineHeight: 1.0,
        }}>
          The Agent Economy<br />Starts Here.
        </h2>

        <p style={{
          fontSize: 15,
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.01em',
          marginBottom: 48,
          fontFamily: 'var(--font-space-grotesk)',
          lineHeight: 1.75,
          maxWidth: 440,
          margin: '0 auto 48px',
        }}>
          Deploy your first agent workflow on Monad.<br />
          No config. No friction. Just intelligence.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/workspace">
            <LaunchButton label="Launch Parallex" />
          </Link>
          <Link
            href="#"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              height: 48, padding: '0 28px',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 2,
              color: 'rgba(255,255,255,0.45)',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-space-grotesk)',
              textDecoration: 'none',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          >
            Read Docs
            <ExternalLink size={11} />
          </Link>
        </div>
      </motion.div>

      {/* ── Divider ── */}
      <div style={{
        height: 1,
        background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)',
        margin: '0 24px',
        position: 'relative', zIndex: 1,
      }} />

      {/* ── Nav columns ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.7, delay: 0.1 }}
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '56px 24px 48px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '40px 32px',
          position: 'relative', zIndex: 1,
        }}
      >
        {/* Brand column */}
        <div>
          <div style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-space-grotesk)',
            marginBottom: 12,
          }}>
            PARALLEX
          </div>
          <p style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.3)',
            fontFamily: 'var(--font-space-grotesk)',
            lineHeight: 1.65,
            marginBottom: 20,
          }}>
            AI agent orchestration,<br />fully on-chain.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { href: 'https://twitter.com', icon: XIcon },
              { href: 'https://github.com', icon: GithubIcon },
            ].map(({ href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                style={{
                  width: 34, height: 34, borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.3)',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'transparent' }}
              >
                <Icon size={14} />
              </Link>
            ))}
          </div>
        </div>

        {/* Nav link columns */}
        {NAV_COLS.map(col => (
          <div key={col.heading}>
            <p style={{
              fontSize: 9,
              letterSpacing: '0.35em',
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-space-grotesk)',
              fontWeight: 600,
              marginBottom: 16,
            }}>
              {col.heading}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.links.map(link => (
                <Link
                  key={link.label}
                  href={link.href}
                  style={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.35)',
                    fontFamily: 'var(--font-space-grotesk)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      {/* ── Bottom bar ── */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.04)',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: '20px 24px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}>
          <p style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.18)',
            fontFamily: 'var(--font-space-grotesk)',
            letterSpacing: '0.05em',
          }}>
            © 2025 Parallex. All rights reserved.
          </p>
          <p style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.12)',
            fontFamily: 'var(--font-space-grotesk)',
            letterSpacing: '0.05em',
          }}>
            Privacy · Terms
          </p>
        </div>
      </div>
    </footer>
  )
}
