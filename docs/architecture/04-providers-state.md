# Providers & State Management

## Overview

This architecture uses a layered provider system to manage global state, animations, and user interactions. Each provider has a specific responsibility, and they work together to create a cohesive experience.

## Provider Hierarchy

```typescript
<RootProviders>
  <AnimationProvider>     // GSAP & Scroll
    <MouseProvider>       // Cursor effects
      <CanvasProvider>    // WebGL context
        <QualityProvider> // Performance settings
          <ThemeProvider> // Visual theme
            {children}
          </ThemeProvider>
        </QualityProvider>
      </CanvasProvider>
    </MouseProvider>
  </AnimationProvider>
</RootProviders>
```

## Core Providers

### 1. Animation Provider

Create `src/components/providers/AnimationProvider.tsx`:

```typescript
'use client'

import { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect'
import Tempus from '@studio-freight/tempus'
import { useScrollRig } from '@14islands/r3f-scroll-rig'

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText)
}

interface AnimationContextValue {
  // GSAP
  gsap: typeof gsap
  ScrollTrigger: typeof ScrollTrigger
  SplitText: typeof SplitText
  
  // Utilities
  registerAnimation: (id: string, animation: gsap.core.Timeline) => void
  unregisterAnimation: (id: string) => void
  getAnimation: (id: string) => gsap.core.Timeline | undefined
  
  // Scroll
  scrollTo: (target: string | number | Element, options?: any) => void
  refreshScrollTrigger: () => void
}

const AnimationContext = createContext<AnimationContextValue | null>(null)

export function AnimationProvider({ children }: { children: ReactNode }) {
  const animations = useRef(new Map<string, gsap.core.Timeline>())
  const rafId = useRef<string>()
  const { hasSmoothScrollbar } = useScrollRig()

  // Initialize GSAP settings
  useIsomorphicLayoutEffect(() => {
    // Configure GSAP
    gsap.config({
      autoSleep: 60,
      force3D: true,
      nullTargetWarn: false,
    })

    // Default timeline settings
    gsap.defaults({
      ease: 'power3.out',
      duration: 1,
    })

    // Set up ScrollTrigger
    ScrollTrigger.defaults({
      markers: false,
      toggleActions: 'play pause resume reset',
    })

    // Refresh on resize
    let resizeTimer: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        ScrollTrigger.refresh()
      }, 250)
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimer)
    }
  }, [])

  // Set up RAF with Tempus
  useEffect(() => {
    rafId.current = Tempus.add((time: number, deltaTime: number) => {
      // Update GSAP ticker
      gsap.ticker.tick(deltaTime * 0.001)
    }, 0)

    return () => {
      if (rafId.current) {
        Tempus.remove(rafId.current)
      }
    }
  }, [])

  // Animation registry
  const registerAnimation = (id: string, animation: gsap.core.Timeline) => {
    animations.current.set(id, animation)
  }

  const unregisterAnimation = (id: string) => {
    const animation = animations.current.get(id)
    if (animation) {
      animation.kill()
      animations.current.delete(id)
    }
  }

  const getAnimation = (id: string) => {
    return animations.current.get(id)
  }

  // Scroll utilities
  const scrollTo = (target: string | number | Element, options?: any) => {
    if (hasSmoothScrollbar) {
      // Use Lenis scroll
      const scrollRig = document.querySelector('[data-scroll-rig]')
      if (scrollRig) {
        // Implement Lenis scrollTo
      }
    } else {
      // Use native scroll
      gsap.to(window, {
        scrollTo: target,
        duration: 1,
        ease: 'power3.inOut',
        ...options,
      })
    }
  }

  const refreshScrollTrigger = () => {
    ScrollTrigger.refresh()
  }

  const value: AnimationContextValue = {
    gsap,
    ScrollTrigger,
    SplitText,
    registerAnimation,
    unregisterAnimation,
    getAnimation,
    scrollTo,
    refreshScrollTrigger,
  }

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  )
}

export function useAnimation() {
  const context = useContext(AnimationContext)
  if (!context) {
    throw new Error('useAnimation must be used within AnimationProvider')
  }
  return context
}
```

### 2. Mouse Provider

