'use client'

import { useState, useEffect, useRef } from 'react'
import { ViewportScrollScene, UseCanvas } from '@14islands/r3f-scroll-rig'
import { SpiralCarouselR3F } from './SpiralCarouselR3F'
import { GlassCard } from '@/components/ui/glass/GlassCard'
import { motion, AnimatePresence } from 'framer-motion'
import type { SpiralCarouselProps, SpiralCarouselItem } from './types'

export function SpiralCarousel({
  items,
  radius = 2.5,
  angleBetween = Math.PI / 3,
  verticalDistance = 1,
  itemWidth = 1,
  itemHeight = 2.5,
  enablePostProcessing = false,
  autoRotate = false,
  autoRotateSpeed = 0.5,
  onItemClick,
  onItemHover,
  className = '',
}: SpiralCarouselProps) {
  const [selectedItem, setSelectedItem] = useState<{ item: SpiralCarouselItem; index: number } | null>(null)
  const [hoveredItem, setHoveredItem] = useState<{ item: SpiralCarouselItem; index: number } | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Handle item interactions
  const handleItemClick = (item: SpiralCarouselItem, index: number) => {
    setSelectedItem({ item, index })
    setShowInfo(true)
    onItemClick?.(item, index)
  }
  
  const handleItemHover = (item: SpiralCarouselItem | null, index: number | null) => {
    if (item && index !== null) {
      setHoveredItem({ item, index })
    } else {
      setHoveredItem(null)
    }
    onItemHover?.(item, index)
  }
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!selectedItem) return
      
      if (event.key === 'Escape') {
        setSelectedItem(null)
        setShowInfo(false)
      } else if (event.key === 'ArrowLeft') {
        const newIndex = selectedItem.index > 0 ? selectedItem.index - 1 : items.length - 1
        setSelectedItem({ item: items[newIndex], index: newIndex })
      } else if (event.key === 'ArrowRight') {
        const newIndex = selectedItem.index < items.length - 1 ? selectedItem.index + 1 : 0
        setSelectedItem({ item: items[newIndex], index: newIndex })
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedItem, items])
  
  const proxyRef = useRef<HTMLDivElement>(null)
  
  return (
    <div ref={containerRef} className={`spiral-carousel ${className}`}>
      {/* 3D Carousel */}
      <div ref={proxyRef} className="webgl-proxy h-[100vh] min-h-[600px] w-full relative" />
      
      <UseCanvas>
        <ViewportScrollScene
          track={proxyRef as React.MutableRefObject<HTMLElement>}
          hideOffscreen={false}
        >
          {() => (
            <SpiralCarouselR3F
              items={items}
              radius={radius}
              angleBetween={angleBetween}
              verticalDistance={verticalDistance}
              itemWidth={itemWidth}
              itemHeight={itemHeight}
              onItemClick={handleItemClick}
              onItemHover={handleItemHover}
            />
          )}
        </ViewportScrollScene>
      </UseCanvas>
      
      {/* Controls Overlay */}
      <div className="spiral-carousel__controls">
        <GlassCard
          variant="frosted"
          className="spiral-carousel__info"
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            padding: '20px',
            minWidth: '250px',
            zIndex: 10,
          }}
        >
          <h3>3D Spiral Carousel</h3>
          <p>Use your mouse wheel to scroll through items</p>
          <p>Click and drag to navigate</p>
          <p>Click on items to expand</p>
          
          {hoveredItem && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="spiral-carousel__hover-info"
            >
              <h4>Hovered: {hoveredItem.item.title}</h4>
              {hoveredItem.item.description && (
                <p>{hoveredItem.item.description}</p>
              )}
            </motion.div>
          )}
        </GlassCard>
      </div>
      
      {/* Item Details Modal */}
      <AnimatePresence>
        {showInfo && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="spiral-carousel__modal-backdrop"
            onClick={() => {
              setShowInfo(false)
              setSelectedItem(null)
            }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '600px', width: '100%' }}
            >
              <GlassCard
                variant="frosted"
                style={{ padding: '30px', position: 'relative' }}
              >
                <button
                  onClick={() => {
                    setShowInfo(false)
                    setSelectedItem(null)
                  }}
                  style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '24px',
                    cursor: 'pointer',
                  }}
                >
                  ×
                </button>
                
                <img
                  src={selectedItem.item.image}
                  alt={selectedItem.item.title}
                  style={{
                    width: '100%',
                    height: '300px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    marginBottom: '20px',
                  }}
                />
                
                {selectedItem.item.title && (
                  <h2 style={{ margin: '0 0 15px', color: 'white' }}>
                    {selectedItem.item.title}
                  </h2>
                )}
                
                {selectedItem.item.description && (
                  <p style={{ margin: '0 0 20px', color: 'rgba(255, 255, 255, 0.8)' }}>
                    {selectedItem.item.description}
                  </p>
                )}
                
                {selectedItem.item.link && (
                  <a
                    href={selectedItem.item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      padding: '10px 20px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: 'white',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    Learn More →
                  </a>
                )}
                
                <div style={{ 
                  marginTop: '20px', 
                  fontSize: '14px', 
                  color: 'rgba(255, 255, 255, 0.6)' 
                }}>
                  <p>Use arrow keys to navigate • Press Esc to close</p>
                  <p>Item {selectedItem.index + 1} of {items.length}</p>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}