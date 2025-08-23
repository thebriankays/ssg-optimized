# React Three Fiber Scroll-Rig Architecture

## Overview

This project implements a sophisticated WebGL-powered website using **@14islands/r3f-scroll-rig** for seamless DOM-to-WebGL synchronization, combined with a liquid glass design system for stunning visual effects.

## Core Architecture

### 1. Persistent Global Canvas

The entire application uses a single, persistent WebGL canvas that remains mounted across page navigations. This approach:

- **Preserves WebGL context** between page loads
- **Shares resources** across all 3D components
- **Maintains 60fps performance** with on-demand rendering
- **Synchronizes perfectly** with DOM scroll

```tsx
// The canvas is initialized once in the root layout
<GlobalCanvas 
  scaleMultiplier={0.01}  // 100px = 1 world unit
  frameloop="demand"       // Only render when needed
/>
```

### 2. Scroll-Rig Components

#### ScrollScene
Tracks DOM elements and renders synchronized WebGL content:

```tsx
import { UseCanvas, ScrollScene } from '@14islands/r3f-scroll-rig'

export function MyComponent() {
  const ref = useRef()
  
  return (
    <>
      <div ref={ref}>DOM Content</div>
      <UseCanvas>
        <ScrollScene track={ref}>
          {({ scale }) => (
            <mesh scale={scale}>
              <planeGeometry />
              <meshBasicMaterial />
            </mesh>
          )}
        </ScrollScene>
      </UseCanvas>
    </>
  )
}
```

#### ViewportScrollScene
Creates isolated rendering contexts with independent cameras:

```tsx
<ViewportScrollScene track={ref}>
  {({ scale }) => (
    <>
      <PerspectiveCamera makeDefault />
      <CustomLighting />
      <MyComplexScene scale={scale} />
    </>
  )}
</ViewportScrollScene>
```

#### ParallaxScrollScene
Adds parallax effects to scroll-synchronized content:

```tsx
<ParallaxScrollScene track={ref} speed={0.5}>
  {({ scale }) => (
    <BackgroundMesh scale={scale} />
  )}
</ParallaxScrollScene>
```

#### StickyScrollScene
Creates sticky 3D elements that follow scroll like CSS `position: sticky`:

```tsx
<StickyScrollScene track={stickyRef} fillViewport>
  {({ scale }) => (
    <FloatingObject scale={scale} />
  )}
</StickyScrollScene>
```

### 3. Liquid Glass Design System

The project features a comprehensive glass design system with both CSS and WebGL implementations:

#### Glass Presets

- **Frosted**: Subtle blur with light refraction
- **Clear**: Minimal distortion, high transparency
- **Refractive**: Strong light bending effects
- **Holographic**: Animated iridescent effects
- **Liquid**: Dynamic flow distortions

#### Usage Examples

```tsx
// DOM Glass Components
<GlassContainer preset="frosted" interactive glowOnHover>
  <YourContent />
</GlassContainer>

<GlassButton preset="holographic" size="lg">
  Click Me
</GlassButton>

// WebGL Glass Effects
<LiquidGlassEffect 
  intensity={1.2}
  followMouse
  distortion={3}
/>

<GlassPanel3D 
  preset="refractive"
  width={2}
  height={3}
/>
```

## Component Architecture

### Directory Structure

```
src/
├── components/
│   ├── canvas/
│   │   ├── scroll-rig/          # Scroll-synchronized components
│   │   │   ├── ParallaxScrollScene.tsx
│   │   │   ├── StickyScrollScene.tsx
│   │   │   ├── WebGLImage.tsx
│   │   │   └── WebGLTextScrollRig.tsx
│   │   ├── LiquidGlassEffect.tsx
│   │   └── [other 3D components]
│   └── ui/
│       └── glass/                # Glass UI components
│           ├── GlassComponents.tsx
│           └── glass-styles.scss
├── lib/
│   ├── glass/
│   │   └── materials.ts         # WebGL glass materials
│   └── stores/
│       └── canvas-store.ts      # Canvas state management
└── providers/
    └── Canvas/
        └── index.tsx            # Global canvas provider
```

### Key Hooks

#### useScrollRig
Access scroll rig state and utilities:

```tsx
const { 
  isCanvasAvailable,
  scaleMultiplier,
  reflow,
  requestRender
} = useScrollRig()
```

#### useScrollbar
Control and monitor scroll state:

```tsx
const { 
  scroll,
  scrollTo,
  onScroll
} = useScrollbar()
```

#### useTracker
Manually track DOM elements:

```tsx
const tracker = useTracker(elementRef, {
  rootMargin: '50%',
  autoUpdate: true
})
```

## Animation System

### GSAP Integration

The project uses GSAP for complex animations synchronized with scroll:

```tsx
import { useGSAPAnimation } from '@/hooks/useGSAPAnimation'

useGSAPAnimation(ref, {
  scrollTrigger: {
    trigger: ref,
    start: 'top bottom',
    end: 'bottom top',
    scrub: true
  },
  timeline: (tl) => {
    tl.to(ref.current, {
      rotation: Math.PI * 2,
      duration: 1
    })
  }
})
```

### Scroll-Triggered Animations

```tsx
// Automatic scroll-based animation
<ScrollScene track={ref}>
  {({ scrollState }) => {
    // scrollState.progress: 0 (below) to 1 (above)
    // scrollState.visibility: % of element in view
    // scrollState.viewport: % of viewport scrolled
    
    return <AnimatedMesh progress={scrollState.progress} />
  }}
</ScrollScene>
```

## Performance Optimization

