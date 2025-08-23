# Quick Start Guide

## Installation

1. **Install missing dependencies:**
```bash
pnpm add vecn @14islands/lerp react-colorful postprocessing leva tweakpane
```

2. **Verify existing packages:**
```bash
# These should already be installed:
# @14islands/r3f-scroll-rig
# @react-three/fiber @react-three/drei @react-three/postprocessing
# three gsap lenis mouse-follower
```

## Basic Setup Checklist

### ✅ Global Canvas
The persistent WebGL canvas is already configured in:
- `/src/providers/Canvas/index.tsx`

### ✅ Scroll-Rig Components
Available components in `/src/components/canvas/scroll-rig/`:
- `ParallaxScrollScene` - Parallax effects
- `StickyScrollScene` - Sticky positioning
- `WebGLImage` - Image with shaders
- `WebGLTextScrollRig` - Synchronized text

### ✅ Glass Design System
Glass components in `/src/components/ui/glass/`:
- `GlassContainer` - Flexible glass container
- `GlassButton` - Interactive glass buttons
- `GlassNav` - Glass navigation bar

### ✅ WebGL Glass Effects
3D glass effects in `/src/components/canvas/`:
- `LiquidGlassEffect` - Liquid distortion
- `GlassPanel3D` - 3D glass panels

## Quick Examples

### 1. Simple Scroll-Synced Element
```tsx
import { UseCanvas, ScrollScene } from '@14islands/r3f-scroll-rig'
import { useRef } from 'react'

export function MyComponent() {
  const ref = useRef()
  
  return (
    <>
      <div ref={ref} className="h-screen">
        <h1>Scroll Me</h1>
      </div>
      
      <UseCanvas>
        <ScrollScene track={ref}>
          {({ scale }) => (
            <mesh scale={scale}>
              <boxGeometry />
              <meshStandardMaterial color="hotpink" />
            </mesh>
          )}
        </ScrollScene>
      </UseCanvas>
    </>
  )
}
```

### 2. Glass UI Component
```tsx
import { GlassContainer, GlassButton } from '@/components/ui/glass/GlassComponents'

export function GlassCard() {
  return (
    <GlassContainer 
      preset="frosted"
      interactive
      glowOnHover
      className="p-8"
    >
      <h2>Beautiful Glass Card</h2>
      <p>With liquid glass effects</p>
      <GlassButton preset="holographic">
        Click Me
      </GlassButton>
    </GlassContainer>
  )
}
```

### 3. Parallax Image
```tsx
import { ParallaxScrollScene, WebGLImage } from '@/components/canvas/scroll-rig'
import { useRef } from 'react'

export function ParallaxHero() {
  const imageRef = useRef()
  
  return (
    <>
      <img 
        ref={imageRef}
        src="/hero.jpg"
        className="w-full h-screen object-cover"
      />
      
      <UseCanvas>
        <ParallaxScrollScene track={imageRef} speed={0.5}>
          {(props) => (
            <WebGLImage el={imageRef} {...props} />
          )}
        </ParallaxScrollScene>
      </UseCanvas>
    </>
  )
}
```

## File Structure Overview

```
src/
├── components/
│   ├── canvas/
│   │   ├── scroll-rig/        # ✅ Scroll-synced components
│   │   ├── LiquidGlassEffect  # ✅ WebGL glass effects
│   │   └── [blocks]           # ✅ Various 3D components
│   └── ui/
│       └── glass/             # ✅ Glass UI components
├── lib/
│   ├── glass/
│   │   └── materials.ts       # ✅ Glass materials & shaders
│   └── stores/
│       └── canvas-store.ts    # ✅ Canvas state
├── providers/
│   ├── Canvas/                # ✅ Global canvas setup
│   ├── Animation/             # ✅ GSAP & animation
│   └── Mouse/                 # ✅ Mouse follower
└── docs/
    ├── architecture.md        # ✅ Complete documentation
    └── component-examples.md  # ✅ Usage examples
```

## Common Patterns

### Pattern 1: DOM + WebGL Enhancement
```tsx
// 1. Create DOM structure
<div ref={ref}>Content</div>

// 2. Add WebGL enhancement
<UseCanvas>
  <ScrollScene track={ref}>
    {/* 3D content */}
  </ScrollScene>
</UseCanvas>
```

### Pattern 2: Glass Container with 3D Background
```tsx
<section className="relative">
  {/* WebGL Background */}
  <UseCanvas>
    <LiquidGlassEffect />
  </UseCanvas>
  
  {/* Glass UI on top */}
  <GlassContainer className="relative z-10">
    Content
  </GlassContainer>
</section>
```

### Pattern 3: Scroll-Triggered Animation
```tsx
const ref = useRef()

useGSAPAnimation(ref, {
  scrollTrigger: {
    trigger: ref,
    scrub: true
  },
  timeline: (tl) => {
    tl.to(ref.current, { rotation: 360 })
  }
})
```

## Performance Guidelines

1. **Use `frameloop="demand"`** - Already configured
2. **Hide offscreen content** - Use `hideOffscreen={true}`
3. **Lazy load heavy assets** - Use React.lazy() and Suspense
4. **Optimize textures** - Use compressed formats
5. **Monitor performance** - Check with r3f-perf in dev

## Troubleshooting

### Issue: Components not syncing with scroll
**Solution:** Ensure `SmoothScrollbar` is mounted in layout

### Issue: Glass effects not visible
**Solution:** Check z-index ordering and backdrop-filter support

### Issue: Performance drops
**Solution:** 
- Reduce quality with `useCanvasStore.setQuality('low')`
- Use simpler glass presets
- Enable viewport culling

### Issue: Hydration errors
**Solution:** Use `'use client'` directive for WebGL components

## Next Steps

1. ✅ Components are ready to use
2. ✅ Glass theme is implemented
3. ✅ Scroll-rig is configured
4. 📦 Run `pnpm add vecn @14islands/lerp react-colorful postprocessing leva tweakpane`
5. 🚀 Start building!

## Support

- See `/docs/architecture.md` for detailed documentation
- See `/docs/component-examples.md` for more examples
- Check component source files for implementation details