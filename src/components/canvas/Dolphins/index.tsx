'use client'

import { useRef, useEffect, useState, Suspense } from 'react'
import { UseCanvas } from '@14islands/r3f-scroll-rig'
import ViewportScrollScene from '@/components/canvas/ViewportScrollScene'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

/* ---------------- Ultra-simple dolphin that just rotates ---------------- */
function RotatingDolphin({ 
  position = [0, 0, 0],
  color = '#4a90e2'
}: { 
  position?: [number, number, number]
  color?: string
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05
    }
  })
  
  return (
    <mesh ref={meshRef} position={position}>
      <coneGeometry args={[0.05, 0.2, 8]} />
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
    </mesh>
  )
}

/* ---------------- Minimal scene with just dolphins ---------------- */
function MinimalDolphinsScene() {
  const { camera } = useThree()
  
  useEffect(() => {
    camera.position.set(0, 0.5, 2)
    camera.lookAt(0, 0, 0)
  }, [camera])
  
  return (
    <>
      {/* Basic lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      
      {/* Three simple rotating dolphins */}
      <RotatingDolphin position={[-0.5, 0, 0]} color="#4a90e2" />
      <RotatingDolphin position={[0, 0, 0]} color="#5aa0f2" />
      <RotatingDolphin position={[0.5, 0, 0]} color="#3a80d2" />
      
      {/* Simple ocean floor plane (no water effect) */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.5}>
        <circleGeometry args={[2, 32]} />
        <meshStandardMaterial color="#001e0f" />
      </mesh>
      
      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        maxPolarAngle={Math.PI * 0.495}
        target={[0, 0, 0]}
        minDistance={1}
        maxDistance={4}
      />
    </>
  )
}

/* ---------------- Public component ---------------- */
export function Dolphins({
  className = '',
  dolphinCount = 3,
  showBubbles = true,
  showSky = true,
  animationSpeed = 1,
  waterColor = '#001e0f',
  skyColor = '#87CEEB',
}: {
  className?: string
  dolphinCount?: number
  showBubbles?: boolean
  autoCamera?: boolean
  showSky?: boolean
  animationSpeed?: number
  waterColor?: string
  skyColor?: string
}) {
  const proxy = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => { 
    const timer = setTimeout(() => {
      setActive(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <div className={`dolphins-scene ${className}`}>
        <div
          ref={proxy}
          data-active={active ? 'true' : 'false'}
          className="dolphins-proxy"
          style={{
            height: '100vh',
            minHeight: '600px',
            width: '100%',
            background: showSky
              ? `linear-gradient(to bottom, ${skyColor} 0%, ${waterColor} 50%, #000080 100%)`
              : waterColor,
            position: 'relative',
          }}
        />
      </div>

      <UseCanvas>
        <ViewportScrollScene track={proxy} hideOffscreen={false} scissor>
          {(props) => (
            <group {...props}>
              <Suspense fallback={null}>
                <MinimalDolphinsScene />
              </Suspense>
            </group>
          )}
        </ViewportScrollScene>
      </UseCanvas>
    </>
  )
}