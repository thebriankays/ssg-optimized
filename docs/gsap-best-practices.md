# GSAP Animation Best Practices

## Core Principles

All GSAP animations in this project MUST use the `useGSAPAnimation` hook for proper cleanup and React lifecycle management.

## The useGSAPAnimation Hook

Located at `/src/hooks/useGSAPAnimation.ts`, this hook ensures:
- Proper cleanup of animations on unmount
- GSAP context management for scoped selectors
- Memory leak prevention
- React lifecycle compatibility

## Usage Pattern

### ✅ CORRECT Pattern

```tsx
import { useGSAPAnimation } from '@/hooks/useGSAPAnimation'
import { gsap } from 'gsap'

function MyComponent() {
  const ref = useRef<HTMLDivElement>(null)
  
  useGSAPAnimation(() => {
    if (!ref.current) return
    
    // Create your GSAP animations
    const tl = gsap.timeline()
    tl.to(ref.current, {
      x: 100,
      duration: 1,
      ease: 'power2.out'
    })
    
    // IMPORTANT: Return cleanup function
    return () => {
      tl.kill()
    }
  }, [dependencies]) // Dependencies array
}
```

### ❌ INCORRECT Patterns to Avoid

```tsx
// DON'T: Use useEffect directly
useEffect(() => {
  gsap.to(ref.current, { x: 100 }) // Will cause memory leaks
}, [])

// DON'T: Use useLayoutEffect without context
useLayoutEffect(() => {
  const tl = gsap.timeline()
  // Missing cleanup
}, [])

// DON'T: Call GSAP outside of hooks
gsap.to(ref.current, { x: 100 }) // Will cause SSR issues
```

## Common Animation Patterns

### 1. Hover Effects

```tsx
useGSAPAnimation(() => {
  if (!buttonRef.current) return
  
  const button = buttonRef.current
  let hoverTween: gsap.core.Tween | null = null
  
  const handleMouseEnter = () => {
    hoverTween = gsap.to(button, {
      scale: 1.1,
      duration: 0.3,
      ease: 'power2.out',
    })
  }
  
  const handleMouseLeave = () => {
    hoverTween = gsap.to(button, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
    })
  }
  
  button.addEventListener('mouseenter', handleMouseEnter)
  button.addEventListener('mouseleave', handleMouseLeave)
  
  return () => {
    button.removeEventListener('mouseenter', handleMouseEnter)
    button.removeEventListener('mouseleave', handleMouseLeave)
    hoverTween?.kill()
  }
}, [])
```

### 2. Scroll-Triggered Animations

```tsx
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

useGSAPAnimation(() => {
  if (!sectionRef.current) return
  
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: sectionRef.current,
      start: 'top center',
      end: 'bottom center',
      scrub: 1,
      markers: false, // Set to true for debugging
    }
  })
  
  tl.to(sectionRef.current, {
    opacity: 1,
    y: 0,
    duration: 1
  })
  
  return () => {
    tl.kill()
    // ScrollTrigger instances are killed automatically with timeline
  }
}, [])
```

### 3. Looped Animations

```tsx
useGSAPAnimation(() => {
  if (!elementRef.current) return
  
  const tl = gsap.timeline({ repeat: -1, yoyo: true })
  
  tl.to(elementRef.current, {
    x: 100,
    duration: 2,
    ease: 'sine.inOut'
  })
  .to(elementRef.current, {
    y: 50,
    duration: 1,
    ease: 'power2.inOut'
  })
  
  return () => {
    tl.kill()
  }
}, [])
```

### 4. Responsive Animations

```tsx
useGSAPAnimation(() => {
  if (!containerRef.current) return
  
  const mm = gsap.matchMedia()
  
  mm.add("(min-width: 768px)", () => {
    // Desktop animations
    gsap.to(containerRef.current, {
      x: 200,
      duration: 1
    })
    
    return () => {
      // Cleanup for this breakpoint
    }
  })
  
  mm.add("(max-width: 767px)", () => {
    // Mobile animations
    gsap.to(containerRef.current, {
      x: 100,
      duration: 1
    })
  })
  
  return () => {
    mm.revert() // Kills all animations and reverts
  }
}, [])
```

### 5. SplitText Animations

```tsx
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

useGSAPAnimation(() => {
  if (!headingRef.current) return
  
  const split = new SplitText(headingRef.current, {
    type: 'words,chars',
    linesClass: 'split-line'
  })
  
  const tl = gsap.timeline()
  tl.from(split.chars, {
    opacity: 0,
    y: 50,
    rotateX: -90,
    stagger: 0.02,
    duration: 1,
    ease: 'power4.out'
  })
  
  return () => {
    tl.kill()
    split.revert() // Important: revert SplitText
  }
}, [])
```

