'use client'

import { UseCanvas, ScrollScene, ViewportScrollScene } from '@14islands/r3f-scroll-rig'
import { ReactNode, useRef, useId, MutableRefObject } from 'react'
import { useInView } from 'react-intersection-observer'
import { Group } from 'three'

interface WebGLViewProps {
  children: ReactNode | ((props: any) => ReactNode)
  className?: string
  
  // Tracking
  track?: MutableRefObject<HTMLElement>
  
  // Viewport
  viewport?: boolean // Use ViewportScrollScene
  hideOffscreen?: boolean
  inViewportMargin?: string
  inViewportThreshold?: number
  
  // Rendering
  priority?: number
  debug?: boolean
  scissor?: boolean
  
  // Persistence
  persistId?: string
}

export function WebGLView({
  children,
  className = '',
  track,
  viewport = false,
  hideOffscreen = true,
  inViewportMargin = '15%',
  inViewportThreshold = 0,
  priority = 0,
  debug = false,
  scissor = false,
  persistId,
}: WebGLViewProps) {
  const id = useId()
  const localRef = useRef<HTMLDivElement>(null!)
  const trackRef = track || localRef
  
  // Intersection observer for performance
  const { ref: inViewRef, inView } = useInView({
    rootMargin: inViewportMargin,
    threshold: inViewportThreshold,
  })

  // Combine refs
  const setRefs = (el: HTMLDivElement) => {
    localRef.current = el
    inViewRef(el)
  }

  // Don't render WebGL if not in view
  if (!inView && hideOffscreen) {
    return (
      <div ref={setRefs} className={className}>
        {/* Placeholder content */}
      </div>
    )
  }

  const SceneComponent = viewport ? ViewportScrollScene : ScrollScene

  return (
    <div ref={setRefs} className={`webgl-view ${className}`} data-webgl-id={persistId || id}>
      <UseCanvas key={persistId || id}>
        <SceneComponent
          track={trackRef}
          hideOffscreen={hideOffscreen}
          inViewportMargin={inViewportMargin}
          inViewportThreshold={inViewportThreshold}
          priority={priority}
          debug={debug}
          scissor={scissor}
        >
          {(props) => (
            <group>
              {typeof children === 'function' ? children(props) : children}
            </group>
          )}
        </SceneComponent>
      </UseCanvas>
    </div>
  )
}