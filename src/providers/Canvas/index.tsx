'use client'

import React, { useEffect, useState } from 'react'
import { GlobalCanvas, SmoothScrollbar } from '@14islands/r3f-scroll-rig'
import { Preload } from '@react-three/drei'
import { useCanvasStore } from '@/lib/stores/canvas-store'

interface CanvasProviderProps {
  children: React.ReactNode
}

export function CanvasProvider({ children }: CanvasProviderProps) {
  const [mounted, setMounted] = useState(false)
  const { quality } = useCanvasStore()
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Configure DPR based on quality
  const dpr = 
    quality === 'low' ? [1, 1] as [number, number] :
    quality === 'medium' ? [1, 1.5] as [number, number] : 
    [1, 2] as [number, number]

  // Render children immediately, add canvas after mount
  return (
    <>
      {/* DOM content wrapper */}
      <div id="page-wrapper" style={{ position: 'relative', zIndex: 10 }}>
        {children}
      </div>

      {/* Only render WebGL components after mount */}
      {mounted && (
        <>
          {/* Smooth scrollbar */}
          <SmoothScrollbar 
            enabled={true}
            config={{
              lerp: 0.1,
              smooth: true,
              smartphone: { smooth: false }, // Disable on mobile for performance
              tablet: { smooth: true },
            }}
          />

          {/* Global canvas for WebGL */}
          <GlobalCanvas
            // Attach events to the wrapper
            eventSource={typeof document !== 'undefined' ? document.getElementById('page-wrapper') : undefined}
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
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1,
            }}
            onCreated={(state) => {
              // Clear background so CSS gradient shows through
              state.gl.setClearColor(0x000000, 0)
            }}
          >
            {/* Basic lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            
            <Preload all />
          </GlobalCanvas>
        </>
      )}
    </>
  )
}