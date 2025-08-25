'use client'

import React, { useEffect, useState, useRef } from 'react'
import { GlobalCanvas, SmoothScrollbar } from '@14islands/r3f-scroll-rig'
import { useCanvasStore } from '@/lib/stores/canvas-store'

interface CanvasProviderProps {
  children: React.ReactNode
}

export function CanvasProvider({ children }: CanvasProviderProps) {
  const [mounted, setMounted] = useState(false)
  const { quality } = useCanvasStore()
  const eventSourceRef = useRef<HTMLDivElement>(null!)
  
  useEffect(() => {
    setMounted(true)
    
    // Ensure canvas stays fixed after mount
    const fixCanvas = () => {
      const canvas = document.querySelector('canvas')
      if (canvas && canvas.parentElement) {
        // Force the canvas container to stay fixed
        const container = canvas.parentElement
        container.style.position = 'fixed'
        container.style.top = '0'
        container.style.left = '0'
        container.style.width = '100vw'
        container.style.height = '100vh'
        container.style.zIndex = '-1'
        container.style.pointerEvents = 'none'
        container.style.transform = 'translateZ(0)' // Force GPU layer
      }
    }
    
    fixCanvas()
    const timer = setTimeout(fixCanvas, 100)
    
    return () => clearTimeout(timer)
  }, [mounted])
  
  const dpr = 
    quality === 'low' ? [1, 1] as [number, number] :
    quality === 'medium' ? [1, 1.5] as [number, number] : 
    [1, 2] as [number, number]

  return (
    <>
      {/* Scrollable content wrapper */}
      <div 
        ref={eventSourceRef}
        id="scroll-container"
        style={{ 
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
        }}
      >
        {children}
      </div>
      
      {/* Fixed canvas and smooth scrollbar */}
      {mounted && (
        <>
          <SmoothScrollbar 
            enabled={true}
            config={{
              lerp: 0.1,
              smooth: true,
              smartphone: { smooth: false },
              tablet: { smooth: true },
            }}
          />
          
          <GlobalCanvas
            // Attach events to the scrollable container
            eventSource={eventSourceRef}
            eventPrefix="client"
            frameloop="demand"
            scaleMultiplier={0.01}
            dpr={dpr}
            camera={{
              fov: 45,
              near: 0.1,
              far: 200,
              position: [0, 0, 5],
            }}
            gl={{ 
              antialias: quality !== 'low', 
              powerPreference: 'high-performance', 
              alpha: true,
              stencil: false,
              depth: true,
            }}
            shadows={quality !== 'low'}
            style={{
              position: 'fixed !important' as any,
              top: '0 !important' as any,
              left: '0 !important' as any,
              width: '100vw !important' as any,
              height: '100vh !important' as any,
              zIndex: '-1 !important' as any,
              pointerEvents: 'none !important' as any,
              transform: 'translateZ(0)',
            }}
            onCreated={(state: any) => {
              state.gl.setClearColor(0x000000, 0)
              state.gl.setClearAlpha(0)
            }}
          >
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          </GlobalCanvas>
        </>
      )}
    </>
  )
}