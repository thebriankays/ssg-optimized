'use client'

import { ViewportScrollScene, UseCanvas } from '@14islands/r3f-scroll-rig'
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
    color1: '#000000',
    color2: '#1a1a1a',
    color3: '#2a2a2a',
    color4: '#3a3a3a',
    intensity: 0.5,
  },
  className = ''
}: BackgroundProps) {
  const [mounted, setMounted] = useState(false)
  const webglEnabled = useAppStore((state) => state.webglEnabled)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const containerRef = useRef<HTMLDivElement>(null)

  if (!mounted || !webglEnabled || settings.type === 'none') {
    return null
  }
  
  return (
    <>
      {/* DOM element for tracking - stays visible */}
      <div ref={containerRef} className={`background-wrapper ${className}`} />
      
      {/* WebGL content - only this gets tunneled */}
      <UseCanvas>
        <ViewportScrollScene
          track={containerRef as React.MutableRefObject<HTMLElement>}
          hideOffscreen={false}
        >
          {() => (
            <>
              {settings.type === 'whatamesh' && (
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
        )}
        
        {settings.type === 'gradient' && (
          <mesh>
            <planeGeometry args={[10, 10]} />
            <meshBasicMaterial
              color={settings.color1}
              transparent
              opacity={settings.intensity}
            />
          </mesh>
        )}
        
        {/* Placeholder for other background types */}
        {settings.type === 'particles' && (
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="red" />
          </mesh>
        )}
        
        {settings.type === 'fluid' && (
          <mesh>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial color="blue" />
          </mesh>
        )}
            </>
          )}
        </ViewportScrollScene>
      </UseCanvas>
    </>
  )
}

// Export a hook to get background settings from SiteSettings
export function useBackgroundSettings() {
  const [settings, setSettings] = useState<BackgroundSettings | null>(null)
  
  useEffect(() => {
    // Fetch site settings from the API
    fetch('/api/globals/site-settings')
      .then(res => res.json())
      .then(data => {
        if (data?.webgl?.background) {
          setSettings(data.webgl.background)
        }
      })
      .catch(console.error)
  }, [])
  
  return settings
}