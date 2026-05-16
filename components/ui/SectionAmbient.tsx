'use client'

interface Props {
  variant?: 'blue' | 'magenta' | 'cyan'
}

const PALETTE = {
  blue:    { a: 'rgba(0,102,255,0.14)',  b: 'rgba(0,255,255,0.08)',  c: 'rgba(131,110,251,0.07)' },
  magenta: { a: 'rgba(255,0,255,0.12)',  b: 'rgba(0,102,255,0.08)',  c: 'rgba(255,100,200,0.06)' },
  cyan:    { a: 'rgba(0,255,255,0.11)',  b: 'rgba(131,110,251,0.08)', c: 'rgba(0,180,255,0.07)'  },
}

export default function SectionAmbient({ variant = 'blue' }: Props) {
  const { a, b, c } = PALETTE[variant]

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>

      {/* Large top-left color orb */}
      <div style={{
        position: 'absolute',
        top: '-18%',
        left: '-12%',
        width: '58%',
        height: '75%',
        background: `radial-gradient(ellipse, ${a} 0%, transparent 70%)`,
        borderRadius: '50%',
        filter: 'blur(60px)',
      }} />

      {/* Bottom-right color orb */}
      <div style={{
        position: 'absolute',
        bottom: '-18%',
        right: '-12%',
        width: '50%',
        height: '65%',
        background: `radial-gradient(ellipse, ${b} 0%, transparent 70%)`,
        borderRadius: '50%',
        filter: 'blur(60px)',
      }} />

      {/* Center accent orb — gives depth to the middle of long sections */}
      <div style={{
        position: 'absolute',
        top: '35%',
        left: '30%',
        width: '40%',
        height: '40%',
        background: `radial-gradient(ellipse, ${c} 0%, transparent 70%)`,
        borderRadius: '50%',
        filter: 'blur(80px)',
      }} />

      {/* Dot grid texture */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      {/* Thin top border glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.08) 75%, transparent 100%)',
      }} />
    </div>
  )
}
