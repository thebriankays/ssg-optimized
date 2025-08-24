import React from 'react'
import type { WebGLTextBlock as WebGLTextBlockType } from '../types'
import { WebGLTextWrapper } from './ComponentWrapper'

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
  
  // Determine text element based on font size for semantic HTML
  const TextElement = 
    (typography?.fontSize || 24) >= 48 ? 'h1' :
    (typography?.fontSize || 24) >= 36 ? 'h2' :
    (typography?.fontSize || 24) >= 24 ? 'h3' :
    'p'
  
  return (
    <div className="webgl-text-wrapper relative">
      {/* SEO-friendly DOM text for accessibility and search engines */}
      <TextElement 
        className="sr-only"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {text}
      </TextElement>
      
      {/* WebGL version */}
      <WebGLTextWrapper
        config={textConfig}
        style={containerStyle}
      />
    </div>
  )
}