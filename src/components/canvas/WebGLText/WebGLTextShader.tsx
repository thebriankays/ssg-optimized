'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
// @ts-ignore
import { Text } from 'troika-three-text'

interface WebGLTextShaderProps {
  text: string
  font?: string
  fontSize?: number
  color?: string
  position?: [number, number, number]
  animation?: {
    type: 'reveal' | 'wave' | 'glow' | 'none' | 'typewriter' | 'fade' | 'glitch'
    duration?: number
    delay?: number
    loop?: boolean
  }
  maxWidth?: number
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  anchorX?: 'left' | 'center' | 'right' | number
  anchorY?: 'top' | 'middle' | 'bottom' | 'top-baseline' | 'bottom-baseline' | number
  letterSpacing?: number
  lineHeight?: number
}

export function WebGLTextShader({
  text,
  font = '/fonts/inter-bold.woff',
  fontSize = 1,
  color = '#ffffff',
  position = [0, 0, 0],
  animation = { type: 'none' },
  maxWidth,
  textAlign = 'center',
  anchorX = 'center',
  anchorY = 'middle',
  letterSpacing = 0,
  lineHeight = 1.2,
}: WebGLTextShaderProps) {
  const textRef = useRef<any>(null)
  const progress = useRef(0)
  
  const colorObj = useMemo(() => new THREE.Color(color), [color])
  
  // Create troika text instance
  useEffect(() => {
    const troikaText = new Text()
    troikaText.text = text
    troikaText.font = font
    troikaText.fontSize = fontSize
    troikaText.color = colorObj
    troikaText.maxWidth = maxWidth
    troikaText.textAlign = textAlign
    troikaText.anchorX = anchorX
    troikaText.anchorY = anchorY
    troikaText.letterSpacing = letterSpacing
    troikaText.lineHeight = lineHeight
    
    // Sync to generate geometry
    troikaText.sync()
    
    if (textRef.current) {
      textRef.current.add(troikaText)
    }
    
    return () => {
      troikaText.dispose()
    }
  }, [text, font, fontSize, colorObj, maxWidth, textAlign, anchorX, anchorY, letterSpacing, lineHeight])
  
  // Animation state
  useFrame((state) => {
    if (!textRef.current || !textRef.current.children[0]) return
    
    const troikaText = textRef.current.children[0]
    const time = state.clock.elapsedTime
    
    // Handle animations
    if (animation.type === 'reveal') {
      const duration = animation.duration || 1000
      const delay = animation.delay || 0
      const elapsed = (Date.now() - delay) / duration
      
      progress.current = animation.loop 
        ? (elapsed % 2 < 1 ? elapsed % 1 : 1 - (elapsed % 1))
        : Math.min(Math.max(elapsed, 0), 1)
        
      troikaText.material.opacity = progress.current
    } else if (animation.type === 'wave') {
      const waveAmount = Math.sin(time * 2) * 0.1
      troikaText.position.y = waveAmount
    } else if (animation.type === 'glow') {
      const glowIntensity = Math.sin(time * 2) * 0.5 + 0.5
      if (troikaText.material) {
        troikaText.material.emissiveIntensity = glowIntensity
      }
    } else if (animation.type === 'fade') {
      const duration = animation.duration || 1000
      const delay = animation.delay || 0
      const elapsed = (Date.now() - delay) / duration
      troikaText.material.opacity = Math.min(Math.max(elapsed, 0), 1)
    }
  })
  
  return (
    <group ref={textRef} position={position} />
  )
}