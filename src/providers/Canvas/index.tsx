'use client'

import { GlobalCanvas, SmoothScrollbar } from '@14islands/r3f-scroll-rig'
import { Preload, PerformanceMonitor } from '@react-three/drei'
import { ReactNode, useState, useEffect } from 'react'
import { useCanvasStore } from '@/lib/stores/canvas-store'
import { GlobalCanvasContent } from '@/components/GlobalCanvasContent'
// import { Perf } from 'r3f-perf'

interface CanvasProviderProps {
  children: ReactNode
}

export function CanvasProvider({ children }: CanvasProviderProps) {
  const { showPerf, quality } = useCanvasStore()
  const [startPreload, setStartPreload] = useState(false)
  const [canvasReady, setCanvasReady] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Map quality to DPR
  const dpr = 
    quality === 'low' ? [1, 1] as [number, number] :
    quality === 'medium' ? [1, 1.5] as [number, number] : 
    [1, 2] as [number, number]
    
  const antialias = quality !== 'low'
  const shadows = quality !== 'low'
  
  // Ensure client-side only and wait for DOM to settle
  useEffect(() => {
    // Add a small delay to ensure DOM is fully ready
    const mountTimeout = setTimeout(() => {
      setMounted(true)
      // Force a reflow to ensure styles are applied
      document.body.offsetHeight
    }, 50)
    
    return () => clearTimeout(mountTimeout)
  }, [])
  
  // Delay preload for better performance
  useEffect(() => {
    if (mounted) {
      const id = setTimeout(() => setStartPreload(true), 800)
      return () => clearTimeout(id)
    }
  }, [mounted])
  
  return (
    <>
      {/* GlobalCanvas from scroll-rig - render first as per docs */}
      {mounted && (
        <GlobalCanvas
          eventPrefix="client"
          frameloop="demand" // Changed to demand for better performance
          dpr={dpr}
          camera={{
            fov: 45,
            near: 0.1,
            far: 200,
            position: [0, 0, 5],
          }}
          gl={{
            antialias,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
            preserveDrawingBuffer: true,
          }}
          shadows={shadows}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1, // Changed from -10 to 1 to be above body but below content
          }}
          onCreated={(state: any) => {
            // Set clear color to transparent so CSS gradient shows through
            state.gl.setClearColor(0x000000, 0)
            state.gl.setClearAlpha(0)
            setCanvasReady(true)
          }}
        >
          {/* Performance Monitoring */}
          {/* {showPerf && <Perf position="top-left" />} */}
          
          {/* Performance Monitor - disabled to prevent Portal error */}
          {canvasReady && false && (
            <PerformanceMonitor
              flipflops={3}
              onFallback={() => {
                // Reduce quality on poor performance
                useCanvasStore.getState().setQuality('low')
              }}
            />
          )}

          {/* Global Canvas Content (includes transitions) */}
          {canvasReady && <GlobalCanvasContent />}
        </GlobalCanvas>
      )}

      {/* Smooth Scrollbar - before content as per docs */}
      {mounted && (
        <SmoothScrollbar
          enabled={true}
          config={{
            lerp: 0.1,
            smooth: true,
            smartphone: {
              smooth: true,
            },
            tablet: {
              smooth: true,
            },
          }}
        />
      )}
      
      {/* DOM Content - render last as per docs */}
      {children}
    </>
  )
}