'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.5em',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-space-grotesk)',
          }}
        >
          PARALLEX
        </span>
      </motion.div>

    </nav>
  )
}
