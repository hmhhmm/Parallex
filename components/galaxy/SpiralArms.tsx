'use client'

import { useMemo, useRef, MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { vertexShader, fragmentShader } from './pointShader'

function gaussianRandom(std = 1.0): number {
  const u = 1 - Math.random()
  const v = Math.random()
  return std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

function pickRingColor(): THREE.Color {
  const r = Math.random()
  if (r < 0.30) return new THREE.Color('#00FFFF')
  if (r < 0.52) return new THREE.Color('#22AAFF')
  if (r < 0.68) return new THREE.Color('#0044FF')
  if (r < 0.80) return new THREE.Color('#FF00FF')
  if (r < 0.90) return new THREE.Color('#AA00DD')
  return new THREE.Color('#FFFFFF')
}

interface Props {
  disperseRef: MutableRefObject<number>
}

export default function SpiralArms({ disperseRef }: Props) {
  const meshRef = useRef<THREE.Points>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({
    uTime:     { value: 0 },
    uDisperse: { value: 0 },
  }), [])

  const { positions, colors, sizes } = useMemo(() => {
    const count = 14000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const u = Math.random() * Math.PI * 2
      const radialOffset = gaussianRandom(0.42)
      const R = 2.0 + radialOffset
      const yScatter = gaussianRandom(0.055)

      positions[i * 3] = Math.cos(u) * R * 1.55
      positions[i * 3 + 1] = yScatter
      positions[i * 3 + 2] = Math.sin(u) * R

      const color = pickRingColor()
      const brightnessFactor = Math.min(Math.abs(R) / 1.5, 1.0)
      colors[i * 3] = color.r * brightnessFactor
      colors[i * 3 + 1] = color.g * brightnessFactor
      colors[i * 3 + 2] = color.b * brightnessFactor

      sizes[i] = 0.02 + Math.random() * 0.04
    }

    return { positions, colors, sizes }
  }, [])

  useFrame(({ clock }) => {
    if (meshRef.current) meshRef.current.rotation.y += 0.00020
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime
      matRef.current.uniforms.uDisperse.value = disperseRef.current
    }
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        transparent
        vertexColors
      />
    </points>
  )
}
