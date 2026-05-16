'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number; y: number; r: number; alpha: number; speed: number; color: string
}

const COLORS = ['#836EFB', '#836EFB', '#836EFB', '#00D1FF', '#CCFF00', '#ffffff']

export default function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = window.innerWidth
    let H = window.innerHeight
    canvas.width  = W
    canvas.height = H

    const count = Math.floor((W * H) / 6000)
    const stars: Star[] = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 0.4 + Math.random() * 1.2,
      alpha: 0.1 + Math.random() * 0.7,
      speed: 0.003 + Math.random() * 0.012,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))

    let time = 0
    let raf: number

    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      time += 1

      for (const s of stars) {
        const a = s.alpha * (0.6 + 0.4 * Math.sin(time * s.speed + s.x))
        ctx.save()
        ctx.globalAlpha = a
        if (s.r > 0.9) {
          ctx.shadowBlur = 6
          ctx.shadowColor = s.color
        }
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = s.color
        ctx.fill()
        ctx.restore()
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)

    const onResize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width  = W
      canvas.height = H
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
