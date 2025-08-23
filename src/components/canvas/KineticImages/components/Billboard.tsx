'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MeshImageMaterial } from '../materials/MeshImageMaterial'
import type { BillboardProps } from '../types'

export function Billboard({
  texture,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  variant = 'front',
}: BillboardProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<MeshImageMaterial>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1
      
      // Gentle rotation
      meshRef.current.rotation.y = rotation[1] + Math.sin(state.clock.elapsedTime * 0.2) * 0.05
    }
  })
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      {/* Cylindrical geometry for billboard effect */}
      <cylinderGeometry args={[1, 1, 2, 8, 1, true]} />
      <primitive 
        object={new MeshImageMaterial({
          map: texture,
          side: THREE.DoubleSide,
          frontFacing: variant === 'front',
          backColor: variant === 'front' ? 0x333333 : 0x111111,
        })}
        ref={materialRef}
      />
    </mesh>
  )
}