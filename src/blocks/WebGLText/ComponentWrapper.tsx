'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// Dynamic import for client-side only rendering
const WebGLTextClient = dynamic(
  () => import('./Component.client').then(mod => mod.WebGLTextClient),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '400px',
        background: '#000',
        color: '#fff'
      }}>
        <div>Loading 3D text...</div>
      </div>
    )
  }
)

// Props interface matching the component requirements
interface WebGLTextWrapperProps {
  config: {
    text: string
    // Typography
    font?: string
    fontSize?: number
    letterSpacing?: number
    lineHeight?: number
    maxWidth?: number
    textAlign?: any
    // Appearance
    color?: string
    emissive?: string
    emissiveIntensity?: number
    material?: any
    metalness?: number
    roughness?: number
    // Outline
    outlineColor?: string
    outlineWidth?: number
    outlineOpacity?: number
    // Animation
    animation?: {
      type: any
      duration?: number
      delay?: number
      stagger?: number
    }
    // Transform
    position?: [number, number, number]
    rotation?: [number, number, number]
    scale?: number
  }
  style?: React.CSSProperties
}

export const WebGLTextWrapper: React.FC<WebGLTextWrapperProps> = ({ config, style }) => {
  return (
    <WebGLTextClient
      config={config}
      style={style}
    />
  )
}