'use client'

import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { flagVertexShader, flagFragmentShader } from './shaders/flagShaders'
import type { FlagProps } from './types'

export function AnimatedFlagR3F({
  flagTexture,
  poleTexture,
  width = 2,
  height = 1.2,
  segments = 32,
  windStrength = 0.5,
  windDirection = [1, 0, 0],
  enablePhysics = true,
  autoWind = true,
  flagColor = '#ffffff',
  poleColor = '#8B4513',
  shadows = true,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  onClick,
  onHover,
}: FlagProps) {
  const flagMeshRef = useRef<THREE.Mesh>(null)
  const poleMeshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const [isHovered, setIsHovered] = useState(false)
  
  // Load textures
  const flagTextureMap = useTexture(flagTexture)
  const poleTextureMap = poleTexture ? useTexture(poleTexture) : null
  
  // Create shader material
  const flagMaterial = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      vertexShader: flagVertexShader,
      fragmentShader: flagFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uFlagTexture: { value: flagTextureMap },
        uWindStrength: { value: windStrength },
        uWindDirection: { value: new THREE.Vector3(...windDirection) },
        uFlagWidth: { value: width },
        uFlagHeight: { value: height },
        uFlagColor: { value: new THREE.Color(flagColor) },
        uOpacity: { value: 1 },
      },
      side: THREE.DoubleSide,
      transparent: true,
    })
    
    return material
  }, [flagTextureMap, windStrength, windDirection, width, height, flagColor])
  
  // Create pole material
  const poleMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: poleColor,
      map: poleTextureMap,
      metalness: 0.1,
      roughness: 0.8,
    })
  }, [poleColor, poleTextureMap])
  
  // Animation loop
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      
      // Auto wind variation
      if (autoWind) {
        const windVariation = Math.sin(state.clock.elapsedTime * 0.5) * 0.3 + 0.7
        materialRef.current.uniforms.uWindStrength.value = windStrength * windVariation
      }
      
      // Hover effects
      if (isHovered) {
        materialRef.current.uniforms.uOpacity.value = 0.9
      } else {
        materialRef.current.uniforms.uOpacity.value = 1.0
      }
    }
  })
  
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Flag Pole */}
      <mesh
        ref={poleMeshRef}
        position={[-width / 2 - 0.05, 0, 0]}
        castShadow={shadows}
        receiveShadow={shadows}
      >
        <cylinderGeometry args={[0.02, 0.02, height * 1.5, 8]} />
        <primitive object={poleMaterial} />
      </mesh>
      
      {/* Flag */}
      <mesh
        ref={flagMeshRef}
        position={[0, height / 4, 0]}
        castShadow={shadows}
        receiveShadow={shadows}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          setIsHovered(true)
          onHover?.(true)
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setIsHovered(false)
          onHover?.(false)
        }}
      >
        <planeGeometry args={[width, height, segments, segments / 2]} />
        <primitive object={flagMaterial} ref={materialRef} />
      </mesh>
      
      {/* Optional ground shadow */}
      {shadows && (
        <mesh 
          position={[0, -height * 0.75, 0]} 
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[width * 2, width * 2]} />
          <shadowMaterial opacity={0.2} />
        </mesh>
      )}
    </group>
  )
}