'use client'

import { useState, useRef, useEffect } from 'react'
import { UseCanvas, ViewportScrollScene } from '@14islands/r3f-scroll-rig'
import { useFrame } from '@react-three/fiber'
import { WebGLText } from './WebGLText'
import { PostProcessing } from './PostProcessing'
import type { WebGLTextConfig } from './types'

interface WebGLTextWrapperProps extends WebGLTextConfig {
  className?: string
  style?: React.CSSProperties
  enablePostProcessing?: boolean
  scrollVelocity?: number
}

// Component to track scroll velocity
function ScrollVelocityTracker({ onVelocityChange }: { onVelocityChange: (v: number) => void }) {
  const lastScrollY = useRef(0)
  const velocityRef = useRef(0)
  
  useFrame(() => {
    if (typeof window === 'undefined') return
    
    const currentScrollY = window.scrollY
    const delta = currentScrollY - lastScrollY.current
    lastScrollY.current = currentScrollY
    
    // Smooth velocity calculation
    velocityRef.current = velocityRef.current * 0.9 + delta * 0.1
    onVelocityChange(Math.abs(velocityRef.current))
  })
  
  return null
}

export function WebGLTextWrapper({
  className = '',
  style,
  enablePostProcessing = false,
  scrollVelocity = 0,
  ...textProps
}: WebGLTextWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [velocity, setVelocity] = useState(0)
  
  return (
    <div ref={containerRef} className={`webgl-text-wrapper ${className}`} style={style}>
      <ViewportScrollScene
        track={containerRef as React.MutableRefObject<HTMLElement>}
      >
        {() => (
          <>
            <ScrollVelocityTracker onVelocityChange={setVelocity} />
            <WebGLText {...textProps} />
            {enablePostProcessing && (
              <PostProcessing 
                velocity={scrollVelocity || velocity}
                distortion={1}
                rgbShift={1}
              />
            )}
          </>
        )}
      </ViewportScrollScene>
    </div>
  )
}