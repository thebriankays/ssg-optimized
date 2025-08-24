'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { extend } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGSAPAnimation } from '@/hooks/useGSAPAnimation'
import { gsap } from 'gsap'
import type { WebGLTextConfig } from './types'
// @ts-ignore
import { Text as TroikaText } from 'troika-three-text'
import { WebGLTextShader } from './WebGLTextShader'

// Extend THREE namespace with troika text
extend({ TroikaText })

interface WebGLTextProps extends WebGLTextConfig {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number | [number, number, number]
  onClick?: () => void
  onPointerOver?: () => void
  onPointerOut?: () => void
  useShader?: boolean
}

export function WebGLText({
  text,
  font = '/fonts/inter-bold.woff',
  fontSize = 1,
  color = '#ffffff',
  emissive,
  emissiveIntensity = 0,
  letterSpacing = 0,
  lineHeight = 1.2,
  maxWidth,
  textAlign = 'center',
  anchorX = 'center',
  anchorY = 'middle',
  material = 'standard',
  metalness = 0,
  roughness = 0.5,
  animation = { type: 'none' },
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  onClick,
  onPointerOver,
  onPointerOut,
  useShader = false,
  ...troikaProps
}: WebGLTextProps) {
  const textRef = useRef<any>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [animationProgress, setAnimationProgress] = useState(0)
  
  // Animation progress
  useEffect(() => {
    if (animation.type === 'none') {
      setAnimationProgress(1)
      return
    }
    
    const duration = animation.duration || 1000
    const delay = animation.delay || 0
    
    const timeout = setTimeout(() => {
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        setAnimationProgress(progress)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      animate()
    }, delay)
    
    return () => clearTimeout(timeout)
  }, [animation])
  
  // Material configuration
  const materialProps = useMemo(() => {
    const baseProps = {
      color,
      transparent: true,
      opacity: animation.type === 'fade' ? animationProgress : 1,
    }
    
    if (material === 'standard' || material === 'physical') {
      return {
        ...baseProps,
        metalness,
        roughness,
        emissive: emissive || color,
        emissiveIntensity: emissiveIntensity * (isHovered ? 1.5 : 1),
      }
    }
    
    return baseProps
  }, [color, emissive, emissiveIntensity, material, metalness, roughness, isHovered, animation, animationProgress])
  
  // Typewriter effect
  const displayText = useMemo(() => {
    if (animation.type === 'typewriter') {
      const charCount = Math.floor(text.length * animationProgress)
      return text.slice(0, charCount)
    }
    return text
  }, [text, animation.type, animationProgress])
  
  // Wave animation
  useFrame((state) => {
    if (!textRef.current || animation.type !== 'wave') return
    
    const time = state.clock.elapsedTime
    const chars = textRef.current.children
    
    chars.forEach((char: any, i: number) => {
      const offset = i * (animation.stagger || 0.1)
      char.position.y = Math.sin(time * 2 + offset) * 0.1 * animationProgress
    })
  })
  
  // Glitch animation
  useFrame(() => {
    if (!groupRef.current || animation.type !== 'glitch' || animationProgress < 1) return
    
    if (Math.random() > 0.95) {
      const glitchX = (Math.random() - 0.5) * 0.1
      const glitchY = (Math.random() - 0.5) * 0.1
      groupRef.current.position.x = position[0] + glitchX
      groupRef.current.position.y = position[1] + glitchY
      
      setTimeout(() => {
        if (groupRef.current) {
          groupRef.current.position.x = position[0]
          groupRef.current.position.y = position[1]
        }
      }, 50)
    }
  })
  
  // GSAP hover animation - using proper pattern
  useGSAPAnimation(() => {
    if (!groupRef.current) return
    
    const tl = gsap.timeline()
    
    if (isHovered) {
      tl.to(groupRef.current.scale, {
        x: 1.05,
        y: 1.05,
        z: 1.05,
        duration: 0.3,
        ease: 'power2.out',
      })
    } else {
      tl.to(groupRef.current.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
    }
    
    // Return cleanup function
    return () => {
      tl.kill()
    }
  }, [isHovered])
  
  // Use shader version for specific animation types
  if (useShader || animation.type === 'reveal' || animation.type === 'wave' || animation.type === 'glow') {
    return (
      <group
        ref={groupRef}
        position={position}
        rotation={rotation}
        scale={scale}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          setIsHovered(true)
          onPointerOver?.()
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setIsHovered(false)
          onPointerOut?.()
        }}
      >
        <WebGLTextShader
          text={text}
          font={font}
          fontSize={fontSize}
          color={color}
          position={[0, 0, 0]}
          animation={animation}
          maxWidth={maxWidth}
          textAlign={textAlign}
          anchorX={anchorX}
          anchorY={anchorY}
          letterSpacing={letterSpacing}
          lineHeight={lineHeight}
        />
      </group>
    )
  }
  
  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      {/* @ts-expect-error R3F primitive for troika */}
      <troikaText
        ref={textRef}
        text={displayText}
        font={font}
        fontSize={fontSize}
        color={color}
        letterSpacing={letterSpacing}
        lineHeight={lineHeight}
        maxWidth={maxWidth}
        textAlign={textAlign}
        anchorX={anchorX}
        anchorY={anchorY}
        // Material properties
        material-color={materialProps.color}
        material-transparent={materialProps.transparent}
        material-opacity={materialProps.opacity}
        material-metalness={'metalness' in materialProps ? materialProps.metalness : undefined}
        material-roughness={'roughness' in materialProps ? materialProps.roughness : undefined}
        material-emissive={'emissive' in materialProps ? materialProps.emissive : undefined}
        material-emissiveIntensity={'emissiveIntensity' in materialProps ? materialProps.emissiveIntensity : undefined}
        // Stroke/outline properties (troika native support)
        strokeColor={troikaProps.outlineColor}
        strokeWidth={troikaProps.outlineWidth ? troikaProps.outlineWidth : 0}
        strokeOpacity={troikaProps.outlineOpacity || 1}
        fillOpacity={troikaProps.outlineWidth && !troikaProps.fillOpacity ? 1 : troikaProps.fillOpacity}
        // Events
        onClick={onClick}
        onPointerOver={(e: any) => {
          e.stopPropagation()
          setIsHovered(true)
          onPointerOver?.()
        }}
        onPointerOut={(e: any) => {
          e.stopPropagation()
          setIsHovered(false)
          onPointerOut?.()
        }}
        // Troika specific optimizations
        gpuAccelerate={true}
        sdfGlyphSize={64}
        {...troikaProps}
      />
    </group>
  )
}