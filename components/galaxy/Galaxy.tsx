'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useRef, useEffect, MutableRefObject } from 'react'
import * as THREE from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import CoreParticles from './CoreParticles'
import SpiralArms from './SpiralArms'
import OuterHalo from './OuterHalo'

// Raw scroll ratio — not clamped, so it can exceed 1.0 into the next section
function rawProgress(): number {
  if (typeof window === 'undefined') return 0
  return window.scrollY / window.innerHeight
}

function CameraRig() {
  const { camera } = useThree()
  const camZ = useRef(5.5)

  useFrame(() => {
    const raw = rawProgress()

    let targetZ: number
    if (raw <= 0.55) {
      // Phase 1: gentle zoom in, ring fills frame
      const t = Math.sqrt(raw / 0.55)
      targetZ = THREE.MathUtils.lerp(5.5, 3.2, t)
    } else {
      // Phase 2: rush forward through the disk, camera flies in
      const t = Math.min((raw - 0.55) / 0.45, 1.0)
      targetZ = THREE.MathUtils.lerp(3.2, 0.3, t * t)
    }

    camZ.current += (targetZ - camZ.current) * 0.07
    camera.position.z = camZ.current
  })

  return null
}

// Fades the canvas wrapper out as the galaxy disperses, leaving a clean page beneath
function FadeController({ containerRef }: { containerRef: MutableRefObject<HTMLDivElement | null> }) {
  useFrame(() => {
    if (!containerRef.current) return
    const raw = rawProgress()
    // Fade starts at 72% scroll, fully gone by 105%
    const opacity = Math.max(0, Math.min(1, 1 - (raw - 0.72) / 0.33))
    containerRef.current.style.opacity = String(opacity)
  })
  return null
}

function GalaxyGroup({ disperseRef }: { disperseRef: MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const parallax = useRef({ x: 0, y: 0 })
  const baseRotationY = useRef(0)
  const tilt = useRef(0.18)

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  useFrame(() => {
    if (!groupRef.current) return
    const raw = rawProgress()

    // Disperse kicks in at 50% of hero scroll, reaches 1.0 at 100%
    disperseRef.current = Math.max(0, Math.min(1, (raw - 0.50) / 0.50))

    // Tilt and spin still use clamped progress so they don't overshoot
    const t = Math.sqrt(Math.min(raw, 1.0))

    const rotSpeed = 0.00028 + t * 0.00042
    baseRotationY.current += rotSpeed

    // Parallax disabled while dispersing — motion looks wrong during scatter
    const parallaxScale = Math.max(0, 1 - disperseRef.current * 2) * (1 - t * 0.3)
    const targetX = mouse.current.y * 0.035 * parallaxScale
    const targetY = mouse.current.x * 0.055 * parallaxScale
    parallax.current.x += (targetX - parallax.current.x) * 0.04
    parallax.current.y += (targetY - parallax.current.y) * 0.04

    const targetTilt = 0.18 + Math.min(t, 0.6) * 0.22
    tilt.current += (targetTilt - tilt.current) * 0.05

    groupRef.current.rotation.y = baseRotationY.current + parallax.current.y
    groupRef.current.rotation.x = parallax.current.x + tilt.current
  })

  return (
    <group ref={groupRef}>
      <CoreParticles disperseRef={disperseRef} />
      <SpiralArms disperseRef={disperseRef} />
      <OuterHalo disperseRef={disperseRef} />
    </group>
  )
}

export default function Galaxy() {
  const containerRef = useRef<HTMLDivElement>(null)
  const disperseRef = useRef(0)

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5.5], fov: 52 }}>
        <CameraRig />
        <FadeController containerRef={containerRef} />
        <GalaxyGroup disperseRef={disperseRef} />
        <EffectComposer>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.15}
            luminanceSmoothing={0.85}
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
