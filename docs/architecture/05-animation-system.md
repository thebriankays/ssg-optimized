# Animation System

## Overview

The animation system combines GSAP, ScrollTrigger, and React Three Fiber's animation loop to create smooth, performant animations that work seamlessly between DOM and WebGL content.

## Core Animation Patterns

### 1. Scroll-Driven Animations

#### Basic ScrollTrigger Setup

```typescript
import { useGSAPAnimation } from '@/hooks/animation/useGSAPAnimation'
import { useRef } from 'react'

export function ScrollAnimatedSection() {
  const sectionRef = useRef<HTMLElement>(null!)
  const contentRef = useRef<HTMLDivElement>(null!)
  
  useGSAPAnimation(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        markers: false, // Set to true for debugging
      },
    })
    
    // Parallax effect
    tl.to(contentRef.current, {
      y: -100,
      ease: 'none',
    })
    
    // Text reveal
    const chars = SplitText.create('.headline', { type: 'chars' })
    tl.from(chars.chars, {
      opacity: 0,
      y: 50,
      rotationX: -90,
      stagger: 0.02,
    }, '<')
    
    return () => {
      chars.revert()
    }
  }, [])
  
  return (
    <section ref={sectionRef} className="scroll-section">
      <div ref={contentRef} className="content">
        <h2 className="headline">Animated Headline</h2>
      </div>
    </section>
  )
}
```

#### Advanced Scroll-WebGL Sync

```typescript
import { useFrame } from '@react-three/fiber'
import { useScrollRig } from '@14islands/r3f-scroll-rig'
import { useRef } from 'react'
import { Group } from 'three'

export function ScrollSyncedMesh() {
  const groupRef = useRef<Group>(null!)
  const { scroll } = useScrollRig()
  
  useFrame((state, delta) => {
    if (!groupRef.current) return
    
    // Rotate based on scroll progress
    groupRef.current.rotation.y = scroll.progress * Math.PI * 2
    
    // Scale based on visibility
    const scale = THREE.MathUtils.mapLinear(
      scroll.visibility,
      0, 1,  // input range
      0.5, 1 // output range
    )
    groupRef.current.scale.setScalar(scale)
    
    // Fade based on viewport position
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.opacity = scroll.visibility
      }
    })
  })
  
  return (
    <group ref={groupRef}>
      <mesh>
        <boxGeometry />
        <meshStandardMaterial transparent />
      </mesh>
    </group>
  )
}
```

### 2. Interactive Animations

#### Hover Effects

```typescript
import { useSpring, animated } from '@react-spring/three'
import { useState } from 'react'

export function HoverMesh() {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  
  const { scale, rotation } = useSpring({
    scale: clicked ? 1.5 : hovered ? 1.2 : 1,
    rotation: clicked ? Math.PI : 0,
    config: {
      mass: 1,
      tension: 170,
      friction: 26,
    },
  })
  
  return (
    <animated.mesh
      scale={scale}
      rotation-y={rotation}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => setClicked(!clicked)}
    >
      <boxGeometry />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </animated.mesh>
  )
}
```

#### Gesture-Based Animations

```typescript
import { useGesture } from '@use-gesture/react'
import { useSpring, animated } from '@react-spring/three'

export function DraggableMesh() {
  const [spring, api] = useSpring(() => ({
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  }))
  
  const bind = useGesture({
    onDrag: ({ offset: [x, y] }) => {
      api.start({
        position: [x / 100, -y / 100, 0],
      })
    },
    onDragEnd: () => {
      api.start({
        position: [0, 0, 0],
      })
    },
    onHover: ({ hovering }) => {
      api.start({
        rotation: hovering ? [0, Math.PI / 4, 0] : [0, 0, 0],
      })
    },
  })
  
  return (
    <animated.mesh {...bind()} {...spring}>
      <boxGeometry />
      <meshStandardMaterial />
    </animated.mesh>
  )
}
```

### 3. Timeline-Based Animations

#### Complex Scene Animation

