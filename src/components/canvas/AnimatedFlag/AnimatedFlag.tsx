'use client'

import { useState, useRef } from 'react'
import { ViewportScrollScene, UseCanvas } from '@14islands/r3f-scroll-rig'
import { AnimatedFlagR3F } from './AnimatedFlagR3F'
import { GlassCard } from '@/components/ui/glass/GlassCard'
import { motion } from 'framer-motion'
import type { AnimatedFlagConfig } from './types'

interface AnimatedFlagProps extends AnimatedFlagConfig {
  className?: string
  title?: string
  description?: string
  showControls?: boolean
}

export function AnimatedFlag({
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
  className = '',
  title = 'Animated Flag',
  description = 'Interactive 3D flag with realistic wind animation',
  showControls = true,
}: AnimatedFlagProps) {
  const [currentWindStrength, setCurrentWindStrength] = useState(windStrength)
  const [isAutoWind, setIsAutoWind] = useState(autoWind)
  const [currentFlagColor, setCurrentFlagColor] = useState(flagColor)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const proxyRef = useRef<HTMLDivElement>(null)
  
  return (
    <div ref={containerRef} className={`animated-flag ${className}`}>
      {/* WebGL Scene */}
      <div ref={proxyRef} className="webgl-proxy h-[100vh] min-h-[400px] w-full relative" style={{
        background: 'linear-gradient(to bottom, #87CEEB 0%, #98FB98 100%)',
      }} />
      
      <UseCanvas>
        <ViewportScrollScene
          track={proxyRef as React.MutableRefObject<HTMLElement>}
          hideOffscreen={false}
        >
          {() => (
            <>
              <AnimatedFlagR3F
                flagTexture={flagTexture}
                poleTexture={poleTexture}
                width={width}
                height={height}
                segments={segments}
                windStrength={currentWindStrength}
                windDirection={windDirection}
                enablePhysics={enablePhysics}
                autoWind={isAutoWind}
                flagColor={currentFlagColor}
                poleColor={poleColor}
                shadows={shadows}
              />
              
              {/* Lighting */}
              <ambientLight intensity={0.6} />
              <directionalLight
                position={[5, 5, 5]}
                intensity={0.8}
                castShadow={shadows}
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
            </>
          )}
        </ViewportScrollScene>
      </UseCanvas>
      
      {/* Controls */}
      {showControls && (
        <div className="animated-flag__controls">
          <GlassCard
            variant="frosted"
            className="animated-flag__control-panel"
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
            
            {/* Wind Strength Control */}
            <div className="animated-flag__control-group">
              <label>Wind Strength: {currentWindStrength.toFixed(1)}</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={currentWindStrength}
                onChange={(e) => setCurrentWindStrength(parseFloat(e.target.value))}
                className="animated-flag__slider"
              />
            </div>
            
            {/* Auto Wind Toggle */}
            <div className="animated-flag__toggle">
              <label>
                <input
                  type="checkbox"
                  checked={isAutoWind}
                  onChange={(e) => setIsAutoWind(e.target.checked)}
                />
                <span>Auto Wind Variation</span>
              </label>
            </div>
            
            {/* Flag Color */}
            <div className="animated-flag__control-group">
              <label>Flag Color</label>
              <input
                type="color"
                value={currentFlagColor}
                onChange={(e) => setCurrentFlagColor(e.target.value)}
                className="animated-flag__color-picker"
              />
            </div>
            
            {/* Stats */}
            <div className="animated-flag__stats">
              <p>Segments: {segments}</p>
              <p>Physics: {enablePhysics ? 'Enabled' : 'Disabled'}</p>
              <p>Shadows: {shadows ? 'Enabled' : 'Disabled'}</p>
            </div>
          </GlassCard>
        </div>
      )}
      
      {/* Instructions */}
      <GlassCard
        variant="clear"
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          padding: '15px',
          maxWidth: '220px',
          zIndex: 10,
        }}
      >
        <h4>Instructions</h4>
        <ul style={{ 
          margin: 0, 
          paddingLeft: '15px',
          fontSize: '13px',
          lineHeight: '1.4',
          color: 'rgba(255, 255, 255, 0.8)'
        }}>
          <li>Adjust wind strength with slider</li>
          <li>Toggle auto wind variation</li>
          <li>Change flag color</li>
          <li>Click on flag for interaction</li>
        </ul>
      </GlassCard>
    </div>
  )
}