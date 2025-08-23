'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGSAPAnimation } from '@/hooks/useGSAPAnimation'
import { gsap } from 'gsap'
import * as THREE from 'three'

const vertexShader = `
  precision highp float;
  varying vec2 vUv;

  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  precision highp float;

  uniform float uProgress;
  uniform float uPower;
  uniform bool uOut;

  vec4 transparent = vec4(0.0, 0.0, 0.0, 0.0);
  vec4 black = vec4(0.0, 0.0, 0.0, 1.0);

  #define M_PI 3.1415926535897932384626433832795

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    uv.y -= ((sin(uv.x * M_PI) * uPower) * 0.25);

    if (!uOut) uv.y = 1.0 - uv.y;

    float t = smoothstep(uv.y - fwidth(uv.y), uv.y, uProgress);
    vec4 color = mix(transparent, black, t);

    gl_FragColor = color;
  }  
`

interface TransitionMeshProps {
  isTransitioning: boolean
  direction: 'out' | 'in'
  onComplete: () => void
}

function TransitionMesh({ isTransitioning, direction, onComplete }: TransitionMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size } = useThree()
  
  const uniforms = useRef({
    uProgress: { value: 0 },
    uPower: { value: 0 },
    uOut: { value: true }
  })

  // Update mesh scale when size changes
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.set(size.width / 2, size.height / 2, 1)
    }
  })

  // Animation logic
  useGSAPAnimation(() => {
    if (!isTransitioning || !materialRef.current) return

    const tl = gsap.timeline({ 
      defaults: {
        duration: 1.25,
        ease: 'power3.inOut'
      },
      onComplete
    })

    const createBendTimeline = () => {
      return gsap.timeline({ 
        paused: true,
        defaults: {
          ease: 'linear',
          duration: 0.5        
        },
      })
      .to(uniforms.current.uPower, { value: 1 })
      .to(uniforms.current.uPower, { value: 0 })
    }

    if (direction === 'out') {
      uniforms.current.uOut.value = true
      tl.to(uniforms.current.uProgress, { value: 1 }, 0)
        .to(createBendTimeline(), { progress: 1 }, 0)
    } else {
      uniforms.current.uOut.value = false
      tl.to(uniforms.current.uProgress, { value: 0 }, 0)
        .to(createBendTimeline(), { progress: 1 }, 0)
        .set(uniforms.current.uOut, { value: true })
    }

    return () => {
      tl.kill()
    }
  }, [isTransitioning, direction])

  return (
    <mesh
      ref={meshRef}
      frustumCulled={false}
      position={[0, 0, 0]}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3]}
        />
        <bufferAttribute
          attach="attributes-uv"
          args={[new Float32Array([0, 0, 2, 0, 0, 2]), 2]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}

interface PageTransitionProps {
  isTransitioning: boolean
  direction: 'out' | 'in'
  onComplete: () => void
}

export function PageTransition({ isTransitioning, direction, onComplete }: PageTransitionProps) {
  if (!isTransitioning) return null

  // Handle SSR - default to reasonable viewport size
  const width = typeof window !== 'undefined' ? window.innerWidth : 1920
  const height = typeof window !== 'undefined' ? window.innerHeight : 1080

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <Canvas
        orthographic
        camera={{ 
          position: [0, 0, 1],
          left: -width / 2,
          right: width / 2,
          top: height / 2,
          bottom: -height / 2,
          near: 1,
          far: 100
        }}
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
        gl={{ 
          alpha: true, 
          antialias: true,
          premultipliedAlpha: false
        }}
      >
        <TransitionMesh
          isTransitioning={isTransitioning}
          direction={direction}
          onComplete={onComplete}
        />
      </Canvas>
    </div>
  )
}