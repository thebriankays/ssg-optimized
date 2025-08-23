# Performance Optimization Guide

## Overview

Performance is critical for WebGL applications. This guide covers optimization strategies for achieving 60fps on mid-range devices while maintaining visual quality.

## Performance Budget

### Target Metrics
- **FPS**: 60fps (16.67ms per frame)
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **Memory**: < 200MB for WebGL
- **Bundle Size**: < 500KB for 3D assets

## Rendering Optimization

### 1. Demand-Driven Rendering

```typescript
// Only render when needed
<GlobalCanvas frameloop="demand">
  {/* Content */}
</GlobalCanvas>

// Request render manually
import { useThree } from '@react-three/fiber'

function InteractiveComponent() {
  const { invalidate } = useThree()
  
  const handleInteraction = () => {
    // Update state
    // Then request a render
    invalidate()
  }
}
```

### 2. Frustum Culling

```typescript
import { useFrustum } from '@/hooks/webgl/useFrustum'

export function OptimizedScene() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const isInFrustum = useFrustum(meshRef)
  
  return (
    <mesh ref={meshRef} visible={isInFrustum}>
      {/* Only renders when in camera view */}
    </mesh>
  )
}
```

### 3. Level of Detail (LOD)

```typescript
import { useLOD } from '@react-three/drei'

export function AdaptiveModel() {
  const [lodLevel, distance] = useLOD()
  
  // Different models for different distances
  const models = {
    0: '/models/high-detail.glb',
    1: '/models/medium-detail.glb',
    2: '/models/low-detail.glb',
  }
  
  return <Model url={models[lodLevel]} />
}
```

## Asset Optimization

### 1. Model Compression

```bash
# Install gltf-pipeline
npm install -g gltf-pipeline

# Compress with Draco
gltf-pipeline -i model.glb -o model-compressed.glb -d

# Optimize textures
gltf-pipeline -i model.glb -o model-optimized.glb \
  --texture-compress.formats "ktx2" \
  --texture-compress.quality 90
```

### 2. Texture Optimization

```typescript
import { useTexture } from '@react-three/drei'
import { RepeatWrapping, LinearMipMapLinearFilter } from 'three'

export function OptimizedTextures() {
  const textures = useTexture({
    map: '/textures/diffuse-1k.jpg', // Use appropriate resolution
    normalMap: '/textures/normal-1k.jpg',
    roughnessMap: '/textures/roughness-1k.jpg',
  })
  
  // Optimize texture settings
  Object.values(textures).forEach((texture) => {
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.minFilter = LinearMipMapLinearFilter
    texture.anisotropy = 4 // Balance quality/performance
  })
  
  return <meshStandardMaterial {...textures} />
}
```

### 3. Progressive Loading

```typescript
import { Suspense } from 'react'
import { useProgress } from '@react-three/drei'

function LoadingScreen() {
  const { active, progress, errors, item, loaded, total } = useProgress()
  
  return (
    <div className={`loading-screen ${!active && 'loading-screen--hidden'}`}>
      <div className="loading-bar">
        <div 
          className="loading-bar__fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <p>{Math.round(progress)}% loaded</p>
    </div>
  )
}

export function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Canvas>
        {/* Lazy loaded content */}
      </Canvas>
    </Suspense>
  )
}
```

## Memory Management

### 1. Resource Disposal

```typescript
import { useEffect, useRef } from 'react'
import { dispose } from '@react-three/fiber'
import * as THREE from 'three'

export function DisposableComponent() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const textureRef = useRef<THREE.Texture>()
  
  useEffect(() => {
    // Load texture
    const loader = new THREE.TextureLoader()
    loader.load('/texture.jpg', (texture) => {
      textureRef.current = texture
      if (meshRef.current) {
        meshRef.current.material.map = texture
      }
    })
    
    return () => {
      // Dispose on unmount
      if (textureRef.current) {
        textureRef.current.dispose()
      }
      if (meshRef.current) {
        dispose(meshRef.current)
      }
    }
  }, [])
  
  return (
    <mesh ref={meshRef}>
      <boxGeometry />
      <meshBasicMaterial />
    </mesh>
  )
}
```

