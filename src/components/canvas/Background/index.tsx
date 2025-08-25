'use client'

import { UseCanvas, ViewportScrollScene } from '@14islands/r3f-scroll-rig'
import { useEffect, useState, useRef } from 'react'
import { Whatamesh } from './Whatamesh'
import { useAppStore } from '@/lib/stores/app-store'
import './background.scss'

interface BackgroundSettings {
  type: 'none' | 'gradient' | 'particles' | 'fluid' | 'whatamesh'
  color1: string
  color2: string
  color3: string
  color4: string
  intensity: number
}

interface BackgroundProps {
  settings?: BackgroundSettings
  className?: string
}

export function Background({ 
  settings = {
    type: 'whatamesh',
    color1: '#dca8d8',
    color2: '#a3d3f9', 
    color3: '#fcd6d6',
    color4: '#eae2ff',
    intensity: 0.5,
  },
  className = ''
}: BackgroundProps) {
  const [mounted, setMounted] = useState(false)
  const webglEnabled = useAppStore((state) => state.webglEnabled)
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !webglEnabled || settings.type === 'none') {
    return null
  }
  
  return (
    <>
      {/* DOM placeholder - this stays in the document flow */}
      <div 
        ref={containerRef} 
        className={`background-container fixed inset-0 pointer-events-none ${className}`}
        style={{ zIndex: 0 }}
      />
      
      {/* WebGL content - only this gets tunneled to the canvas */}
      {containerRef.current && (
        <UseCanvas>
          <ViewportScrollScene
            track={containerRef}
            hideOffscreen={false}
            inViewportMargin="0%"
            hud // Render as HUD to stay in background
          >
            {() => {
              switch (settings.type) {
                case 'whatamesh':
                  return (
                    <Whatamesh
                      colors={[
                        settings.color1,
                        settings.color2,
                        settings.color3,
                        settings.color4,
                      ]}
                      amplitude={320 * settings.intensity}
                      speed={1}
                      darkenTop={true}
                    />
                  )
                case 'gradient':
                  return (
                    <mesh>
                      <planeGeometry args={[10, 10]} />
                      <meshBasicMaterial
                        color={settings.color1}
                        transparent
                        opacity={settings.intensity}
                      />
                    </mesh>
                  )
                default:
                  return null
              }
            }}
          </ViewportScrollScene>
        </UseCanvas>
      )}
    </>
  )
}

// Export a hook to get background settings from SiteSettings
export function useBackgroundSettings() {
  const [settings, setSettings] = useState<BackgroundSettings | null>(null)
  
  useEffect(() => {
    // Default settings for now
    setSettings({
      type: 'whatamesh',
      color1: '#dca8d8',
      color2: '#a3d3f9', 
      color3: '#fcd6d6',
      color4: '#eae2ff',
      intensity: 0.5,
    })
  }, [])
  
  return settings
}