### 1. On-Demand Rendering

The canvas only renders when necessary:

```tsx
frameloop="demand"  // Set on GlobalCanvas

// Manually trigger render when needed
const { requestRender } = useScrollRig()
requestRender()
```

### 2. Viewport Culling

Components automatically hide when outside viewport:

```tsx
<ScrollScene hideOffscreen={true}>
  {/* Only renders when in view */}
</ScrollScene>
```

### 3. Quality Scaling

Adaptive quality based on device performance:

```tsx
<PerformanceMonitor
  onDecline={() => {
    useCanvasStore.getState().setQuality('low')
  }}
/>
```

### 4. Asset Optimization

- Use DRACO compression for models
- Implement texture atlasing
- Lazy load heavy assets
- Use LOD (Level of Detail) for complex geometries

## Creating New WebGL Components

### Basic Template

```tsx
'use client'

import { useRef } from 'react'
import { UseCanvas, ScrollScene } from '@14islands/r3f-scroll-rig'
import { useFrame } from '@react-three/fiber'

export function MyWebGLComponent() {
  const domRef = useRef<HTMLDivElement>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  
  return (
    <>
      {/* DOM Placeholder */}
      <div ref={domRef} className="my-component">
        <h2>Fallback Content</h2>
      </div>
      
      {/* WebGL Content */}
      <UseCanvas>
        <ScrollScene track={domRef}>
          {({ scale, scrollState }) => (
            <mesh ref={meshRef} scale={scale}>
              <boxGeometry />
              <meshStandardMaterial />
            </mesh>
          )}
        </ScrollScene>
      </UseCanvas>
    </>
  )
}
```

### Advanced Component with Glass Effects

```tsx
'use client'

import { useRef, useMemo } from 'react'
import { UseCanvas, ViewportScrollScene } from '@14islands/r3f-scroll-rig'
import { createGlassMaterial } from '@/lib/glass/materials'
import { GlassContainer } from '@/components/ui/glass/GlassComponents'

export function AdvancedGlassComponent() {
  const ref = useRef<HTMLDivElement>(null)
  
  const glassMaterial = useMemo(() => 
    createGlassMaterial('holographic'), []
  )
  
  return (
    <>
      <GlassContainer 
        ref={ref} 
        preset="holographic"
        interactive
        liquidEffect
      >
        <h2>Glass Content</h2>
      </GlassContainer>
      
      <UseCanvas>
        <ViewportScrollScene track={ref}>
          {({ scale }) => (
            <>
              <mesh scale={scale} material={glassMaterial}>
                <sphereGeometry args={[1, 64, 64]} />
              </mesh>
              <LiquidGlassEffect intensity={1.5} />
            </>
          )}
        </ViewportScrollScene>
      </UseCanvas>
    </>
  )
}
```

## Best Practices

### 1. DOM-First Development
Always create the DOM structure first, then enhance with WebGL. This ensures:
- SEO compatibility
- Accessibility
- Progressive enhancement
- Graceful degradation

### 2. State Management
Use Zustand stores for shared WebGL state:

```tsx
const { quality, setQuality } = useCanvasStore()
```

### 3. Memory Management
Clean up resources properly:

```tsx
useEffect(() => {
  return () => {
    geometry.dispose()
    material.dispose()
    texture.dispose()
  }
}, [])
```

### 4. Responsive Design
Use the scale prop to maintain aspect ratios:

```tsx
<ScrollScene track={ref}>
  {({ scale }) => (
    <mesh scale={scale}> {/* Automatically matches DOM size */}
      {/* ... */}
    </mesh>
  )}
</ScrollScene>
```

## Debugging

### Enable Debug Mode

```tsx
<GlobalCanvas debug={true} />
<ScrollScene debug={true} />
```

### Performance Monitoring

```tsx
// In development
import { Perf } from 'r3f-perf'

<GlobalCanvas>
  <Perf position="top-left" />
</GlobalCanvas>
```

### Common Issues

1. **Z-Fighting**: Adjust `scaleMultiplier` on GlobalCanvas
2. **Scroll Lag**: Check `frameloop` setting and reduce quality
3. **Memory Leaks**: Ensure proper cleanup in useEffect
4. **Hydration Errors**: Use client components for WebGL content

## Advanced Topics

### Custom Shaders

```tsx
const customShader = {
  uniforms: {
    time: { value: 0 },
    color: { value: new THREE.Color('#ffffff') }
  },
  vertexShader: `...`,
  fragmentShader: `...`
}

<shaderMaterial args={[customShader]} />
```

### Post-Processing

```tsx
import { EffectComposer, Bloom } from '@react-three/postprocessing'

<EffectComposer>
  <Bloom intensity={1.5} />
</EffectComposer>
```

### Physics Integration

```tsx
import { Physics, RigidBody } from '@react-three/rapier'

<Physics>
  <RigidBody>
    <mesh />
  </RigidBody>
</Physics>
```

## Deployment Considerations

1. **Build Optimization**
   - Enable SWC minification
   - Use dynamic imports for heavy components
   - Implement code splitting

2. **Asset CDN**
   - Host 3D models on CDN
   - Use image optimization
   - Implement progressive loading

3. **Performance Budgets**
   - Target 60fps on mid-range devices
   - Keep bundle under 500KB
   - Lazy load non-critical assets

## Support & Resources

- [r3f-scroll-rig Documentation](https://github.com/14islands/r3f-scroll-rig)
- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber)
- [Three.js Documentation](https://threejs.org/docs)
- [GSAP Documentation](https://greensock.com/docs)