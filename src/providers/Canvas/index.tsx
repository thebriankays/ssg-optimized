'use client'

import React, { useEffect, useState, useRef } from 'react'
import { GlobalCanvas, SmoothScrollbar } from '@14islands/r3f-scroll-rig'
import { Preload, PerformanceMonitor } from '@react-three/drei'
import { useCanvasStore } from '@/lib/stores/canvas-store'
// import { GlassOverlayMesh } from '@/components/canvas/GlassOverlay'

interface CanvasProviderProps {
  children: React.ReactNode
}

export function CanvasProvider({ children }: CanvasProviderProps) {
  const [mounted, setMounted] = useState(false)
  const eventSource = useRef<HTMLDivElement>(null!)
  const { quality, setQuality } = useCanvasStore()
  
  useEffect(() => {
    // Delay mount to ensure proper hydration
    const timer = setTimeout(() => {
      setMounted(true)
    }, 100)
    
    // Force page-content to be visible
    const pageContent = document.getElementById('page-content')
    if (pageContent) {
      pageContent.style.display = 'block'
      pageContent.style.visibility = 'visible'
      pageContent.style.opacity = '1'
      
      // Watch for style changes and prevent display:none
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
            const target = mutation.target as HTMLElement
            if (target.id === 'page-content' && window.getComputedStyle(target).display === 'none') {
              console.warn('Preventing display:none on page-content')
              target.style.display = 'block'
              target.style.visibility = 'visible'
              target.style.opacity = '1'
            }
          }
        })
      })
      
      observer.observe(pageContent, {
        attributes: true,
        attributeFilter: ['style']
      })
      
      return () => {
        clearTimeout(timer)
        observer.disconnect()
      }
    }
    
    return () => clearTimeout(timer)
  }, [])
  
  const dpr = 
    quality === 'low' ? [1, 1] as [number, number] :
    quality === 'medium' ? [1, 1.5] as [number, number] : 
    [1, 2] as [number, number]

  return (
    <>
      {/* This wraps ALL page DOM that emits pointer/scroll events */}
      <div id="page-content" ref={eventSource}>
        {children}
      </div>

      {/* One native-smooth scroller */}
      {mounted && <SmoothScrollbar />}
      
      {/* One shared canvas. NO <UseCanvas> here. */}
      {mounted && (
        <GlobalCanvas
          eventSource={eventSource}
          eventPrefix="client"
          frameloop="demand"
          scaleMultiplier={0.01}
          dpr={dpr}
          gl={{ 
            antialias: true, 
            powerPreference: 'high-performance', 
            alpha: true
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1,
            pointerEvents: 'none',
          }}
          onCreated={(state: any) => {
            state.gl.setClearColor(0x000000, 0)
            state.gl.setClearAlpha(0)
            console.log('GlobalCanvas created!', state)
          }}
        >
          {/* Lights minimal defaults (heavy lights/effects should live inside leaf scenes) */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <PerformanceMonitor onDecline={() => {
            console.warn('Performance declining, lowering quality')
            if (quality !== 'low') {
              if (quality === 'high') {
                setQuality('medium')
              } else if (quality === 'medium') {
                setQuality('low')
              }
            }
          }} />
          <Preload all />
          
          {/* Global Glass Overlay Effect - DISABLED FOR DEBUGGING */}
          {/* <GlassOverlayMesh 
            enabled={quality !== 'low'} // Disable on low quality
            intensity={0.3}
            speed={0.2}
            distortion={1.2}
            frequency={2.0}
            amplitude={0.015}
            brightness={1.02}
            contrast={1.02}
            followMouse={true}
          /> */}
        </GlobalCanvas>
      )}
    </>
  )
}