'use client'

import { useRef } from 'react'

interface PageTransitionProps {
  isTransitioning: boolean
  direction: 'out' | 'in'
  containerRef: React.MutableRefObject<HTMLDivElement | null>
}

export function PageTransition({ isTransitioning, containerRef }: PageTransitionProps) {
  if (!isTransitioning) return null

  return (
    <div 
      ref={containerRef}
      data-transition-container
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ height: '100vh', width: '100vw' }}
    />
  )
}