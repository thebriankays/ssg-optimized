'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { ViewportScrollScene } from '@/components/canvas/ViewportScrollScene'
import { GlassCard } from '@/components/ui/glass/GlassCard'
import type { WebGLCarouselConfig, CarouselItem } from './types'

function CarouselItemMesh({
  item,
  index,
  totalItems,
  currentIndex,
  radius,
  itemWidth,
  itemHeight,
  onClick,
  onHover,
}: {
  item: CarouselItem
  index: number
  totalItems: number
  currentIndex: number
  radius: number
  itemWidth: number
  itemHeight: number
  onClick?: (item: CarouselItem, index: number) => void
  onHover?: (item: CarouselItem | null, index: number | null) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const texture = useTexture(item.image)
  const [isHovered, setIsHovered] = useState(false)
  
  const angle = useMemo(() => {
    return (index / totalItems) * Math.PI * 2
  }, [index, totalItems])
  
  const position = useMemo(() => {
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    return [x, 0, z] as [number, number, number]
  }, [angle, radius])
  
  const rotation = useMemo(() => {
    return [0, -angle + Math.PI / 2, 0] as [number, number, number]
  }, [angle])
  
  const isActive = index === currentIndex
  const scale = isActive ? 1.2 : isHovered ? 1.1 : 1
  const opacity = isActive ? 1 : isHovered ? 0.9 : 0.7
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={() => onClick?.(item, index)}
      onPointerOver={(e) => {
        e.stopPropagation()
        setIsHovered(true)
        onHover?.(item, index)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setIsHovered(false)
        onHover?.(null, null)
      }}
    >
      <planeGeometry args={[itemWidth, itemHeight]} />
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

function WebGLCarouselR3F({
  items,
  radius = 3,
  itemWidth = 1.5,
  itemHeight = 2,
  autoRotate = true,
  rotateSpeed = 0.5,
  currentIndex,
  onItemClick,
  onItemHover,
}: WebGLCarouselConfig & {
  currentIndex: number
  onItemClick?: (item: CarouselItem, index: number) => void
  onItemHover?: (item: CarouselItem | null, index: number | null) => void
}) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y = state.clock.elapsedTime * rotateSpeed * 0.1
    }
  })
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      
      <group ref={groupRef}>
        {items.map((item, index) => (
          <CarouselItemMesh
            key={item.id}
            item={item}
            index={index}
            totalItems={items.length}
            currentIndex={currentIndex}
            radius={radius}
            itemWidth={itemWidth}
            itemHeight={itemHeight}
            onClick={onItemClick}
            onHover={onItemHover}
          />
        ))}
      </group>
    </>
  )
}

export function WebGLCarousel({
  items,
  radius = 3,
  itemWidth = 1.5,
  itemHeight = 2,
  autoRotate = true,
  rotateSpeed = 0.5,
  showIndicators = true,
  enableNavigation = true,
  className = '',
}: WebGLCarouselConfig & { className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hoveredItem, setHoveredItem] = useState<CarouselItem | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const handleItemClick = (item: CarouselItem, index: number) => {
    setCurrentIndex(index)
  }
  
  const handleItemHover = (item: CarouselItem | null, index: number | null) => {
    setHoveredItem(item)
  }
  
  const nextItem = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length)
  }
  
  const prevItem = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
  }
  
  const currentItem = items[currentIndex]
  
  return (
    <div 
      ref={containerRef}
      className={`webgl-carousel ${className}`}
      data-cursor="-drag"
      data-cursor-text="DRAG"
    >
      <ViewportScrollScene
        track={containerRef as React.MutableRefObject<HTMLElement>}
        style={{
          width: '100%',
          height: '100vh',
          minHeight: '500px',
          background: 'radial-gradient(circle, #2c3e50 0%, #1a1a1a 100%)',
        }}
      >
        {() => (
          <WebGLCarouselR3F
            items={items}
            radius={radius}
            itemWidth={itemWidth}
            itemHeight={itemHeight}
            autoRotate={autoRotate}
            rotateSpeed={rotateSpeed}
            currentIndex={currentIndex}
            onItemClick={handleItemClick}
            onItemHover={handleItemHover}
          />
        )}
      </ViewportScrollScene>
      
      {/* Navigation */}
      {enableNavigation && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          zIndex: 10,
        }}>
          <button
            onClick={prevItem}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              pointerEvents: 'all',
            }}
          >
            ←
          </button>
          <button
            onClick={nextItem}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              pointerEvents: 'all',
            }}
          >
            →
          </button>
        </div>
      )}
      
      {/* Item Info */}
      {currentItem && (
        <GlassCard
          variant="frosted"
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            padding: '20px',
            zIndex: 10,
          }}
        >
          <h3 style={{ margin: '0 0 10px', color: 'white' }}>
            {currentItem.title || `Item ${currentIndex + 1}`}
          </h3>
          {currentItem.description && (
            <p style={{ margin: '0 0 15px', color: 'rgba(255, 255, 255, 0.8)' }}>
              {currentItem.description}
            </p>
          )}
          {currentItem.link && (
            <a
              href={currentItem.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#00ff88',
                textDecoration: 'none',
                fontSize: '14px',
              }}
            >
              Learn More →
            </a>
          )}
        </GlassCard>
      )}
      
      {/* Indicators */}
      {showIndicators && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          gap: '8px',
          zIndex: 10,
        }}>
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: 'none',
                background: index === currentIndex ? '#00ff88' : 'rgba(255, 255, 255, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}