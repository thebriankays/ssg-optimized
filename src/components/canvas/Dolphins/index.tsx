'use client'

import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { ScrollScene, UseCanvas, useScrollRig } from '@14islands/r3f-scroll-rig'
import * as THREE from 'three'

interface DolphinsSceneContentProps {
  scale: [number, number, number] | any
}

function DolphinsSceneContent({ scale }: DolphinsSceneContentProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  
  console.log('DolphinsSceneContent rendering with scale:', scale)
  
  // Force render updates
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.01
    }
    
    if (groupRef.current) {
      // Subtle floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1
    }
  })
  
  // Use scale properly - it's a proxy object with array-like access
  const scaleArray: [number, number, number] = scale ? 
    [scale[0] || 1, scale[1] || 1, scale[2] || 1] : 
    [1, 1, 1]
  
  return (
    <group ref={groupRef} scale={scaleArray}>
      {/* Ocean plane */}
      <mesh rotation-x={-Math.PI / 2} position-y={-2}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#001e0f" />
      </mesh>
      
      {/* Test dolphin shape (elongated sphere) */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#4a90e2" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Additional test objects to verify rendering */}
      <mesh position={[2, 0, 0]}>
        <coneGeometry args={[0.3, 1, 8]} />
        <meshStandardMaterial color="#66b3ff" />
      </mesh>
      
      <mesh position={[-2, 0, 0]}>
        <coneGeometry args={[0.3, 1, 8]} />
        <meshStandardMaterial color="#3399ff" />
      </mesh>
      
      {/* Ambient and directional light for the scene */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
    </group>
  )
}

interface DolphinsProps {
  className?: string
  dolphinCount?: number
  showBubbles?: boolean
  autoCamera?: boolean
  showSky?: boolean
  waterColor?: string
  skyColor?: string
  animationSpeed?: number
}

export function Dolphins({ 
  className = '',
  waterColor = '#001e0f',
  skyColor = '#87CEEB',
  showSky = true
}: DolphinsProps) {
  // Use any type to bypass r3f-scroll-rig's strict typing
  const proxy = useRef<any>(null)
  const [mounted, setMounted] = useState(false)
  
  // Ensure the element is properly mounted and has dimensions
  useEffect(() => {
    // Give the DOM time to render and calculate dimensions
    const timer = setTimeout(() => {
      if (proxy.current) {
        const rect = proxy.current.getBoundingClientRect()
        console.log('Proxy element dimensions:', rect.width, 'x', rect.height)
        if (rect.width > 0 && rect.height > 0) {
          setMounted(true)
        }
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <>
      {/* DOM proxy that defines the block size & gradient */}
      <div className={`dolphins-scene ${className}`}>
        <div
          ref={proxy}
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

      {/* Only mount the scene after the proxy element has dimensions */}
      {mounted && (
        <UseCanvas>
          <ScrollScene track={proxy} hideOffscreen={false}>
            {(props) => {
              console.log('ScrollScene render function called with props:', props)
              // If scale is still 0, use default scale
              const hasValidScale = props.scale && (props.scale[0] > 0 || props.scale[1] > 0)
              const finalScale = hasValidScale ? props.scale : [10, 10, 1]
              return <DolphinsSceneContent scale={finalScale} />
            }}
          </ScrollScene>
        </UseCanvas>
      )}
    </>
  )
}