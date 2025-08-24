'use client'

import { useRef, useEffect, useMemo, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGSAPAnimation } from '@/hooks/useGSAPAnimation'
import { gsap } from 'gsap'
import * as THREE from 'three'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uProgress;
  uniform float uPower;
  uniform float uOut;
  
  varying vec2 vUv;
  
  void main() {
    vec2 uv = vUv;
    
    // Apply wave distortion
    float wave = sin(uv.x * 3.14159) * uPower * 0.25;
    uv.y = uv.y - wave;
    
    // Flip direction if needed
    if (uOut < 0.5) {
      uv.y = 1.0 - uv.y;
    }
    
    // Create transition effect
    float edge = 0.01;
    float t = smoothstep(uProgress - edge, uProgress + edge, uv.y);
    
    // Output color
    gl_FragColor = vec4(0.0, 0.0, 0.0, t);
  }
`

interface PageTransitionSceneProps {
  isTransitioning: boolean
  direction: 'out' | 'in'
  onComplete: () => void
}

export function PageTransitionScene({ isTransitioning, direction, onComplete }: PageTransitionSceneProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { camera, size, gl } = useThree()
  const [shaderError, setShaderError] = useState(false)
  
  // Create uniforms with useMemo to ensure stable reference
  const uniforms = useMemo(() => ({
    uProgress: { value: 0 },
    uPower: { value: 0 },
    uOut: { value: 1 } // Use float instead of boolean
  }), [])

  // Ensure we don't render if not transitioning or WebGL not ready
  if (!isTransitioning || !gl || shaderError) return null

  // Setup orthographic view for transition
  useEffect(() => {
    if (camera && 'isOrthographicCamera' in camera) {
      const orthoCamera = camera as THREE.OrthographicCamera
      orthoCamera.left = -size.width / 2
      orthoCamera.right = size.width / 2
      orthoCamera.top = size.height / 2
      orthoCamera.bottom = -size.height / 2
      orthoCamera.updateProjectionMatrix()
    }
  }, [camera, size])

  // Update mesh scale to cover viewport
  useFrame(() => {
    if (meshRef.current) {
      // Scale mesh to cover the full viewport
      const worldScale = size.width / 100 // Convert pixels to world units
      meshRef.current.scale.set(worldScale * 50, worldScale * 50 * (size.height / size.width), 1)
      // Position at camera to ensure it's always visible
      meshRef.current.position.copy(camera.position)
      meshRef.current.position.z -= 1
      meshRef.current.lookAt(camera.position)
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
      .to(uniforms.uPower, { value: 1 })
      .to(uniforms.uPower, { value: 0 })
    }

    if (direction === 'out') {
      uniforms.uOut.value = 1
      tl.to(uniforms.uProgress, { value: 1 }, 0)
        .to(createBendTimeline(), { progress: 1 }, 0)
    } else {
      uniforms.uOut.value = 0
      tl.to(uniforms.uProgress, { value: 0 }, 0)
        .to(createBendTimeline(), { progress: 1 }, 0)
        .set(uniforms.uOut, { value: 1 })
    }

    return () => {
      tl.kill()
    }
  }, [isTransitioning, direction, uniforms])

  return (
    <mesh
      ref={meshRef}
      frustumCulled={false}
      renderOrder={9999} // Ensure it renders on top
    >
      <planeGeometry args={[2, 2, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
        side={THREE.DoubleSide}
        onBeforeCompile={(shader) => {
          try {
            console.log('Page transition shader compiled successfully')
          } catch (error) {
            console.error('Shader compilation error:', error)
            setShaderError(true)
          }
        }}
      />
    </mesh>
  )
}