## Three.js/R3F Integration

When using GSAP with React Three Fiber components, prefer `useFrame` for continuous animations but use GSAP for specific tweens:

```tsx
// For continuous animations, use useFrame
useFrame((state, delta) => {
  meshRef.current.rotation.y += delta * 0.5
})

// For specific tweens or complex timelines, use GSAP
useGSAPAnimation(() => {
  if (!meshRef.current) return
  
  const tl = gsap.timeline()
  tl.to(meshRef.current.position, {
    x: 5,
    y: 2,
    z: -3,
    duration: 2,
    ease: 'power3.inOut'
  })
  .to(meshRef.current.rotation, {
    y: Math.PI * 2,
    duration: 1
  }, '-=1')
  
  return () => {
    tl.kill()
  }
}, [])
```

## Performance Tips

1. **Always kill animations on cleanup**
   ```tsx
   return () => {
     tl.kill()
     ScrollTrigger.getAll().forEach(st => st.kill())
   }
   ```

2. **Use `will-change` CSS property sparingly**
   ```tsx
   useGSAPAnimation(() => {
     // Add before animation
     element.style.willChange = 'transform, opacity'
     
     // Animate...
     
     return () => {
       // Remove after animation
       element.style.willChange = 'auto'
     }
   })
   ```

3. **Batch DOM reads/writes**
   ```tsx
   useGSAPAnimation(() => {
     const elements = gsap.utils.toArray('.animate-me')
     
     // Batch animations
     gsap.to(elements, {
       y: 100,
       stagger: 0.1,
       duration: 1
     })
   })
   ```

4. **Use transforms over position properties**
   ```tsx
   // Good: Uses GPU acceleration
   gsap.to(element, { x: 100, y: 50 })
   
   // Bad: Triggers layout recalculation
   gsap.to(element, { left: 100, top: 50 })
   ```

## Debugging

### Enable GSAP DevTools

```tsx
// In development only
if (process.env.NODE_ENV === 'development') {
  gsap.registerPlugin(GSDevTools)
  GSDevTools.create()
}
```

### ScrollTrigger Markers

```tsx
scrollTrigger: {
  trigger: element,
  markers: process.env.NODE_ENV === 'development',
  // markers: { startColor: "green", endColor: "red" }
}
```

### Debug Cleanup

```tsx
useGSAPAnimation(() => {
  console.log('Animation starting')
  
  // Your animation code...
  
  return () => {
    console.log('Animation cleanup')
    // Cleanup code...
  }
}, [])
```

## Common Gotchas

1. **SSR Issues**: Always check for element existence
   ```tsx
   if (!ref.current) return
   ```

2. **Stale Closures**: Use refs for values that change
   ```tsx
   const valueRef = useRef(value)
   valueRef.current = value
   ```

3. **Conflicting Animations**: Kill previous animations
   ```tsx
   tween?.kill()
   tween = gsap.to(...)
   ```

4. **Memory Leaks**: Always return cleanup function
   ```tsx
   return () => {
     tl.kill()
     observer.disconnect()
     split.revert()
   }
   ```

5. **Performance**: Use `force3D: true` for transform animations
   ```tsx
   gsap.to(element, {
     x: 100,
     force3D: true // Forces GPU acceleration
   })
   ```

## Required Imports

Always import GSAP plugins at the component level:

```tsx
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useGSAPAnimation } from '@/hooks/useGSAPAnimation'

// Register plugins once
gsap.registerPlugin(ScrollTrigger, SplitText)
```

## Component Template

```tsx
'use client'

import { useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAPAnimation } from '@/hooks/useGSAPAnimation'

gsap.registerPlugin(ScrollTrigger)

export function AnimatedComponent() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useGSAPAnimation(() => {
    if (!containerRef.current) return
    
    const ctx = gsap.context(() => {
      // All GSAP animations here
      gsap.to('.box', { x: 100 })
      
      gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top center',
          end: 'bottom center',
          scrub: true
        }
      })
      .to('.element', { y: 100 })
    }, containerRef) // Scope to container
    
    return () => {
      ctx.revert() // Cleanup everything
    }
  }, [])
  
  return (
    <div ref={containerRef}>
      <div className="box">Animate me</div>
      <div className="element">Scroll me</div>
    </div>
  )
}
```

This pattern ensures all animations are properly scoped, cleaned up, and compatible with React's lifecycle.