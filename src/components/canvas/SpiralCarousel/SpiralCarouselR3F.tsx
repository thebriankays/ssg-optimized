'use client'

import { useRef, useMemo, useState, useCallback } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useGSAPAnimation } from '@/hooks/useGSAPAnimation'
import type { SpiralCarouselItem, SpiralItemData, SpiralCarouselState } from './types'
import { vertexShader, fragmentShader } from './shaders'

// Extend THREE with custom shader material
class SpiralMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: { value: null },
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uActive: { value: 0 },
        uBrightness: { value: 1 },
        uOpacity: { value: 1 },
        uZoomScale: { value: 0 },
        uWaveMultiplier: { value: 1 },
        uTextureSize: { value: new THREE.Vector2(1, 1) },
        uPlaneSize: { value: new THREE.Vector2(1, 1) },
      },
      transparent: true,
      side: THREE.DoubleSide,
    })
  }
}

extend({ SpiralMaterial })

declare module '@react-three/fiber' {
  interface ThreeElements {
    spiralMaterial: any
  }
}

interface SpiralCarouselR3FProps {
  items: SpiralCarouselItem[]
  radius?: number
  angleBetween?: number
  verticalDistance?: number
  itemWidth?: number
  itemHeight?: number
  onItemClick?: (item: SpiralCarouselItem, index: number) => void
  onItemHover?: (item: SpiralCarouselItem | null, index: number | null) => void
}

export function SpiralCarouselR3F({
  items,
  radius = 2.5,
  angleBetween = Math.PI / 3,
  verticalDistance = 1,
  itemWidth = 1,
  itemHeight = 2.5,
  onItemClick,
  onItemHover,
}: SpiralCarouselR3FProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { camera, size, raycaster, pointer } = useThree()
  
  const [state, setState] = useState<SpiralCarouselState>({
    activeIndex: null,
    hoveredIndex: null,
    progress: 0,
    isDragging: false,
    dragStart: null,
    velocity: 0,
  })
  
  // Load all textures
  const textures = useTexture(items.map(item => item.image))
  
  // Calculate spiral positions
  const spiralData = useMemo<SpiralItemData[]>(() => {
    return items.map((item, index) => {
      const angle = index * angleBetween + state.progress
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = (index * verticalDistance) % (items.length * verticalDistance)
      
      return {
        item,
        index,
        position: new THREE.Vector3(x, y, z),
        rotation: new THREE.Euler(0, -angle + Math.PI / 2, 0),
        scale: 1,
        opacity: 1,
      }
    })
  }, [items, radius, angleBetween, verticalDistance, state.progress])
  
  // Handle wheel scrolling
  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault()
    const delta = event.deltaY * 0.001
    setState(prev => ({
      ...prev,
      progress: prev.progress + delta,
      velocity: delta,
    }))
  }, [])
  
  // Handle pointer interactions
  const handlePointerDown = useCallback((event: PointerEvent) => {
    setState(prev => ({
      ...prev,
      isDragging: true,
      dragStart: { x: event.clientX, y: event.clientY },
    }))
  }, [])
  
  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!state.isDragging || !state.dragStart) return
    
    const deltaX = event.clientX - state.dragStart.x
    const progress = deltaX * 0.005
    
    setState(prev => ({
      ...prev,
      progress: prev.progress + progress,
      dragStart: { x: event.clientX, y: event.clientY },
      velocity: progress,
    }))
  }, [state.isDragging, state.dragStart])
  
  const handlePointerUp = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDragging: false,
      dragStart: null,
    }))
  }, [])
  
  // Set up event listeners
  useFrame(() => {
    // Damping for velocity
    setState(prev => ({
      ...prev,
      velocity: prev.velocity * 0.95,
      progress: prev.progress + prev.velocity * 0.1,
    }))
    
    // Update raycaster for hover detection
    raycaster.setFromCamera(pointer, camera)
  })
  
  // Add wheel and pointer event listeners
  useFrame(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerup', handlePointerUp)
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerup', handlePointerUp)
    }
  })
  
  return (
    <group ref={groupRef}>
      {spiralData.map(({ item, index, position, rotation }, i) => {
        const texture = Array.isArray(textures) ? textures[i] : textures
        const isActive = state.activeIndex === index
        const isHovered = state.hoveredIndex === index
        
        return (
          <group
            key={item.id}
            position={position}
            rotation={rotation}
          >
            <mesh
              onClick={() => {
                setState(prev => ({
                  ...prev,
                  activeIndex: prev.activeIndex === index ? null : index,
                }))
                onItemClick?.(item, index)
              }}
              onPointerOver={() => {
                setState(prev => ({ ...prev, hoveredIndex: index }))
                onItemHover?.(item, index)
              }}
              onPointerOut={() => {
                setState(prev => ({ ...prev, hoveredIndex: null }))
                onItemHover?.(null, null)
              }}
              scale={isHovered ? 1.1 : isActive ? 1.2 : 1}
            >
              <planeGeometry args={[itemWidth, itemHeight, 32, 32]} />
              <spiralMaterial
                key={SpiralMaterial.name}
                uTexture={texture}
                uTime={0}
                uProgress={state.progress}
                uActive={isActive ? 1 : 0}
                uBrightness={isHovered ? 1.2 : 1}
                uOpacity={isActive ? 1 : 0.8}
                uZoomScale={isActive ? 0.2 : 0}
                uWaveMultiplier={isActive ? 1 : 0}
                uTextureSize={[
                  texture.image?.width || 1,
                  texture.image?.height || 1,
                ]}
                uPlaneSize={[itemWidth, itemHeight]}
              />
            </mesh>
            
            {/* Additional copies for active item effect */}
            {isActive && (
              <>
                <mesh position={[0.1, 0.1, -0.05]} scale={0.9} rotation={[0, 0, 0.1]}>
                  <planeGeometry args={[itemWidth, itemHeight, 32, 32]} />
                  <spiralMaterial
                    uTexture={texture}
                    uTime={0}
                    uProgress={state.progress}
                    uActive={0.5}
                    uBrightness={0.8}
                    uOpacity={0.6}
                    uZoomScale={0.1}
                    uWaveMultiplier={0.5}
                    uTextureSize={[
                      texture.image?.width || 1,
                      texture.image?.height || 1,
                    ]}
                    uPlaneSize={[itemWidth, itemHeight]}
                  />
                </mesh>
                <mesh position={[-0.1, -0.1, -0.1]} scale={0.8} rotation={[0, 0, -0.1]}>
                  <planeGeometry args={[itemWidth, itemHeight, 32, 32]} />
                  <spiralMaterial
                    uTexture={texture}
                    uTime={0}
                    uProgress={state.progress}
                    uActive={0.3}
                    uBrightness={0.6}
                    uOpacity={0.4}
                    uZoomScale={0.05}
                    uWaveMultiplier={0.3}
                    uTextureSize={[
                      texture.image?.width || 1,
                      texture.image?.height || 1,
                    ]}
                    uPlaneSize={[itemWidth, itemHeight]}
                  />
                </mesh>
              </>
            )}
          </group>
        )
      })}
      
      {/* Ambient and directional lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} />
    </group>
  )
}