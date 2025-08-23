# Shared Canvas System

## Overview

The shared canvas system is the heart of our WebGL architecture. Instead of creating multiple canvases (which leads to context limits and performance issues), we maintain a single persistent WebGL context that all components share.

## Core Concepts

### 1. Global Canvas
A single `<Canvas>` component that:
- Persists across route changes
- Manages the WebGL context
- Handles rendering optimization
- Provides a portal for components

### 2. UseCanvas Portal
Components can render into the global canvas from anywhere in the React tree using the `UseCanvas` component or `useCanvas` hook.

### 3. Scroll Synchronization
Using @14islands/r3f-scroll-rig, WebGL objects stay synchronized with their DOM counterparts during scroll.

## Implementation

### Root Layout with Global Canvas

Create `src/components/providers/CanvasProvider.tsx`:

```typescript
'use client'

import { GlobalCanvas, SmoothScrollbar } from '@14islands/r3f-scroll-rig'
import { Preload, PerformanceMonitor } from '@react-three/drei'
import { ReactNode, useRef } from 'react'
import { useCanvasStore } from '@/lib/stores/canvas-store'
import { Perf } from 'r3f-perf'

interface CanvasProviderProps {
  children: ReactNode
}

export function CanvasProvider({ children }: CanvasProviderProps) {
  const eventSource = useRef<HTMLDivElement>(null!)
  const { showPerf } = useCanvasStore()

  return (
    <>
      {/* DOM Content */}
      <div ref={eventSource} className="canvas-event-source">
        {children}
      </div>

      {/* Smooth Scrollbar */}
      <SmoothScrollbar
        enabled={true}
        config={{
          lerp: 0.1,
          smooth: true,
          smartphone: {
            smooth: true,
          },
          tablet: {
            smooth: true,
          },
        }}
      />

      {/* Global WebGL Canvas */}
      <GlobalCanvas
        // Scaling
        scaleMultiplier={0.01} // 100px = 1 world unit
        
        // Performance
        frameloop="demand" // Only render when needed
        performance={{ min: 0.5 }} // Adaptive performance
        
        // Events
        eventSource={eventSource}
        eventPrefix="client"
        
        // Camera
        camera={{
          fov: 45,
          near: 0.1,
          far: 200,
          position: [0, 0, 5],
        }}
        
        // Rendering
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        
        // Shadows
        shadows={{
          enabled: true,
          type: 'PCFSoft',
        }}
        
        // Style
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        {/* Performance Monitoring */}
        {showPerf && <Perf position="top-left" />}
        
        <PerformanceMonitor
          onIncline={() => console.log('Performance improving')}
          onDecline={() => console.log('Performance declining')}
          flipflops={3}
          onFallback={() => {
            // Reduce quality on poor performance
            useCanvasStore.getState().setQuality('low')
          }}
        />

        {/* Global Scene Setup */}
        <fog attach="fog" args={['#000000', 10, 50]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        {/* Preload all assets */}
        <Preload all />
      </GlobalCanvas>
    </>
  )
}
```

### WebGL View Component

Create `src/components/canvas/WebGLView.tsx`:

```typescript
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
```

### Canvas Store

Create `src/lib/stores/canvas-store.ts`:

```typescript
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

type Quality = 'low' | 'medium' | 'high'

interface CanvasStore {
  // Quality settings
  quality: Quality
  setQuality: (quality: Quality) => void
  
  // Performance
  fps: number
  setFps: (fps: number) => void
  showPerf: boolean
  togglePerf: () => void
  
  // Rendering
  needsRender: boolean
  requestRender: () => void
  renderComplete: () => void
  
  // Scene management
  activeScenes: Set<string>
  registerScene: (id: string) => void
  unregisterScene: (id: string) => void
  
  // Settings based on quality
  getQualitySettings: () => {
    pixelRatio: number
    shadows: boolean
    antialias: boolean
    postprocessing: boolean
    reflections: boolean
  }
}

export const useCanvasStore = create<CanvasStore>()(
  subscribeWithSelector((set, get) => ({
    // State
    quality: 'medium',
    fps: 60,
    showPerf: false,
    needsRender: false,
    activeScenes: new Set(),

    // Actions
    setQuality: (quality) => set({ quality }),
    setFps: (fps) => set({ fps }),
    togglePerf: () => set((state) => ({ showPerf: !state.showPerf })),
    
    requestRender: () => set({ needsRender: true }),
    renderComplete: () => set({ needsRender: false }),
    
    registerScene: (id) => {
      set((state) => ({
        activeScenes: new Set(state.activeScenes).add(id),
      }))
    },
    
    unregisterScene: (id) => {
      set((state) => {
        const scenes = new Set(state.activeScenes)
        scenes.delete(id)
        return { activeScenes: scenes }
      })
    },

    // Computed
    getQualitySettings: () => {
      const quality = get().quality
      
      switch (quality) {
        case 'low':
          return {
            pixelRatio: 1,
            shadows: false,
            antialias: false,
            postprocessing: false,
            reflections: false,
          }
        case 'medium':
          return {
            pixelRatio: 1.5,
            shadows: true,
            antialias: true,
            postprocessing: true,
            reflections: false,
          }
        case 'high':
          return {
            pixelRatio: 2,
            shadows: true,
            antialias: true,
            postprocessing: true,
            reflections: true,
          }
      }
    },
  }))
)
```

