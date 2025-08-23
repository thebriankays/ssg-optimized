'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useCanvasStore } from '@/lib/stores/canvas-store'

interface QualityContextValue {
  quality: 'low' | 'medium' | 'high'
  setQuality: (quality: 'low' | 'medium' | 'high') => void
  autoQuality: boolean
  setAutoQuality: (auto: boolean) => void
  
  // Device info
  isMobile: boolean
  isTablet: boolean
  hasTouch: boolean
  gpuTier: number
}

const QualityContext = createContext<QualityContextValue | null>(null)

export function QualityProvider({ children }: { children: ReactNode }) {
  const [quality, setQualityState] = useState<'low' | 'medium' | 'high'>('medium')
  const [autoQuality, setAutoQuality] = useState(true)
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    hasTouch: false,
    gpuTier: 2,
  })
  
  const setCanvasQuality = useCanvasStore((s) => s.setQuality)

  // Detect device capabilities
  useEffect(() => {
    const checkDevice = async () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      const isTablet = /iPad|Android/i.test(navigator.userAgent) && !isMobile
      const hasTouch = 'ontouchstart' in window
      
      // GPU detection (simplified)
      let gpuTier = 2
      if (isMobile) gpuTier = 1
      
      // Check WebGL capabilities
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          console.log('GPU:', renderer)
          
          // Simple GPU tier detection
          if (renderer.includes('Intel')) gpuTier = 1
          else if (renderer.includes('NVIDIA') || renderer.includes('AMD')) gpuTier = 3
        }
      }
      
      setDeviceInfo({ isMobile, isTablet, hasTouch, gpuTier })
      
      // Auto-set quality based on device
      if (autoQuality) {
        if (isMobile || gpuTier === 1) {
          setQualityState('low')
        } else if (isTablet || gpuTier === 2) {
          setQualityState('medium')
        } else {
          setQualityState('high')
        }
      }
    }
    
    checkDevice()
  }, [autoQuality])

  // Sync with canvas store
  useEffect(() => {
    setCanvasQuality(quality)
  }, [quality, setCanvasQuality])

  const setQuality = (newQuality: 'low' | 'medium' | 'high') => {
    setQualityState(newQuality)
    setAutoQuality(false) // Disable auto when manually set
  }

  const value: QualityContextValue = {
    quality,
    setQuality,
    autoQuality,
    setAutoQuality,
    ...deviceInfo,
  }

  return (
    <QualityContext.Provider value={value}>
      {children}
    </QualityContext.Provider>
  )
}

export function useQuality() {
  const context = useContext(QualityContext)
  if (!context) {
    throw new Error('useQuality must be used within QualityProvider')
  }
  return context
}