```typescript
import { useTimeline } from '@/hooks/animation/useTimeline'
import { useEffect, useRef } from 'react'

export function CinematicScene() {
  const scene = useRef<THREE.Group>(null!)
  const camera = useRef<THREE.PerspectiveCamera>(null!)
  const timeline = useTimeline('cinematic-scene')
  
  useEffect(() => {
    if (!scene.current || !camera.current) return
    
    const tl = timeline.create()
    
    // Act 1: Camera approach
    tl.to(camera.current.position, {
      z: 10,
      duration: 3,
      ease: 'power2.inOut',
    })
    .to(camera.current.rotation, {
      y: Math.PI / 4,
      duration: 2,
    }, '-=1')
    
    // Act 2: Reveal objects
    const objects = scene.current.children
    tl.from(objects, {
      scale: 0,
      y: -5,
      stagger: 0.1,
      duration: 1,
      ease: 'back.out(1.7)',
    })
    
    // Act 3: Final position
    tl.to(camera.current.position, {
      x: 5,
      y: 5,
      z: 5,
      duration: 2,
      onUpdate: () => {
        camera.current.lookAt(0, 0, 0)
      },
    })
    
    return () => {
      tl.kill()
    }
  }, [timeline])
  
  return (
    <group ref={scene}>
      <PerspectiveCamera ref={camera} makeDefault />
      {/* Scene objects */}
    </group>
  )
}
```

## Custom Hooks

### useGSAPAnimation

Create `src/hooks/animation/useGSAPAnimation.ts`:

```typescript
import { useRef, useCallback } from 'react'
import { useIsomorphicLayoutEffect } from '../useIsomorphicLayoutEffect'
import { gsap } from 'gsap'

export function useGSAPAnimation(
  callback: () => void | (() => void),
  deps: React.DependencyList = []
) {
  const cleanupRef = useRef<(() => void) | void>()
  
  useIsomorphicLayoutEffect(() => {
    // Create GSAP context
    const ctx = gsap.context(() => {
      cleanupRef.current = callback()
    })
    
    return () => {
      // Clean up function from callback
      if (typeof cleanupRef.current === 'function') {
        cleanupRef.current()
      }
      // Revert GSAP context
      ctx.revert()
    }
  }, deps)
}
```

### useScrollAnimation

Create `src/hooks/animation/useScrollAnimation.ts`:

```typescript
import { useRef, MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScrollRig } from '@14islands/r3f-scroll-rig'

interface ScrollAnimationOptions {
  onScroll?: (progress: number, velocity: number) => void
  onEnter?: () => void
  onLeave?: () => void
  onProgress?: (progress: number) => void
}

export function useScrollAnimation(
  ref: MutableRefObject<THREE.Object3D>,
  options: ScrollAnimationOptions = {}
) {
  const { scroll } = useScrollRig()
  const wasInView = useRef(false)
  
  useFrame(() => {
    if (!ref.current) return
    
    const { inViewport, progress, velocity } = scroll
    
    // Handle enter/leave
    if (inViewport && !wasInView.current) {
      options.onEnter?.()
      wasInView.current = true
    } else if (!inViewport && wasInView.current) {
      options.onLeave?.()
      wasInView.current = false
    }
    
    // Handle scroll
    if (inViewport) {
      options.onScroll?.(progress, velocity)
      options.onProgress?.(progress)
    }
  })
}
```

### useTimeline

Create `src/hooks/animation/useTimeline.ts`:

```typescript
import { useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { useAnimation } from '@/components/providers/AnimationProvider'

export function useTimeline(id?: string) {
  const timelineRef = useRef<gsap.core.Timeline>()
  const { registerAnimation, unregisterAnimation } = useAnimation()
  
  const create = useCallback((options?: gsap.TimelineVars) => {
    // Kill existing timeline
    if (timelineRef.current) {
      timelineRef.current.kill()
    }
    
    // Create new timeline
    const tl = gsap.timeline(options)
    timelineRef.current = tl
    
    // Register if ID provided
    if (id) {
      registerAnimation(id, tl)
    }
    
    return tl
  }, [id, registerAnimation])
  
  const play = useCallback(() => {
    timelineRef.current?.play()
  }, [])
  
  const pause = useCallback(() => {
    timelineRef.current?.pause()
  }, [])
  
  const reverse = useCallback(() => {
    timelineRef.current?.reverse()
  }, [])
  
  const seek = useCallback((time: number) => {
    timelineRef.current?.seek(time)
  }, [])
  
  const progress = useCallback((value?: number) => {
    if (value !== undefined) {
      timelineRef.current?.progress(value)
    }
    return timelineRef.current?.progress() || 0
  }, [])
  
  return {
    timeline: timelineRef.current,
    create,
    play,
    pause,
    reverse,
    seek,
    progress,
  }
}
```

## Performance Patterns

### 1. RAF Optimization

