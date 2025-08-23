'use client'

import { Background, useBackgroundSettings } from '@/components/canvas/Background'
import { useEffect } from 'react'
import { useAppStore } from '@/lib/stores/app-store'

export function GlobalBackground() {
  const settings = useBackgroundSettings()
  const setWebglEnabled = useAppStore((state) => state.setWebglEnabled)
  
  useEffect(() => {
    // Check if WebGL is supported and enabled in settings
    if (settings && settings.type !== 'none') {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      
      if (gl) {
        setWebglEnabled(true)
      }
    }
  }, [settings, setWebglEnabled])
  
  if (!settings) return null
  
  return <Background settings={settings} />
}