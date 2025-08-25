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
  // Fix: Use proper type for ref
  const containerRef = useRef<HTMLDivElement>(null!) as React.MutableRefObject<HTMLElement>
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !webglEnabled || settings.type === 'none') {
    return null
  }
  
  return (
    <>
      {/* Fixed background container */}
      <div 
        ref={containerRef as any} 
        className="fixed inset-0 pointer-events-none"
        style={{ 
          zIndex: -1,
          transform: 'translateZ(0)', // Force GPU layer
        }}
      />
      
      {/* WebGL content */}
      {mounted && containerRef.current && (
        <UseCanvas>
          <ViewportScrollScene
            track={containerRef}
            hideOffscreen={false}
            inViewportMargin="0%"
            hud // Keep in background layer
            priority={-1} // Lower priority for background
          >
            {() => {
              switch (settings.type) {
                case 'whatamesh':
                  return (
                    <Whatamesh
                      colors={[
                        settings.color1 || '#dca8d8',
                        settings.color2 || '#a3d3f9',
                        settings.color3 || '#fcd6d6',
                        settings.color4 || '#eae2ff',
                      ]}
                      amplitude={320 * (settings.intensity || 0.5)}
                      speed={1}
                      darkenTop={true}
                    />
                  )
                case 'gradient':
                  return (
                    <mesh>
                      <planeGeometry args={[10, 10]} />
                      <meshBasicMaterial
                        color={settings.color1 || '#000000'}
                        transparent
                        opacity={settings.intensity || 0.5}
                      />
                    </mesh>
                  )
                case 'particles':
                  // TODO: Implement particles background
                  return (
                    <mesh>
                      <planeGeometry args={[10, 10]} />
                      <meshBasicMaterial
                        color={settings.color1 || '#1a1a1a'}
                        transparent
                        opacity={0.8}
                      />
                    </mesh>
                  )
                case 'fluid':
                  // TODO: Implement fluid background
                  return (
                    <mesh>
                      <planeGeometry args={[10, 10]} />
                      <meshBasicMaterial
                        color={settings.color1 || '#0a0a0a'}
                        transparent
                        opacity={0.9}
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