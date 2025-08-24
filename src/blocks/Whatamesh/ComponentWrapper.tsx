'use client'

import React, { useRef } from 'react'
import dynamic from 'next/dynamic'
import { ViewportScrollScene, UseCanvas } from '@14islands/r3f-scroll-rig'

// Dynamic import for client-side only rendering
const Whatamesh = dynamic(
  () => import('@/components/canvas/Background/Whatamesh').then(mod => ({ default: mod.Whatamesh })),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#000',
        color: '#fff'
      }}>
        <div>Loading whatamesh...</div>
      </div>
    )
  }
)

// Props interface matching the component requirements
interface WhatameshWrapperProps {
  colors: string[]
  amplitude?: number
  speed?: number
  darkenTop?: boolean
}

export const WhatameshWrapper: React.FC<WhatameshWrapperProps> = ({
  colors,
  amplitude,
  speed,
  darkenTop
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  
  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <UseCanvas>
        <ViewportScrollScene
          track={containerRef as React.MutableRefObject<HTMLElement>}
        >
          {() => (
            <Whatamesh
              colors={colors}
              amplitude={amplitude}
              speed={speed}
              darkenTop={darkenTop}
            />
          )}
        </ViewportScrollScene>
      </UseCanvas>
    </div>
  )
}