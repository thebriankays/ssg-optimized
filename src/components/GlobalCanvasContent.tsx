'use client'

import { useRef, useEffect, useState, Suspense } from 'react'
import { useTransitionStore } from '@/lib/stores/transition-store'
import { TransitionPortal } from '@/components/transitions/TransitionPortal'
import { useThree } from '@react-three/fiber'

function GlobalCanvasContentInner() {
  const containerRef = useRef<HTMLElement>(null!)
  const { isTransitioning, direction, onComplete } = useTransitionStore()
  const [isReady, setIsReady] = useState(false)
  const { gl } = useThree()
  
  // Wait for WebGL context to be fully ready
  useEffect(() => {
    if (gl && gl.domElement) {
      // Small delay to ensure context is fully initialized
      const timer = setTimeout(() => {
        setIsReady(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [gl])
  
  // Set up container ref from DOM
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return
    
    const updateRef = () => {
      // Look specifically for the PageTransition container, not the page content
      const element = document.querySelector('.fixed[data-transition-container]') as HTMLDivElement
      if (element) {
        containerRef.current = element
      }
    }
    
    // Delay initial check to ensure DOM is ready
    const timeout = setTimeout(updateRef, 100)
    
    // Check periodically in case DOM changes
    const interval = setInterval(updateRef, 1000)
    
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [])
  
  const handleComplete = () => {
    if (onComplete) {
      onComplete()
    }
  }
  
  return (
    <>
      {/* Global lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      
      {/* Page transition portal - only render when ready */}
      {isReady && isTransitioning && containerRef.current && (
        <TransitionPortal
          isTransitioning={isTransitioning}
          direction={direction}
          onComplete={handleComplete}
          containerRef={containerRef}
        />
      )}
    </>
  )
}

// Error boundary wrapper
export function GlobalCanvasContent() {
  try {
    return <GlobalCanvasContentInner />
  } catch (error) {
    console.error('Error in GlobalCanvasContent:', error)
    return null
  }
}
