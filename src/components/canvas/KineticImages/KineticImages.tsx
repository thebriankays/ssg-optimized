'use client'

import { useState, useRef } from 'react'
import { ViewportScrollScene } from '@/components/canvas/ViewportScrollScene'
import { KineticImagesR3F } from './KineticImagesR3F'
import { GlassCard } from '@/components/ui/glass/GlassCard'
import { motion } from 'framer-motion'
import type { KineticImagesConfig } from './types'

interface KineticImagesProps extends KineticImagesConfig {
  className?: string
  title?: string
  description?: string
}

export function KineticImages({
  images,
  variant = 'tower',
  autoRotate = true,
  rotateSpeed = 0.5,
  scrollSpeed = 1,
  gap = 10,
  canvasSize = 512,
  enableInteraction = true,
  className = '',
  title = '3D Kinetic Images',
  description = 'Interactive 3D image gallery with dynamic animations',
}: KineticImagesProps) {
  const [selectedVariant, setSelectedVariant] = useState(variant)
  const [isAutoRotate, setIsAutoRotate] = useState(autoRotate)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const variants = [
    { key: 'tower' as const, label: 'Tower', description: 'Cylindrical billboard tower' },
    { key: 'paper' as const, label: 'Paper', description: 'Paper-like 3D model' },
    { key: 'spiral' as const, label: 'Spiral', description: 'Spiral 3D structure' },
  ]
  
  return (
    <div ref={containerRef} className={`kinetic-images ${className}`}>
      {/* WebGL Scene */}
      <ViewportScrollScene
        track={containerRef as React.MutableRefObject<HTMLElement>}
        className="kinetic-images__scene"
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          minHeight: '600px',
          background: 'radial-gradient(circle at center, #1a1a2e 0%, #0f0f0f 100%)',
        }}
      >
        {() => (
          <KineticImagesR3F
            images={images}
            variant={selectedVariant}
            autoRotate={isAutoRotate}
            rotateSpeed={rotateSpeed}
            scrollSpeed={scrollSpeed}
            gap={gap}
            canvasSize={canvasSize}
            enableInteraction={enableInteraction}
          />
        )}
      </ViewportScrollScene>
      
      {/* Controls */}
      <div className="kinetic-images__controls">
        <GlassCard
          variant="frosted"
          className="kinetic-images__control-panel"
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            padding: '20px',
            minWidth: '280px',
            zIndex: 10,
          }}
        >
          <h3>{title}</h3>
          <p>{description}</p>
          
          {/* Variant Selection */}
          <div className="kinetic-images__variants">
            <h4>Variant</h4>
            <div className="kinetic-images__variant-buttons">
              {variants.map((variantOption) => (
                <motion.button
                  key={variantOption.key}
                  onClick={() => setSelectedVariant(variantOption.key)}
                  className={`kinetic-images__variant-button ${
                    selectedVariant === variantOption.key ? 'active' : ''
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="label">{variantOption.label}</span>
                  <span className="description">{variantOption.description}</span>
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* Auto Rotate Toggle */}
          <div className="kinetic-images__toggle">
            <label>
              <input
                type="checkbox"
                checked={isAutoRotate}
                onChange={(e) => setIsAutoRotate(e.target.checked)}
              />
              <span>Auto Rotate</span>
            </label>
          </div>
          
          {/* Stats */}
          <div className="kinetic-images__stats">
            <p>Images: {images.length}</p>
            <p>Current: {variants.find(v => v.key === selectedVariant)?.label}</p>
            <p>Interaction: {enableInteraction ? 'Enabled' : 'Disabled'}</p>
          </div>
        </GlassCard>
      </div>
      
      {/* Instructions */}
      <GlassCard
        variant="clear"
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          padding: '15px',
          maxWidth: '250px',
          zIndex: 10,
        }}
      >
        <h4>Controls</h4>
        <ul style={{ 
          margin: 0, 
          paddingLeft: '15px',
          fontSize: '13px',
          lineHeight: '1.4',
          color: 'rgba(255, 255, 255, 0.8)'
        }}>
          <li>Mouse: Rotate view</li>
          <li>Scroll: Zoom in/out</li>
          <li>Variants: Different 3D layouts</li>
          <li>Auto-rotate: Automatic spinning</li>
        </ul>
      </GlassCard>
    </div>
  )
}