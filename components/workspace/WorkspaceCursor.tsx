'use client'

import { useRef, useEffect } from 'react'

export default function WorkspaceCursor() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const move = (e: MouseEvent) => {
      el.style.transform = `translate(${e.clientX - 60}px, ${e.clientY - 60}px)`
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 9998,
        willChange: 'transform',
      }}
    />
  )
}