Create `src/components/providers/MouseProvider.tsx`:

```typescript
'use client'

import { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
import MouseFollower from 'mouse-follower'
import { gsap } from 'gsap'

interface MouseContextValue {
  cursor: MouseFollower | null
  
  // State management
  addState: (state: string) => void
  removeState: (state: string) => void
  toggleState: (state: string) => void
  
  // Content
  setText: (text: string) => void
  removeText: () => void
  setIcon: (icon: string) => void
  removeIcon: () => void
  setMedia: (media: string) => void
  removeMedia: () => void
  
  // Effects
  setStick: (element: Element) => void
  removeStick: () => void
  setSkewing: (amount: number) => void
  removeSkewing: () => void
  
  // Visibility
  show: () => void
  hide: () => void
}

const MouseContext = createContext<MouseContextValue | null>(null)

export function MouseProvider({ children }: { children: ReactNode }) {
  const cursorRef = useRef<MouseFollower | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Register GSAP with MouseFollower
    MouseFollower.registerGSAP(gsap)

    // Initialize cursor
    const cursor = new MouseFollower({
      container: document.body,
      className: 'mf-cursor',
      innerClassName: 'mf-cursor-inner',
      textClassName: 'mf-cursor-text',
      mediaClassName: 'mf-cursor-media',
      mediaBoxClassName: 'mf-cursor-media-box',
      
      visible: true,
      visibleOnState: false,
      speed: 0.55,
      ease: 'expo.out',
      overwrite: true,
      
      skewing: 0,
      skewingText: 2,
      skewingIcon: 2,
      skewingMedia: 2,
      skewingDelta: 0.001,
      skewingDeltaMax: 0.15,
      
      stickDelta: 0.15,
      showTimeout: 20,
      hideOnLeave: true,
      hideTimeout: 300,
      hideMediaTimeout: 300,
      
      stateDetection: {
        '-pointer': 'a, button',
        '-hidden': 'iframe',
        '-glass': '[data-cursor-glass]',
        '-drag': '[data-cursor-drag]',
      },
    })

    cursorRef.current = cursor

    // Add custom styles
    const style = document.createElement('style')
    style.textContent = `
      .mf-cursor {
        z-index: 9999;
      }
      
      .mf-cursor.-glass .mf-cursor-inner {
        backdrop-filter: blur(10px);
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .mf-cursor.-drag .mf-cursor-inner {
        scale: 1.5;
      }
      
      .mf-cursor.-drag .mf-cursor-inner::after {
        content: '';
        position: absolute;
        inset: 30%;
        border: 2px solid currentColor;
        border-radius: 50%;
        opacity: 0.5;
      }
    `
    document.head.appendChild(style)

    return () => {
      cursor.destroy()
      style.remove()
    }
  }, [])

  const value: MouseContextValue = {
    cursor: cursorRef.current,
    
    // State management
    addState: (state) => cursorRef.current?.addState(state),
    removeState: (state) => cursorRef.current?.removeState(state),
    toggleState: (state) => {
      const cursor = cursorRef.current
      if (!cursor) return
      
      const hasState = cursor.el?.classList.contains(state)
      if (hasState) {
        cursor.removeState(state)
      } else {
        cursor.addState(state)
      }
    },
    
    // Content
    setText: (text) => cursorRef.current?.setText(text),
    removeText: () => cursorRef.current?.removeText(),
    setIcon: (icon) => cursorRef.current?.setIcon(icon),
    removeIcon: () => cursorRef.current?.removeIcon(),
    setMedia: (media) => cursorRef.current?.setImg(media),
    removeMedia: () => cursorRef.current?.removeImg(),
    
    // Effects
    setStick: (element) => cursorRef.current?.setStick(element),
    removeStick: () => cursorRef.current?.removeStick(),
    setSkewing: (amount) => cursorRef.current?.setSkewing(amount),
    removeSkewing: () => cursorRef.current?.removeSkewing(),
    
    // Visibility
    show: () => cursorRef.current?.show(),
    hide: () => cursorRef.current?.hide(),
  }

  return (
    <MouseContext.Provider value={value}>
      {children}
    </MouseContext.Provider>
  )
}

export function useMouse() {
  const context = useContext(MouseContext)
  if (!context) {
    throw new Error('useMouse must be used within MouseProvider')
  }
  return context
}
```

### 3. Quality Provider

Create `src/components/providers/QualityProvider.tsx`:

```typescript
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useCanvasStore } from '@/lib/stores/canvas-store'

interface QualityContextValue {
  quality: 'low' | 'medium' | 'high'
  setQuality: (quality: 'low' | 'medium' | 'high') => void
  autoQuality: boolean
  setAutoQuality: (auto: boolean) => void
  
  // Device info
  isMobile: boolean
  isTablet: boolean
  hasTouch: boolean
  gpuTier: number
}

const QualityContext = createContext<QualityContextValue | null>(null)

export function QualityProvider({ children }: { children: ReactNode }) {
  const [quality, setQualityState] = useState<'low' | 'medium' | 'high'>('medium')
  const [autoQuality, setAutoQuality] = useState(true)
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    hasTouch: false,
    gpuTier: 2,
  })
  
  const setCanvasQuality = useCanvasStore((s) => s.setQuality)

  // Detect device capabilities
  useEffect(() => {
    const checkDevice = async () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      const isTablet = /iPad|Android/i.test(navigator.userAgent) && !isMobile
      const hasTouch = 'ontouchstart' in window
      
      // GPU detection (simplified)
      let gpuTier = 2
      if (isMobile) gpuTier = 1
      
      // Check WebGL capabilities
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          console.log('GPU:', renderer)
          
          // Simple GPU tier detection
          if (renderer.includes('Intel')) gpuTier = 1
          else if (renderer.includes('NVIDIA') || renderer.includes('AMD')) gpuTier = 3
        }
      }
      
      setDeviceInfo({ isMobile, isTablet, hasTouch, gpuTier })
      
      // Auto-set quality based on device
      if (autoQuality) {
        if (isMobile || gpuTier === 1) {
          setQualityState('low')
        } else if (isTablet || gpuTier === 2) {
          setQualityState('medium')
        } else {
          setQualityState('high')
        }
      }
    }
    
    checkDevice()
  }, [autoQuality])

  // Sync with canvas store
  useEffect(() => {
    setCanvasQuality(quality)
  }, [quality, setCanvasQuality])

  const setQuality = (newQuality: 'low' | 'medium' | 'high') => {
    setQualityState(newQuality)
    setAutoQuality(false) // Disable auto when manually set
  }

  const value: QualityContextValue = {
    quality,
    setQuality,
    autoQuality,
    setAutoQuality,
    ...deviceInfo,
  }

  return (
    <QualityContext.Provider value={value}>
      {children}
    </QualityContext.Provider>
  )
}

export function useQuality() {
  const context = useContext(QualityContext)
  if (!context) {
    throw new Error('useQuality must be used within QualityProvider')
  }
  return context
}
```

## State Management with Zustand

### Global App Store

Create `src/lib/stores/app-store.ts`:

```typescript
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface Location {
  id: string
  name: string
  coordinates: [number, number]
  description?: string
}

interface AppState {
  // Navigation
  isMenuOpen: boolean
  toggleMenu: () => void
  closeMenu: () => void
  
  // Loading
  isLoading: boolean
  loadingProgress: number
  setLoading: (loading: boolean, progress?: number) => void
  
  // Locations
  locations: Location[]
  selectedLocation: Location | null
  setLocations: (locations: Location[]) => void
  selectLocation: (location: Location | null) => void
  
  // Preferences
  preferences: {
    reducedMotion: boolean
    highContrast: boolean
    language: string
  }
  updatePreferences: (prefs: Partial<AppState['preferences']>) => void
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      immer((set) => ({
        // State
        isMenuOpen: false,
        isLoading: false,
        loadingProgress: 0,
        locations: [],
        selectedLocation: null,
        preferences: {
          reducedMotion: false,
          highContrast: false,
          language: 'en',
        },

        // Actions
        toggleMenu: () =>
          set((state) => {
            state.isMenuOpen = !state.isMenuOpen
          }),
          
        closeMenu: () =>
          set((state) => {
            state.isMenuOpen = false
          }),
          
        setLoading: (loading, progress = 0) =>
          set((state) => {
            state.isLoading = loading
            state.loadingProgress = progress
          }),
          
        setLocations: (locations) =>
          set((state) => {
            state.locations = locations
          }),
          
        selectLocation: (location) =>
          set((state) => {
            state.selectedLocation = location
          }),
          
        updatePreferences: (prefs) =>
          set((state) => {
            Object.assign(state.preferences, prefs)
          }),
      })),
      {
        name: 'app-storage',
        partialize: (state) => ({
          preferences: state.preferences,
        }),
      }
    )
  )
)
```

### WebGL Scene Store

Create `src/lib/stores/scene-store.ts`:

```typescript
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import * as THREE from 'three'

interface SceneState {
  // Camera
  cameraPosition: THREE.Vector3
  cameraTarget: THREE.Vector3
  setCameraPosition: (position: THREE.Vector3) => void
  setCameraTarget: (target: THREE.Vector3) => void
  
  // Background
  backgroundColor: string
  backgroundIntensity: number
  setBackground: (color: string, intensity?: number) => void
  
  // Effects
  postProcessing: {
    bloom: boolean
    chromatic: boolean
    vignette: boolean
  }
  toggleEffect: (effect: keyof SceneState['postProcessing']) => void
  
  // Time
  elapsed: number
  delta: number
  updateTime: (elapsed: number, delta: number) => void
}

export const useSceneStore = create<SceneState>()(
  subscribeWithSelector((set) => ({
    // State
    cameraPosition: new THREE.Vector3(0, 0, 5),
    cameraTarget: new THREE.Vector3(0, 0, 0),
    backgroundColor: '#000000',
    backgroundIntensity: 1,
    postProcessing: {
      bloom: true,
      chromatic: false,
      vignette: true,
    },
    elapsed: 0,
    delta: 0,

    // Actions
    setCameraPosition: (position) => set({ cameraPosition: position }),
    setCameraTarget: (target) => set({ cameraTarget: target }),
    
    setBackground: (color, intensity = 1) =>
      set({
        backgroundColor: color,
        backgroundIntensity: intensity,
      }),
      
    toggleEffect: (effect) =>
      set((state) => ({
        postProcessing: {
          ...state.postProcessing,
          [effect]: !state.postProcessing[effect],
        },
      })),
      
    updateTime: (elapsed, delta) => set({ elapsed, delta }),
  }))
)
```

## Usage Examples

### Using Multiple Providers

```typescript
// In a component
import { useAnimation } from '@/components/providers/AnimationProvider'
import { useMouse } from '@/components/providers/MouseProvider'
import { useQuality } from '@/components/providers/QualityProvider'

export function InteractiveComponent() {
  const { gsap, ScrollTrigger } = useAnimation()
  const { setText, removeText } = useMouse()
  const { quality } = useQuality()
  
  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '.my-element',
        start: 'top center',
        end: 'bottom center',
        scrub: 1,
      },
    })
    
    tl.to('.my-element', {
      y: quality === 'high' ? 100 : 50,
      rotation: quality === 'high' ? 360 : 180,
    })
    
    return () => {
      tl.kill()
    }
  }, [quality])
  
  return (
    <div
      className="my-element"
      onMouseEnter={() => setText('Hover!')}
      onMouseLeave={() => removeText()}
    >
      Interactive Content
    </div>
  )
}
```

### Subscribing to Store Changes

```typescript
// React to specific store changes
useEffect(() => {
  const unsubscribe = useAppStore.subscribe(
    (state) => state.selectedLocation,
    (location) => {
      if (location) {
        console.log('Location selected:', location)
        // Animate camera to location
      }
    }
  )
  
  return unsubscribe
}, [])
```

## Best Practices

1. **Provider Order Matters**: Place providers in the correct hierarchy
2. **Lazy Initialize**: Only create expensive objects when needed
3. **Clean Up**: Always clean up animations and event listeners
4. **Type Safety**: Use TypeScript for all context values
5. **Performance**: Use selectors to avoid unnecessary re-renders
6. **Persistence**: Only persist necessary state
7. **DevTools**: Use Zustand devtools in development