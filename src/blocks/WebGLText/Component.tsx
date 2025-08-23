import React from 'react'
import dynamic from 'next/dynamic'
import type { WebGLTextBlock as WebGLTextBlockType } from '../types'

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

export const WebGLTextBlock: React.FC<WebGLTextBlockType> = ({
  text,
  typography,
  appearance,
  outline,
  animation,
  transform,
  layout,
}) => {
  // Transform data to match component interface
  const textConfig = {
    text: text || '',
    // Typography
    font: typography?.font,
    fontSize: typography?.fontSize,
    letterSpacing: typography?.letterSpacing,
    lineHeight: typography?.lineHeight,
    maxWidth: typography?.maxWidth,
    textAlign: typography?.textAlign as any,
    // Appearance
    color: appearance?.color,
    emissive: appearance?.emissive,
    emissiveIntensity: appearance?.emissiveIntensity,
    material: appearance?.material as any,
    metalness: appearance?.metalness,
    roughness: appearance?.roughness,
    // Outline
    outlineColor: outline?.enabled ? outline.outlineColor : undefined,
    outlineWidth: outline?.enabled ? outline.outlineWidth : undefined,
    outlineOpacity: outline?.enabled ? outline.outlineOpacity : undefined,
    // Animation
    animation: animation ? {
      type: animation.type as any,
      duration: animation.duration,
      delay: animation.delay,
      stagger: animation.stagger,
    } : undefined,
    // Transform
    position: transform?.position ? [
      transform.position.x || 0,
      transform.position.y || 0,
      transform.position.z || 0,
    ] as [number, number, number] : undefined,
    rotation: transform?.rotation ? [
      (transform.rotation.x || 0) * Math.PI / 180,
      (transform.rotation.y || 0) * Math.PI / 180,
      (transform.rotation.z || 0) * Math.PI / 180,
    ] as [number, number, number] : undefined,
    scale: transform?.scale,
  }
  
  const containerStyle = {
    height: layout?.height || '400px',
    width: layout?.fullWidth ? '100%' : 'auto',
    backgroundColor: layout?.backgroundColor || 'transparent',
  }
  
  return (
    <WebGLTextClient
      config={textConfig}
      style={containerStyle}
    />
  )
}