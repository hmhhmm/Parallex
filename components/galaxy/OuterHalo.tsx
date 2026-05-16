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

export default function OuterHalo({ disperseRef }: Props) {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const uniforms = useMemo(() => ({
    uTime:     { value: 0 },
    uDisperse: { value: 0 },
  }), [])

  const { positions, colors, sizes } = useMemo(() => {
    const count = 4500
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const r = 3.2 + Math.random() * 3.8
      const theta = Math.random() * Math.PI * 2
      const y = gaussianRandom(0.14)

      positions[i * 3] = Math.cos(theta) * r * 1.4
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = Math.sin(theta) * r

      const pick = Math.random()
      const base = pick < 0.40
        ? new THREE.Color('#003399')
        : pick < 0.65
          ? new THREE.Color('#440088')
          : pick < 0.82
            ? new THREE.Color('#880044')
            : new THREE.Color('#004466')

      const brightness = 0.18 + Math.random() * 0.32
      colors[i * 3] = base.r * brightness
      colors[i * 3 + 1] = base.g * brightness
      colors[i * 3 + 2] = base.b * brightness

      sizes[i] = 0.015 + Math.random() * 0.035
    }

    return { positions, colors, sizes }
  }, [])

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = clock.elapsedTime
      matRef.current.uniforms.uDisperse.value = disperseRef.current
    }
  })

  return (
    <points>
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
