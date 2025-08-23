'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MeshBannerMaterial } from '../materials/MeshBannerMaterial'
import { createGradientTexture } from '../utils/textureHelpers'
import type { BannerProps } from '../types'

export function Banner({
  count = 20,
  radius = 3,
  height = 0.1,
  gradientColors = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'],
}: BannerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const materialsRef = useRef<MeshBannerMaterial[]>([])
  
  // Create gradient texture
  const gradientTexture = useMemo(() => {
    return createGradientTexture(gradientColors)
  }, [gradientColors])
  
  // Create banner strips
  const banners = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = (Math.random() - 0.5) * 4
      
      return {
        position: [x, y, z] as [number, number, number],
        rotation: [0, angle + Math.PI / 2, 0] as [number, number, number],
        scale: 1 + Math.random() * 0.5,
        speed: 0.5 + Math.random() * 1.5,
      }
    })
  }, [count, radius])
  
  useFrame((state) => {
    // Update material time uniforms
    materialsRef.current.forEach(material => {
      if (material) {
        material.updateTime(state.clock.elapsedTime)
      }
    })
    
    // Rotate entire group
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })
  
  return (
    <group ref={groupRef}>
      {banners.map((banner, index) => (
        <mesh
          key={index}
          position={banner.position}
          rotation={banner.rotation}
          scale={banner.scale}
        >
          <planeGeometry args={[2, height]} />
          <primitive
            object={new MeshBannerMaterial({
              gradientTexture,
              speed: banner.speed,
            })}
            attach="material"
            ref={(ref: MeshBannerMaterial) => {
              if (ref) materialsRef.current[index] = ref
            }}
          />
        </mesh>
      ))}
    </group>
  )
}