'use client'

import { useRef, useEffect, useState, Suspense, useMemo } from 'react'
import { useTransitionStore } from '@/lib/stores/transition-store'
import { TransitionPortal } from '@/components/transitions/TransitionPortal'
// import { Preload } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import { WhatameshSimple } from '@/components/canvas/Background/WhatameshSimple'
import { useAppStore } from '@/lib/stores/app-store'
import * as THREE from 'three'

const DEFAULT_GRADIENT_COLORS: [string, string, string, string] = [
  '#dca8d8', // light purple
  '#a3d3f9', // light blue
  '#fcd6d6', // light pink
  '#eae2ff', // light lavender
]

function GlobalCanvasContentInner() {
  const containerRef = useRef<HTMLElement>(null!)
  const { isTransitioning, direction, onComplete } = useTransitionStore()
  const [isReady, setIsReady] = useState(false)
  const [backgroundSettings, setBackgroundSettings] = useState<any>(null)
  const webglEnabled = useAppStore((state) => state.webglEnabled)
  const { gl } = useThree()
  
  // Wait for WebGL context to be fully ready
  useEffect(() => {
    if (gl && gl.domElement) {
      // Small delay to ensure context is fully initialized
      const timer = setTimeout(() => {
        setIsReady(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [gl])
  
  // Fetch background settings from site settings
  useEffect(() => {
    fetch('/api/globals/site-settings')
      .then(res => res.json())
      .then(data => {
        if (data?.webgl?.background) {
          
          // Check if colors are too dark (all black/gray colors)
          const bg = data.webgl.background
          const isDark = [bg.color1, bg.color2, bg.color3, bg.color4].every(color => {
            // Check if color is very dark (close to black)
            return color && (color.startsWith('#0') || color.startsWith('#1') || color.startsWith('#2') || color.startsWith('#3'))
          })
          
          if (isDark) {
            setBackgroundSettings({
              ...bg,
              color1: DEFAULT_GRADIENT_COLORS[0],
              color2: DEFAULT_GRADIENT_COLORS[1],
              color3: DEFAULT_GRADIENT_COLORS[2],
              color4: DEFAULT_GRADIENT_COLORS[3],
            })
          } else {
            setBackgroundSettings(data.webgl.background)
          }
        } else {
          // Fallback to default Whatamesh if no settings found
          setBackgroundSettings({
            type: 'whatamesh',
            color1: DEFAULT_GRADIENT_COLORS[0],
            color2: DEFAULT_GRADIENT_COLORS[1],
            color3: DEFAULT_GRADIENT_COLORS[2],
            color4: DEFAULT_GRADIENT_COLORS[3],
            intensity: 0.5
          })
        }
      })
      .catch(err => {
        // Fallback to default on error
        setBackgroundSettings({
          type: 'whatamesh',
          color1: DEFAULT_GRADIENT_COLORS[0],
          color2: DEFAULT_GRADIENT_COLORS[1],
          color3: DEFAULT_GRADIENT_COLORS[2],
          color4: DEFAULT_GRADIENT_COLORS[3],
          intensity: 0.5
        })
      })
  }, [])
  
  // Set up container ref from DOM
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return
    
    const updateRef = () => {
      // Look specifically for the PageTransition container, not the page content
      const element = document.querySelector('.fixed[data-transition-container]') as HTMLDivElement
      if (element) {
        containerRef.current = element
      }
    }
    
    // Delay initial check to ensure DOM is ready
    const timeout = setTimeout(updateRef, 100)
    
    // Check periodically in case DOM changes
    const interval = setInterval(updateRef, 1000)
    
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [])
  
  const handleComplete = () => {
    if (onComplete) {
      onComplete()
    }
  }
  
  
  return (
    <>
      {/* Animated Whatamesh background */}
      {isReady && backgroundSettings && (
        <WhatameshSimple
          colors={[
            backgroundSettings?.color1 || DEFAULT_GRADIENT_COLORS[0],
            backgroundSettings?.color2 || DEFAULT_GRADIENT_COLORS[1],
            backgroundSettings?.color3 || DEFAULT_GRADIENT_COLORS[2],
            backgroundSettings?.color4 || DEFAULT_GRADIENT_COLORS[3],
          ]}
        />
      )}
      
      {/* Global lighting - removed fog as it was making everything black */}
      {/* <fog attach="fog" args={['#000000', 10, 50]} /> */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      
      {/* Preload assets after context is ready - temporarily disabled due to Portal error */}
      {/* {isReady && (
        <Suspense fallback={null}>
          <Preload all />
        </Suspense>
      )} */}
      
      {/* Page transition portal - only render when ready */}
      {isReady && isTransitioning && containerRef.current && (
        <TransitionPortal
          isTransitioning={isTransitioning}
          direction={direction}
          onComplete={handleComplete}
          containerRef={containerRef}
        />
      )}
    </>
  )
}

// Fullscreen gradient background that always fills viewport
function FullscreenGradient({ colors }: { colors: string[] }) {
  const { viewport } = useThree()
  
  const material = useMemo(() => {
    const colorArray = colors.map(hex => new THREE.Color(hex))
    
    return (
      <meshBasicMaterial
        vertexColors
        depthWrite={false}
        depthTest={false}
      />
    )
  }, [colors])
  
  // Create gradient geometry with vertex colors
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1, 1, 1)
    const colors = new Float32Array([
      // Top left - color1
      ...new THREE.Color(colors[0]).toArray(),
      // Top right - color2  
      ...new THREE.Color(colors[1]).toArray(),
      // Bottom left - color3
      ...new THREE.Color(colors[2]).toArray(),
      // Bottom right - color4
      ...new THREE.Color(colors[3]).toArray(),
    ])
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [colors])
  
  // Scale to fill viewport with extra margin
  const scale = Math.max(viewport.width, viewport.height) * 2
  
  return (
    <mesh
      position={[0, 0, -10]}
      scale={[scale, scale, 1]}
      renderOrder={-2000}
      frustumCulled={false}
      geometry={geometry}
    >
      {material}
    </mesh>
  )
}

// Test cube component to verify canvas is working
function TestCube() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5
      meshRef.current.rotation.y += delta * 0.5
    }
  })
  
  return (
    <mesh ref={meshRef} position={[2, 0, -5]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.2} />
    </mesh>
  )
}

// Error boundary wrapper
export function GlobalCanvasContent() {
  try {
    return <GlobalCanvasContentInner />
  } catch (error) {
    console.error('Error in GlobalCanvasContent:', error)
    return null
  }
}