### 2. Geometry Sharing

```typescript
import { useMemo } from 'react'
import * as THREE from 'three'

// Singleton geometry manager
class GeometryManager {
  private static geometries = new Map<string, THREE.BufferGeometry>()
  
  static get(key: string, factory: () => THREE.BufferGeometry) {
    if (!this.geometries.has(key)) {
      this.geometries.set(key, factory())
    }
    return this.geometries.get(key)!
  }
  
  static dispose(key: string) {
    const geometry = this.geometries.get(key)
    if (geometry) {
      geometry.dispose()
      this.geometries.delete(key)
    }
  }
}

// Usage
export function SharedGeometry() {
  const geometry = useMemo(
    () => GeometryManager.get('sphere', () => new THREE.SphereGeometry(1, 32, 32)),
    []
  )
  
  return (
    <>
      {/* Multiple meshes share the same geometry */}
      <mesh geometry={geometry} position={[-2, 0, 0]}>
        <meshBasicMaterial color="red" />
      </mesh>
      <mesh geometry={geometry} position={[2, 0, 0]}>
        <meshBasicMaterial color="blue" />
      </mesh>
    </>
  )
}
```

### 3. Texture Atlas

```typescript
import { useTexture } from '@react-three/drei'

export function AtlasSprite({ frame, atlas = '/textures/atlas.png' }) {
  const texture = useTexture(atlas)
  
  // Define sprite frames
  const frames = {
    icon1: { x: 0, y: 0, w: 64, h: 64 },
    icon2: { x: 64, y: 0, w: 64, h: 64 },
    icon3: { x: 128, y: 0, w: 64, h: 64 },
  }
  
  const { x, y, w, h } = frames[frame]
  const repeatX = w / texture.image.width
  const repeatY = h / texture.image.height
  const offsetX = x / texture.image.width
  const offsetY = 1 - (y + h) / texture.image.height
  
  return (
    <mesh>
      <planeGeometry />
      <meshBasicMaterial
        map={texture}
        map-repeat={[repeatX, repeatY]}
        map-offset={[offsetX, offsetY]}
      />
    </mesh>
  )
}
```

## Animation Performance

### 1. GPU-Based Animation

```typescript
// Vertex shader animation (runs on GPU)
const AnimatedMaterial = shaderMaterial(
  {
    uTime: 0,
    uFrequency: 2.0,
    uAmplitude: 0.1,
  },
  `
    uniform float uTime;
    uniform float uFrequency;
    uniform float uAmplitude;
    
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // GPU animation
      pos.y += sin(pos.x * uFrequency + uTime) * uAmplitude;
      pos.z += cos(pos.y * uFrequency + uTime) * uAmplitude;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  `
    varying vec2 vUv;
    
    void main() {
      gl_FragColor = vec4(vUv, 0.5, 1.0);
    }
  `
)
```

### 2. Instanced Animation

```typescript
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'

export function AnimatedInstances({ count = 1000 }) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  
  useFrame((state) => {
    if (!ref.current) return
    
    const time = state.clock.elapsedTime
    const mesh = ref.current
    
    // Update all instances in one pass
    for (let i = 0; i < count; i++) {
      const x = (i % 32) - 16
      const z = Math.floor(i / 32) - 16
      const y = Math.sin(x * 0.5 + time) * Math.cos(z * 0.5 + time) * 0.5
      
      mesh.setMatrixAt(
        i,
        new THREE.Matrix4().makeTranslation(x, y, z)
      )
    }
    
    mesh.instanceMatrix.needsUpdate = true
  })
  
  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial />
    </instancedMesh>
  )
}
```

## Network Performance

### 1. Asset Preloading

```typescript
import { Preload } from '@react-three/drei'

