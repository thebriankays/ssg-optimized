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
  // Use a small proxy element, not the entire container
  const proxyRef = useRef<HTMLDivElement>(null!) as React.MutableRefObject<HTMLElement>
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !webglEnabled || settings.type === 'none') {
    return null
  }
  
  return (
    <>
      {/* Small proxy element - this gets hidden but doesn't affect layout */}
      <div 
        ref={proxyRef as any} 
        className="webgl-background-proxy"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1000,
        }}
      />
      
      {/* WebGL content properly wrapped in UseCanvas */}
      {mounted && (
        <UseCanvas>
          <ViewportScrollScene
            track={proxyRef}
            hideOffscreen={false}
            inViewportMargin="0%"
            hud // Keep in background layer
            priority={-1}
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
                      amplitude={320}
                      speed={1}
                      darkenTop={false}
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