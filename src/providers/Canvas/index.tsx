'use client'

import { GlobalCanvas, SmoothScrollbar } from '@14islands/r3f-scroll-rig'
import { Preload, PerformanceMonitor } from '@react-three/drei'
import { ReactNode, useRef } from 'react'
import { useCanvasStore } from '@/lib/stores/canvas-store'
// import { Perf } from 'r3f-perf'

interface CanvasProviderProps {
  children: ReactNode
}

export function CanvasProvider({ children }: CanvasProviderProps) {
  const eventSource = useRef<HTMLDivElement>(null!)
  const { showPerf } = useCanvasStore()

  return (
    <>
      {/* DOM Content */}
      <div ref={eventSource} className="canvas-event-source">
        {children}
      </div>

      {/* Smooth Scrollbar */}
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

      {/* Global WebGL Canvas */}
      <GlobalCanvas
        // Scaling
        scaleMultiplier={0.01} // 100px = 1 world unit
        
        // Performance
        frameloop="demand" // Only render when needed
        performance={{ min: 0.5 }} // Adaptive performance
        
        // Events
        eventSource={eventSource}
        eventPrefix="client"
        
        // Camera
        camera={{
          fov: 45,
          near: 0.1,
          far: 200,
          position: [0, 0, 5],
        }}
        
        // Rendering
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        
        // Shadows
        shadows={{
          enabled: true,
          type: 'PCFSoft',
        }}
        
        // Style
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {/* Performance Monitoring */}
        {/* {showPerf && <Perf position="top-left" />} */}
        
        <PerformanceMonitor
          onIncline={() => console.log('Performance improving')}
          onDecline={() => console.log('Performance declining')}
          flipflops={3}
          onFallback={() => {
            // Reduce quality on poor performance
            useCanvasStore.getState().setQuality('low')
          }}
        />

        {/* Global Scene Setup */}
        <fog attach="fog" args={['#000000', 10, 50]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        {/* Preload all assets */}
        <Preload all />
      </GlobalCanvas>
    </>
  )
}