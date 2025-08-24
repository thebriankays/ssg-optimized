'use client'

import { useBackgroundSettings } from '@/components/canvas/Background'
import { useEffect } from 'react'
import { useAppStore } from '@/lib/stores/app-store'

export function GlobalBackground() {
  const settings = useBackgroundSettings()
  const setWebglEnabled = useAppStore((state) => state.setWebglEnabled)
  
  useEffect(() => {
    // Check if WebGL is supported
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    
    if (gl) {
      console.log('WebGL is supported, enabling...')
      setWebglEnabled(true)
      // Remove no-webgl class from body
      document.body.classList.remove('no-webgl')
    } else {
      console.warn('WebGL is not supported')
      // Add no-webgl class to body for fallback styles
      document.body.classList.add('no-webgl')
    }
  }, [setWebglEnabled])
  
  // Background is now rendered in GlobalCanvasContent to ensure proper layering
  return null
}