'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SpiralProps {
  color?: string
  speed?: number
  radius?: number
}

export function Spiral({ 
  color = '#00ff88', 
  speed = 1,
  radius = 5 
}: SpiralProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const geometryRef = useRef<THREE.BufferGeometry>(null)
  
  // Create spiral geometry
  const points = []
  const segments = 200
  const turns = 5
  
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const angle = t * Math.PI * 2 * turns
    const r = t * radius
    const x = Math.cos(angle) * r
    const y = t * 10 - 5
    const z = Math.sin(angle) * r
    points.push(new THREE.Vector3(x, y, z))
  }
  
  const curve = new THREE.CatmullRomCurve3(points)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01 * speed
    }
  })
  
  return (
    <mesh ref={meshRef}>
      <tubeGeometry args={[curve, 100, 0.1, 8, false]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  )
}