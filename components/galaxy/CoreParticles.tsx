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

interface Props {
  disperseRef: MutableRefObject<number>
}

export default function CoreParticles({ disperseRef }: Props) {
  const meshRef = useRef<THREE.Points>(null)
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({
    uTime:     { value: 0 },
    uDisperse: { value: 0 },
  }), [])

  const { positions, colors, sizes } = useMemo(() => {
    const count = 320
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    const white = new THREE.Color('#FFFFFF')
    const cyan = new THREE.Color('#00FFFF')
    const brightBlue = new THREE.Color('#44AAFF')

    for (let i = 0; i < count; i++) {
      const r = Math.abs(gaussianRandom(0.38))
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 1.3
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.25
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)

      const t = Math.min(r / 0.8, 1.0)
      const color = white.clone().lerp(cyan, t * 0.7).lerp(brightBlue, t)
      // Keep core dim so the hero title stays readable
      const dim = 0.35 + Math.random() * 0.20
      colors[i * 3] = color.r * dim
      colors[i * 3 + 1] = color.g * dim
      colors[i * 3 + 2] = color.b * dim

      sizes[i] = 0.04 + Math.random() * 0.07
    }

    return { positions, colors, sizes }
  }, [])

  useFrame(({ clock }) => {
    if (meshRef.current) meshRef.current.rotation.y += 0.0005
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
