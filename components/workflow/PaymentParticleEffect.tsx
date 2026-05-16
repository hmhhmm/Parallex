'use client'

import { useEffect, useRef } from 'react'
import type { PaymentEvent } from '@/hooks/useWorkflow'

interface Coin {
  x: number; y: number
  tx: number; ty: number  // target
  vx: number; vy: number
  progress: number        // 0→1 along bezier
  alpha: number
  radius: number
  color: string
  trail: { x: number; y: number; a: number }[]
  done: boolean
}

interface Props {
  payments: PaymentEvent[]
  cardRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>
  vaultRef: React.RefObject<HTMLDivElement | null>
}

function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

function cubicBezier(t: number, p0: [number, number], p1: [number, number], p2: [number, number], p3: [number, number]): [number, number] {
  const mt = 1 - t
  return [
    mt * mt * mt * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t * t * t * p3[0],
    mt * mt * mt * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t * t * t * p3[1],
  ]
}

export default function PaymentParticleEffect({ payments, cardRefs, vaultRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const coinsRef  = useRef<Coin[]>([])
  const rafRef    = useRef<number>(0)
  const prevPaymentsLen = useRef(0)

  // Spawn coins when new payments arrive
  useEffect(() => {
    if (payments.length <= prevPaymentsLen.current) return
    const newPayments = payments.slice(prevPaymentsLen.current)
    prevPaymentsLen.current = payments.length

    const canvas = canvasRef.current
    if (!canvas) return

    newPayments.forEach(({ agentId }) => {
      const cardEl = cardRefs.current[agentId]
      const vaultEl = vaultRef.current
      if (!cardEl || !vaultEl) return

      const cardRect  = cardEl.getBoundingClientRect()
      const vaultRect = vaultEl.getBoundingClientRect()

      const sx = vaultRect.left + vaultRect.width / 2
      const sy = vaultRect.top  + vaultRect.height / 2
      const tx = cardRect.left  + cardRect.width  / 2
      const ty = cardRect.top   + cardRect.height / 2

      // Spawn 8 coins per agent payment
      for (let k = 0; k < 8; k++) {
        const spreadX = (Math.random() - 0.5) * 40
        const spreadY = (Math.random() - 0.5) * 20
        coinsRef.current.push({
          x: sx, y: sy,
          tx: tx + spreadX, ty: ty + spreadY,
          vx: 0, vy: 0,
          progress: -Math.random() * 0.25,  // stagger start
          alpha: 1,
          radius: 8 + Math.random() * 5,
          color: k % 2 === 0 ? '#CCFF00' : '#836EFB',
          trail: [],
          done: false,
        })
      }

      // Also spawn burst particles at the destination
      for (let k = 0; k < 14; k++) {
        const angle = (k / 14) * Math.PI * 2
        const speed = 1.5 + Math.random() * 2
        coinsRef.current.push({
          x: tx, y: ty,
          tx: tx + Math.cos(angle) * 60,
          ty: ty + Math.sin(angle) * 60,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          progress: 0,
          alpha: 0,   // will fade in at arrival
          radius: 3 + Math.random() * 3,
          color: '#CCFF00',
          trail: [],
          done: false,
        })
      }
    })
  }, [payments, cardRefs, vaultRef])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      coinsRef.current = coinsRef.current.filter(c => !c.done)

      for (const coin of coinsRef.current) {
        if (coin.progress < 0) {
          coin.progress += 0.018
          continue
        }

        // Flying coins (radius > 5 and alpha starts at 1)
        if (coin.radius > 5 && coin.alpha === 1) {
          coin.progress = Math.min(coin.progress + 0.022, 1)
          const t = coin.progress

          // Bezier control points: arc upward
          const midX = lerp(coin.x, coin.tx, 0.5) + (Math.random() - 0.5) * 20
          const midY = Math.min(coin.y, coin.ty) - 80 - Math.random() * 40
          const [bx, by] = cubicBezier(t,
            [coin.x, coin.y],
            [midX, midY],
            [midX, midY],
            [coin.tx, coin.ty]
          )

          // Trail
          coin.trail.push({ x: bx, y: by, a: coin.alpha * 0.6 })
          if (coin.trail.length > 10) coin.trail.shift()

          // Draw trail
          for (let j = 0; j < coin.trail.length; j++) {
            const tp = coin.trail[j]
            const tr = (j / coin.trail.length) * coin.radius * 0.5
            ctx.save()
            ctx.globalAlpha = tp.a * (j / coin.trail.length) * 0.4
            ctx.beginPath()
            ctx.arc(tp.x, tp.y, tr, 0, Math.PI * 2)
            ctx.fillStyle = coin.color
            ctx.fill()
            ctx.restore()
          }

          // Draw coin
          ctx.save()
          ctx.globalAlpha = coin.alpha
          // Glow
          ctx.shadowBlur = 18
          ctx.shadowColor = coin.color
          ctx.beginPath()
          ctx.arc(bx, by, coin.radius, 0, Math.PI * 2)
          ctx.fillStyle = coin.color
          ctx.fill()
          // Inner ring
          ctx.strokeStyle = coin.color === '#CCFF00' ? '#fff' : '#a78bfa'
          ctx.lineWidth = 1
          ctx.globalAlpha = coin.alpha * 0.6
          ctx.beginPath()
          ctx.arc(bx, by, coin.radius * 0.55, 0, Math.PI * 2)
          ctx.stroke()
          // M label
          ctx.globalAlpha = coin.alpha * 0.9
          ctx.fillStyle = '#000'
          ctx.font = `bold ${Math.round(coin.radius * 0.9)}px monospace`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('M', bx, by)
          ctx.restore()

          if (t >= 1) {
            coin.alpha -= 0.08
            if (coin.alpha <= 0) coin.done = true
          }
        } else {
          // Burst particles
          coin.progress += 0.04
          if (coin.progress < 0.5) continue  // wait for flying coins to arrive
          const p = Math.min((coin.progress - 0.5) / 0.5, 1)
          coin.x += coin.vx
          coin.y += coin.vy
          coin.vx *= 0.92
          coin.vy *= 0.92
          coin.alpha = Math.max(0, 1 - p * 1.2)
          if (coin.alpha <= 0) { coin.done = true; continue }
          ctx.save()
          ctx.globalAlpha = coin.alpha
          ctx.shadowBlur = 8
          ctx.shadowColor = coin.color
          ctx.beginPath()
          ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2)
          ctx.fillStyle = coin.color
          ctx.fill()
          ctx.restore()
        }
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        pointerEvents: 'none',
        zIndex: 100,
      }}
    />
  )
}
