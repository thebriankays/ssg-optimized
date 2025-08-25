'use client'

import { GlassOverlayMesh } from '@/components/canvas/GlassOverlay'
import { useCanvasStore } from '@/lib/stores/canvas-store'
import { useEffect, useState } from 'react'

interface GlassOverlaySettings {
  enabled?: boolean
  intensity?: number
  speed?: number
  distortion?: number
  frequency?: number
  amplitude?: number
  brightness?: number
  contrast?: number
  followMouse?: boolean
}

interface GlobalGlassOverlayProps {
  settings?: GlassOverlaySettings
}

export function GlobalGlassOverlay({ 
  settings = {
    enabled: true,
    intensity: 0.3,
    speed: 0.2,
    distortion: 1.2,
    frequency: 2.0,
    amplitude: 0.015,
    brightness: 1.02,
    contrast: 1.02,
    followMouse: true,
  }
}: GlobalGlassOverlayProps) {
  const [mounted, setMounted] = useState(false)
  const quality = useCanvasStore((state) => state.quality)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Don't render on server or when quality is low
  if (!mounted || quality === 'low') {
    return null
  }
  
  return (
    <GlassOverlayMesh
      enabled={settings.enabled ?? true}
      intensity={settings.intensity ?? 0.3}
      speed={settings.speed ?? 0.2}
      distortion={settings.distortion ?? 1.2}
      frequency={settings.frequency ?? 2.0}
      amplitude={settings.amplitude ?? 0.015}
      brightness={settings.brightness ?? 1.02}
      contrast={settings.contrast ?? 1.02}
      followMouse={settings.followMouse ?? true}
    />
  )
}
