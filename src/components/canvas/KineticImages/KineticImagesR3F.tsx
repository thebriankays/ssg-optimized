'use client'

import { Suspense, useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { Billboard } from './components/Billboard'
import { Banner } from './components/Banner'
import { createCollageTexture } from './utils/textureHelpers'
import type { KineticImagesConfig } from './types'

interface KineticImagesR3FProps extends KineticImagesConfig {
  variant?: 'tower' | 'paper' | 'spiral'
}

function TowerVariant({ texture }: { texture: THREE.Texture }) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
    }
  })
  
  return (
    <group ref={groupRef}>
      {/* Central tower of billboards */}
      {Array.from({ length: 8 }, (_, i) => (
        <Billboard
          key={i}
          texture={texture}
          position={[0, i * 0.5 - 2, 0]}
          rotation={[0, (i * Math.PI) / 4, 0]}
          scale={[1, 1, 1]}
          variant={i % 2 === 0 ? 'front' : 'back'}
        />
      ))}
      
      {/* Surrounding banners */}
      <Banner count={15} radius={4} />
    </group>
  )
}

function PaperVariant({ texture }: { texture: THREE.Texture }) {
  const { scene } = useGLTF('/models/paper.glb')
  const clonedScene = useMemo(() => scene.clone(), [scene])
  
  useEffect(() => {
    // Apply texture to paper model
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          map: texture,
          side: THREE.DoubleSide,
        })
      }
    })
  }, [clonedScene, texture])
  
  return (
    <group>
      <primitive object={clonedScene} scale={0.5} />
      <Banner count={10} radius={3} height={0.05} />
    </group>
  )
}

function SpiralVariant({ texture }: { texture: THREE.Texture }) {
  const { scene } = useGLTF('/models/spiral.glb')
  const clonedScene = useMemo(() => scene.clone(), [scene])
  const groupRef = useRef<THREE.Group>(null)
  
  useEffect(() => {
    // Apply texture to spiral model
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          map: texture,
          metalness: 0.2,
          roughness: 0.8,
        })
      }
    })
  }, [clonedScene, texture])
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })
  
  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} scale={0.3} />
      <Banner count={20} radius={2} height={0.08} />
    </group>
  )
}

export function KineticImagesR3F({
  images,
  variant = 'tower',
  autoRotate = true,
  rotateSpeed = 0.5,
  scrollSpeed = 1,
  gap = 10,
  canvasSize = 512,
  enableInteraction = true,
}: KineticImagesR3FProps) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  
  // Create collage texture from images
  useEffect(() => {
    const createTexture = async () => {
      try {
        const imageSrcs = images.map(img => img.src)
        const collageTexture = await createCollageTexture({
          images: imageSrcs,
          gap,
          canvasWidth: canvasSize,
          canvasHeight: canvasSize,
          axis: 'x',
        })
        setTexture(collageTexture)
      } catch (error) {
        console.error('Failed to create collage texture:', error)
      }
    }
    
    if (images.length > 0) {
      createTexture()
    }
  }, [images, gap, canvasSize])
  
  if (!texture) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
    )
  }
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#ff6b6b" />
      
      {/* Main content */}
      <Suspense fallback={null}>
        {variant === 'tower' && <TowerVariant texture={texture} />}
        {variant === 'paper' && <PaperVariant texture={texture} />}
        {variant === 'spiral' && <SpiralVariant texture={texture} />}
      </Suspense>
      
      {/* Controls */}
      {enableInteraction && (
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={autoRotate}
          autoRotate={autoRotate}
          autoRotateSpeed={rotateSpeed}
          minDistance={5}
          maxDistance={20}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
        />
      )}
    </>
  )
}

// Preload models
useGLTF.preload('/models/paper.glb')
useGLTF.preload('/models/spiral.glb')