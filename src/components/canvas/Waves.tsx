'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface WavesProps {
  color?: string
  amplitude?: number
  frequency?: number
  speed?: number
}

export function Waves({ 
  color = '#0088ff',
  amplitude = 0.5,
  frequency = 0.2,
  speed = 1
}: WavesProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current && meshRef.current.geometry) {
      const time = state.clock.elapsedTime * speed
      const geometry = meshRef.current.geometry as THREE.PlaneGeometry
      const { position } = geometry.attributes
      
      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i)
        const y = position.getY(i)
        
        const wave1 = Math.sin(x * frequency + time) * amplitude
        const wave2 = Math.sin(y * frequency * 0.8 + time * 1.2) * amplitude * 0.5
        
        position.setZ(i, wave1 + wave2)
      }
      
      position.needsUpdate = true
      geometry.computeVertexNormals()
    }
  })
  
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 20, 64, 64]} />
      <meshStandardMaterial
        color={color}
        metalness={0.3}
        roughness={0.4}
        wireframe={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}