## Usage Examples

### Basic WebGL Block

```typescript
'use client'

import { WebGLView } from '@/components/canvas/WebGLView'
import { Box } from '@react-three/drei'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

export function MyWebGLBlock() {
  const domRef = useRef<HTMLDivElement>(null!)
  const meshRef = useRef<Mesh>(null!)
  
  return (
    <section className="my-block">
      <div ref={domRef} className="content">
        <h2>My 3D Content</h2>
        <p>This content is enhanced with WebGL</p>
      </div>
      
      <WebGLView track={domRef} className="absolute inset-0">
        <Box ref={meshRef}>
          <meshStandardMaterial color="hotpink" />
        </Box>
      </WebGLView>
    </section>
  )
}
```

### Viewport-Isolated Scene

```typescript
export function IsolatedSceneBlock() {
  const ref = useRef<HTMLDivElement>(null!)
  
  return (
    <section ref={ref} className="isolated-scene">
      <WebGLView 
        track={ref} 
        viewport // Use ViewportScrollScene
        className="w-full h-screen"
      >
        {({ scale, scrollState }) => (
          <>
            {/* Custom camera for this viewport */}
            <PerspectiveCamera makeDefault position={[0, 0, 10]} />
            
            {/* Custom lighting */}
            <ambientLight intensity={0.2} />
            <spotLight position={[10, 10, 10]} />
            
            {/* Content scaled to DOM element */}
            <mesh scale={scale}>
              <planeGeometry />
              <meshBasicMaterial color="blue" />
            </mesh>
            
            {/* Scroll-based opacity */}
            <mesh position-y={scrollState.progress * 5}>
              <sphereGeometry />
              <meshStandardMaterial 
                opacity={scrollState.visibility} 
                transparent 
              />
            </mesh>
          </>
        )}
      </WebGLView>
    </section>
  )
}
```

### Persistent Objects Between Routes

```typescript
// Components that should persist between pages use persistId
export function PersistentHero() {
  return (
    <WebGLView persistId="hero-model" className="hero">
      <FloatingModel />
    </WebGLView>
  )
}

// On another page, use the same persistId
export function AboutHero() {
  return (
    <WebGLView persistId="hero-model" className="about-hero">
      {/* Same model continues from previous page */}
    </WebGLView>
  )
}
```

## Advanced Patterns

### Multi-Pass Rendering

```typescript
import { createPortal } from '@react-three/fiber'
import { useFBO } from '@react-three/drei'

export function MultiPassScene() {
  const renderTarget = useFBO()
  
  return (
    <WebGLView>
      {/* First pass - render to texture */}
      {createPortal(
        <FirstPassContent />,
        renderTarget.scene,
        { camera: renderTarget.camera }
      )}
      
      {/* Second pass - use texture */}
      <mesh>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial map={renderTarget.texture} />
      </mesh>
    </WebGLView>
  )
}
```

### Performance Optimization

```typescript
import { useCanvasStore } from '@/lib/stores/canvas-store'
import { Detailed, BakeShadows } from '@react-three/drei'

export function OptimizedScene() {
  const { quality } = useCanvasStore()
  const settings = useCanvasStore((s) => s.getQualitySettings())
  
  return (
    <WebGLView>
      {/* Bake shadows for better performance */}
      {settings.shadows && <BakeShadows />}
      
      {/* Level of Detail */}
      <Detailed distances={[0, 10, 20]}>
        <HighDetailModel />
        <MediumDetailModel />
        <LowDetailModel />
      </Detailed>
      
      {/* Conditional rendering based on quality */}
      {quality === 'high' && <ParticleEffects />}
      {settings.reflections && <Reflections />}
    </WebGLView>
  )
}
```

## Best Practices

1. **Always use demand rendering**: Set `frameloop="demand"` on GlobalCanvas
2. **Track DOM elements**: Use refs to keep WebGL aligned with DOM
3. **Optimize offscreen content**: Hide or reduce quality for out-of-view elements
4. **Pool resources**: Reuse geometries, materials, and textures
5. **Use viewport scenes sparingly**: Only when you need isolated cameras/lighting
6. **Batch updates**: Group state changes to minimize re-renders
7. **Profile regularly**: Use r3f-perf to monitor performance

## Debugging

### Enable Debug Mode

```typescript
<WebGLView debug>
  {/* Shows wireframe of tracked DOM element */}
</WebGLView>
```

### Performance Monitoring

```typescript
// In your layout
import { Stats } from '@react-three/drei'

<GlobalCanvas>
  <Stats showPanel={0} /> // FPS
  <Stats showPanel={1} /> // MS per frame
  <Stats showPanel={2} /> // Memory
</GlobalCanvas>
```

### Canvas Store DevTools

```typescript
// In development, expose store to window
if (process.env.NODE_ENV === 'development') {
  window.canvasStore = useCanvasStore
}
```