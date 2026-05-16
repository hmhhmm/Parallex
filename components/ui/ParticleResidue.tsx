'use client'

import { useRef, useEffect } from 'react'

const PALETTES = {
  cyan:    ['#00FFFF', '#00AAFF', '#44CCFF', '#836EFB', '#FFFFFF'],
  magenta: ['#FF00FF', '#AA00DD', '#FF66CC', '#0066FF', '#FFFFFF'],
  blue:    ['#0066FF', '#00FFFF', '#44AAFF', '#836EFB', '#FFFFFF'],
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

interface Props {
  count?: number
  variant?: 'cyan' | 'magenta' | 'blue'
  lineColor?: string
}

export default function ParticleResidue({ count = 100, variant = 'cyan', lineColor = '0,200,255' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef    = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas    = canvasRef.current
    if (!container || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // Capture as non-null locals so the frame closure can use them without null checks
    const C = canvas
    const X = ctx

    const palette = PALETTES[variant]

    const resize = () => {
      canvas.width  = container.offsetWidth
      canvas.height = container.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Build particle pool
    type P = {
      x: number; y: number
      sx: number; sy: number        // start pos (for drop-in)
      tx: number; ty: number        // target pos
      ep: number                    // entry progress 0→1
      vx: number; vy: number
      size: number; rgb: string
      alpha: number
      phase: number; speed: number
    }

    const make = (): P => {
      const tx = Math.random() * C.width
      const ty = Math.random() * C.height
      const dropsIn = Math.random() < 0.35
      const sx = dropsIn ? C.width * 0.35 + Math.random() * C.width * 0.3 : tx
      const sy = dropsIn ? -40 - Math.random() * 80 : ty
      const color = palette[Math.floor(Math.random() * palette.length)]
      return {
        x: sx, y: sy, sx, sy, tx, ty,
        ep: 0,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        size: 0.8 + Math.random() * 1.6,
        rgb: hexToRgb(color),
        alpha: 0.18 + Math.random() * 0.42,
        phase: Math.random() * Math.PI * 2,
        speed: 0.22 + Math.random() * 0.38,
      }
    }

    const particles: P[] = Array.from({ length: count }, make)

    let gOpacity = 0
    let visible  = false
    let t = 0
    let animId: number

    const observer = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
    }, { threshold: 0.08 })
    observer.observe(container)

    function frame() {
      animId = requestAnimationFrame(frame)
      t += 0.016

      gOpacity = visible
        ? Math.min(gOpacity + 0.010, 1)
        : Math.max(gOpacity - 0.006, 0)

      if (gOpacity <= 0) { X.clearRect(0, 0, C.width, C.height); return }

      X.clearRect(0, 0, C.width, C.height)

      // Move particles
      for (const p of particles) {
        if (p.ep < 1) {
          p.ep = Math.min(p.ep + 0.005, 1)
          const ease = 1 - Math.pow(1 - p.ep, 3)
          p.x = p.sx + (p.tx - p.sx) * ease
          p.y = p.sy + (p.ty - p.sy) * ease
        } else {
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0)            p.x = C.width
          if (p.x > C.width)      p.x = 0
          if (p.y < 0)            p.y = C.height
          if (p.y > C.height)     p.y = 0
        }
      }

      // Constellation lines — only between fully-entered particles
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        if (a.ep < 0.8) continue
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          if (b.ep < 0.8) continue
          const dx = a.x - b.x, dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            X.beginPath()
            X.moveTo(a.x, a.y)
            X.lineTo(b.x, b.y)
            X.strokeStyle = `rgba(${lineColor},${(1 - dist / 120) * 0.055 * gOpacity})`
            X.lineWidth = 0.6
            X.stroke()
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        const entryFade = Math.min(p.ep * 4, 1)
        const pulse = 0.6 + 0.4 * Math.sin(t * p.speed + p.phase)
        const a = p.alpha * pulse * gOpacity * entryFade

        // Soft glow halo
        const g = X.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6)
        g.addColorStop(0, `rgba(${p.rgb},${a * 0.65})`)
        g.addColorStop(1, `rgba(${p.rgb},0)`)
        X.beginPath()
        X.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2)
        X.fillStyle = g
        X.fill()

        // Bright core
        X.beginPath()
        X.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        X.fillStyle = `rgba(${p.rgb},${Math.min(a * 2.2, 0.95)})`
        X.fill()
      }
    }

    frame()

    return () => {
      cancelAnimationFrame(animId)
      observer.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [count, variant, lineColor])

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  )
}
