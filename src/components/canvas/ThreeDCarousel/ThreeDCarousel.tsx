'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, Box, Sphere, Cylinder } from '@react-three/drei'
import * as THREE from 'three'
import { ViewportScrollScene } from '@/components/canvas/ViewportScrollScene'
import { UseCanvas } from '@14islands/r3f-scroll-rig'
import { GlassCard } from '@/components/ui/glass/GlassCard'

interface ThreeDItem {
  id: string
  image?: string
  color?: string
  shape: 'box' | 'sphere' | 'cylinder'
  title?: string
  description?: string
}

interface ThreeDCarouselProps {
  items: ThreeDItem[]
  radius?: number
  autoRotate?: boolean
  rotateSpeed?: number
  className?: string
}

function ThreeDCarouselR3F({
  items,
  radius = 4,
  autoRotate = true,
  rotateSpeed = 0.3,
  currentIndex,
  onItemClick,
}: ThreeDCarouselProps & {
  currentIndex: number
  onItemClick: (index: number) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      if (autoRotate) {
        groupRef.current.rotation.y = state.clock.elapsedTime * rotateSpeed * 0.1
      }
      
      // Animate individual items
      groupRef.current.children.forEach((child, index) => {
        if (child instanceof THREE.Group) {
          const isActive = index === currentIndex
          child.scale.setScalar(isActive ? 1.3 : 1)
          child.position.y = Math.sin(state.clock.elapsedTime + index) * 0.2
        }
      })
    }
  })
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.6} />
      <pointLight position={[-10, 0, -5]} intensity={0.3} color="#ff6b6b" />
      
      <group ref={groupRef}>
        {items.map((item, index) => {
          const angle = (index / items.length) * Math.PI * 2
          const x = Math.cos(angle) * radius
          const z = Math.sin(angle) * radius
          const isActive = index === currentIndex
          
          return (
            <group
              key={item.id}
              position={[x, 0, z]}
              onClick={() => onItemClick(index)}
            >
              {item.shape === 'box' && (
                <Box args={[1, 1, 1]}>
                  <meshStandardMaterial
                    color={item.color || '#00ff88'}
                    emissive={isActive ? item.color || '#00ff88' : '#000000'}
                    emissiveIntensity={isActive ? 0.2 : 0}
                  />
                </Box>
              )}
              
              {item.shape === 'sphere' && (
                <Sphere args={[0.6, 32, 32]}>
                  <meshStandardMaterial
                    color={item.color || '#ff6b6b'}
                    emissive={isActive ? item.color || '#ff6b6b' : '#000000'}
                    emissiveIntensity={isActive ? 0.2 : 0}
                    metalness={0.3}
                    roughness={0.7}
                  />
                </Sphere>
              )}
              
              {item.shape === 'cylinder' && (
                <Cylinder args={[0.5, 0.5, 1.5, 32]}>
                  <meshStandardMaterial
                    color={item.color || '#4ecdc4'}
                    emissive={isActive ? item.color || '#4ecdc4' : '#000000'}
                    emissiveIntensity={isActive ? 0.2 : 0}
                    metalness={0.5}
                    roughness={0.5}
                  />
                </Cylinder>
              )}
            </group>
          )
        })}
      </group>
    </>
  )
}

export function ThreeDCarousel({
  items,
  radius = 4,
  autoRotate = true,
  rotateSpeed = 0.3,
  className = '',
}: ThreeDCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const proxyRef = useRef<HTMLDivElement>(null)
  
  const currentItem = items[currentIndex]
  
  return (
    <section className={`block three-d-carousel ${className}`}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">3D Carousel</h2>
      </div>
      
      {/* SMALL proxy to track – this is key */}
      <div ref={proxyRef} className="webgl-proxy h-[60vh] rounded-lg" />
      
      <UseCanvas>
        <ViewportScrollScene
          track={proxyRef as React.MutableRefObject<HTMLElement>}
          hideOffscreen={false}
        >
          {() => (
            <ThreeDCarouselR3F
              items={items}
              radius={radius}
              autoRotate={autoRotate}
              rotateSpeed={rotateSpeed}
              currentIndex={currentIndex}
              onItemClick={setCurrentIndex}
            />
          )}
        </ViewportScrollScene>
      </UseCanvas>
      
      {/* Item Info */}
      {currentItem && (
        <GlassCard
          variant="frosted"
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            padding: '20px',
            minWidth: '250px',
            zIndex: 10,
          }}
        >
          <h3 style={{ margin: '0 0 10px', color: 'white' }}>
            {currentItem.title || `${currentItem.shape} ${currentIndex + 1}`}
          </h3>
          {currentItem.description && (
            <p style={{ margin: '0 0 10px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
              {currentItem.description}
            </p>
          )}
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
            <p>Shape: {currentItem.shape}</p>
            <p>Color: {currentItem.color || 'Default'}</p>
            <p>Item {currentIndex + 1} of {items.length}</p>
          </div>
        </GlassCard>
      )}
      
      {/* Navigation */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        zIndex: 10,
      }}>
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              background: index === currentIndex 
                ? 'rgba(255, 255, 255, 0.2)' 
                : 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </section>
  )
}