```typescript
import { useRafLoop } from '@/hooks/animation/useRafLoop'
import { useRef } from 'react'

export function OptimizedAnimation() {
  const elementRef = useRef<HTMLDivElement>(null!)
  const progressRef = useRef(0)
  
  useRafLoop((time, delta) => {
    // Update only what's needed
    progressRef.current += delta * 0.001
    
    // Apply transforms directly
    if (elementRef.current) {
      elementRef.current.style.transform = 
        `translateY(${Math.sin(progressRef.current) * 100}px)`
    }
  })
  
  return <div ref={elementRef}>Animated Element</div>
}
```

### 2. Batch Updates

```typescript
import { useBatchedUpdates } from '@/hooks/animation/useBatchedUpdates'

export function BatchedAnimations() {
  const batch = useBatchedUpdates()
  
  const animateMultiple = () => {
    batch(() => {
      // All DOM updates happen in one frame
      gsap.to('.element-1', { x: 100 })
      gsap.to('.element-2', { y: 100 })
      gsap.to('.element-3', { rotation: 360 })
    })
  }
  
  return (
    <button onClick={animateMultiple}>
      Animate All
    </button>
  )
}
```

### 3. Throttled Animations

```typescript
import { useThrottle } from '@/hooks/useThrottle'
import { useFrame } from '@react-three/fiber'

export function ThrottledMesh() {
  const [mouseX, mouseY] = useThrottle(useMouse(), 16) // 60fps
  const meshRef = useRef<THREE.Mesh>(null!)
  
  useFrame(() => {
    if (!meshRef.current) return
    
    // Smooth follow mouse
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      mouseX * 0.01,
      0.1
    )
    meshRef.current.position.y = THREE.MathUtils.lerp(
      meshRef.current.position.y,
      mouseY * 0.01,
      0.1
    )
  })
  
  return (
    <mesh ref={meshRef}>
      <sphereGeometry />
      <meshStandardMaterial />
    </mesh>
  )
}
```

## Animation Presets

### Entrance Animations

```typescript
export const entrancePresets = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1, duration: 1 },
  },
  
  slideUp: {
    from: { y: 100, opacity: 0 },
    to: { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
  },
  
  scaleIn: {
    from: { scale: 0, opacity: 0 },
    to: { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
  },
  
  rotateIn: {
    from: { rotation: -180, opacity: 0 },
    to: { rotation: 0, opacity: 1, duration: 1, ease: 'power3.out' },
  },
}

// Usage
gsap.fromTo('.element', entrancePresets.fadeIn.from, entrancePresets.fadeIn.to)
```

### Scroll Presets

```typescript
export const scrollPresets = {
  parallax: (speed = 0.5) => ({
    scrollTrigger: {
      scrub: true,
    },
    y: (i, el) => -el.offsetHeight * speed,
    ease: 'none',
  }),
  
  reveal: {
    scrollTrigger: {
      toggleActions: 'play none none reverse',
    },
    from: { y: 100, opacity: 0 },
    duration: 1,
    stagger: 0.1,
  },
  
  pin: {
    scrollTrigger: {
      pin: true,
      start: 'top top',
      end: '+=100%',
    },
  },
}
```

## Integration with CMS

### Animation Block Schema

```typescript
// In Payload block config
export const AnimatedBlock = {
  slug: 'animated-block',
  fields: [
    {
      name: 'animation',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Fade In', value: 'fadeIn' },
            { label: 'Slide Up', value: 'slideUp' },
            { label: 'Scale In', value: 'scaleIn' },
            { label: 'Parallax', value: 'parallax' },
          ],
        },
        {
          name: 'duration',
          type: 'number',
          defaultValue: 1,
        },
        {
          name: 'delay',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'stagger',
          type: 'number',
          defaultValue: 0.1,
        },
      ],
    },
  ],
}
```

### Dynamic Animation Component

```typescript
export function AnimatedBlockComponent({ animation, children }) {
  const ref = useRef<HTMLDivElement>(null!)
  
  useGSAPAnimation(() => {
    const preset = animationPresets[animation.type]
    if (!preset) return
    
    gsap.from(ref.current.children, {
      ...preset,
      duration: animation.duration,
      delay: animation.delay,
      stagger: animation.stagger,
    })
  }, [animation])
  
  return (
    <div ref={ref} className="animated-block">
      {children}
    </div>
  )
}
```

## Best Practices

1. **Use RAF Wisely**: Only animate what's visible
2. **Batch Updates**: Group DOM changes
3. **Clean Up**: Always kill animations on unmount
4. **Optimize Selectors**: Cache DOM queries
5. **GPU Acceleration**: Use transform and opacity
6. **Reduced Motion**: Respect user preferences
7. **Performance Budget**: Limit concurrent animations