'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { RefObject } from 'react'

interface TransitionPortalProps {
  isTransitioning: boolean
  direction: 'forward' | 'backward' | null
  onComplete: () => void
  containerRef: RefObject<HTMLElement>
}

export function TransitionPortal({
  isTransitioning,
  direction,
  onComplete,
  containerRef
}: TransitionPortalProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const progressRef = useRef(0)

  useEffect(() => {
    if (isTransitioning) {
      progressRef.current = 0
    }
  }, [isTransitioning])

  useFrame((state, delta) => {
    if (!meshRef.current || !isTransitioning) return

    // Animate transition progress
    progressRef.current = Math.min(progressRef.current + delta * 2, 1)

    // Update material uniforms or mesh properties
    const material = meshRef.current.material as THREE.ShaderMaterial
    if (material.uniforms) {
      material.uniforms.progress.value = progressRef.current
      material.uniforms.direction.value = direction === 'forward' ? 1 : -1
    }

    // Complete transition when done
    if (progressRef.current >= 1) {
      setTimeout(onComplete, 100)
    }
  })

  if (!isTransitioning) return null

  return (
    <mesh ref={meshRef} position={[0, 0, 10]}>
      <planeGeometry args={[50, 50]} />
      <shaderMaterial
        transparent
        uniforms={{
          progress: { value: 0 },
          direction: { value: direction === 'forward' ? 1 : -1 },
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float progress;
          uniform float direction;
          varying vec2 vUv;
          
          void main() {
            float edge = smoothstep(0.0, 1.0, progress);
            float wipe = direction > 0.0 
              ? step(vUv.x, edge)
              : step(1.0 - vUv.x, edge);
            
            gl_FragColor = vec4(0.0, 0.0, 0.0, wipe);
          }
        `}
      />
    </mesh>
  )
}