// Preload critical assets
export function PreloadAssets() {
  return (
    <Preload all>
      <Model url="/models/hero.glb" />
      <Texture url="/textures/environment.hdr" />
    </Preload>
  )
}
```

### 2. Lazy Loading

```typescript
import { lazy, Suspense } from 'react'

// Lazy load heavy components
const HeavyScene = lazy(() => import('./HeavyScene'))

export function App() {
  return (
    <Suspense fallback={<LoadingPlaceholder />}>
      <HeavyScene />
    </Suspense>
  )
}
```

### 3. CDN Strategy

```typescript
// Use CDN for static assets
const assetUrl = (path: string) => {
  const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL
  return CDN_URL ? `${CDN_URL}${path}` : path
}

// Usage
<Model url={assetUrl('/models/hero.glb')} />
```

## Monitoring & Profiling

### 1. Performance Monitor Component

```typescript
import { Stats } from '@react-three/drei'
import { Perf } from 'r3f-perf'

export function PerformanceMonitor({ detailed = false }) {
  if (process.env.NODE_ENV !== 'development') return null
  
  return (
    <>
      {detailed ? (
        <Perf 
          position="top-left" 
          showGraph 
          minimal={false}
        />
      ) : (
        <Stats showPanel={0} />
      )}
    </>
  )
}
```

### 2. Custom Performance Tracking

```typescript
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'

export function usePerformanceTracking() {
  const frames = useRef<number[]>([])
  const lastTime = useRef(performance.now())
  
  useFrame(() => {
    const now = performance.now()
    const delta = now - lastTime.current
    lastTime.current = now
    
    frames.current.push(delta)
    if (frames.current.length > 60) {
      frames.current.shift()
    }
    
    // Calculate metrics
    const avgDelta = frames.current.reduce((a, b) => a + b) / frames.current.length
    const fps = 1000 / avgDelta
    
    // Log warnings
    if (fps < 30) {
      console.warn('Low FPS detected:', fps.toFixed(2))
    }
  })
}
```

## Device-Specific Optimizations

### 1. Mobile Optimizations

```typescript
import { useQuality } from '@/components/providers/QualityProvider'

export function MobileOptimizedScene() {
  const { isMobile } = useQuality()
  
  return (
    <>
      {/* Reduce particle count on mobile */}
      <ParticleSystem count={isMobile ? 500 : 5000} />
      
      {/* Disable expensive effects */}
      {!isMobile && <PostProcessing />}
      
      {/* Use lower resolution textures */}
      <Model 
        url={isMobile ? '/models/low.glb' : '/models/high.glb'}
      />
    </>
  )
}
```

### 2. GPU Tier Detection

```typescript
import { useEffect, useState } from 'react'
import { getGPUTier } from 'detect-gpu'

export function useGPUTier() {
  const [tier, setTier] = useState(2)
  
  useEffect(() => {
    getGPUTier().then((result) => {
      setTier(result.tier)
    })
  }, [])
  
  return tier
}

// Usage
export function AdaptiveQuality() {
  const gpuTier = useGPUTier()
  
  const quality = {
    1: 'low',
    2: 'medium',
    3: 'high',
  }[gpuTier] || 'medium'
  
  return <Scene quality={quality} />
}
```

## Checklist

### Pre-Launch Performance Checklist

- [ ] All textures are compressed and appropriate resolution
- [ ] Models use Draco compression
- [ ] Geometries and materials are shared where possible
- [ ] Unused resources are disposed
- [ ] Animations run on GPU when possible
- [ ] Render-on-demand is enabled
- [ ] LOD is implemented for complex models
- [ ] Mobile-specific optimizations are in place
- [ ] Performance monitoring is set up
- [ ] Bundle size is within budget
- [ ] Memory usage is stable
- [ ] Frame rate is consistent at 60fps