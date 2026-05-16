'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { LaunchButton } from '@/components/ui/launch-button'

export default function HeroContent() {
  const { scrollY } = useScroll()

  // Text parallax — rises faster than scroll and fades out
  const y = useTransform(scrollY, [0, 700], [0, -180])
  const opacity = useTransform(scrollY, [0, 450], [1, 0])
  const scale = useTransform(scrollY, [0, 500], [1, 0.94])

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Dark vignette behind text so it reads cleanly over bright core particles */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 65% 55% at 50% 52%, rgba(0,0,0,0.62) 0%, transparent 100%)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />
      <motion.div
        style={{ y, opacity, scale, position: 'relative', zIndex: 2 }}
        className="flex flex-col items-center text-center max-w-5xl mx-auto px-6 pt-24 will-change-transform"
      >
        {/* POWERED BY MONAD */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.9, ease: 'easeOut' }}
          style={{
            fontSize: 11,
            letterSpacing: '0.48em',
            color: '#00FFFF',
            textTransform: 'uppercase',
            marginBottom: 28,
            fontFamily: 'var(--font-space-grotesk)',
            textShadow: '0 0 20px rgba(0,255,255,0.5)',
          }}
        >
          POWERED BY MONAD
        </motion.p>

        {/* Headline — each word slides up staggered */}
        <div
          style={{
            fontSize: 'clamp(36px, 6.2vw, 80px)',
            fontWeight: 700,
            lineHeight: 0.93,
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            marginBottom: 36,
            fontFamily: 'var(--font-space-grotesk)',
          }}
        >
          {['THE AGENT', 'ECONOMY', 'STARTS HERE'].map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, clipPath: 'inset(100% 0% 0% 0%)' }}
              animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' }}
              transition={{ delay: 0.5 + i * 0.14, duration: 0.85, ease: [0.16, 1, 0.3, 1] as const }}
              style={{ display: 'block', textShadow: '0 0 80px rgba(0,255,255,0.10)' }}
            >
              {line}
            </motion.div>
          ))}
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.9 }}
          style={{
            fontSize: 'clamp(15px, 1.8vw, 18px)',
            lineHeight: 1.75,
            color: '#8A95A8',
            maxWidth: 560,
            marginBottom: 52,
            fontFamily: 'var(--font-space-grotesk)',
          }}
        >
          Describe your task. Parallex selects the right AI agents, builds the workflow,
          and executes — everything on-chain.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.7 }}
        >
          <Link href="/workflow">
            <LaunchButton label="Launch App" />
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ opacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
      >
        <span
          style={{
            fontSize: 9,
            letterSpacing: '0.4em',
            color: '#4A5568',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-space-grotesk)',
          }}
        >
          SCROLL
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 1,
            height: 36,
            background: 'linear-gradient(to bottom, rgba(0,255,255,0.6), transparent)',
          }}
        />
      </motion.div>
    </section>
  )
}
