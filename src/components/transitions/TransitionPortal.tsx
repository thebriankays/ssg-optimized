'use client'

import { useEffect } from 'react'
import { ViewportScrollScene } from '@14islands/r3f-scroll-rig'
import { PageTransitionScene } from './PageTransitionScene'

interface TransitionPortalProps {
  isTransitioning: boolean
  direction: 'out' | 'in'
  onComplete: () => void
  containerRef: React.RefObject<HTMLElement>
}

// This component renders inside the Canvas context
export function TransitionPortal({ isTransitioning, direction, onComplete, containerRef }: TransitionPortalProps) {
  if (!isTransitioning || !containerRef.current) return null

  return (
    <ViewportScrollScene
      track={containerRef as React.MutableRefObject<HTMLElement>}
      priority={1000}
      hideOffscreen={false}
    >
      {() => (
        <PageTransitionScene
          isTransitioning={isTransitioning}
          direction={direction}
          onComplete={onComplete}
        />
      )}
    </ViewportScrollScene>
  )
}