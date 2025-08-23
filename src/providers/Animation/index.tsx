'use client'

import { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect'
import Tempus from 'tempus'
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
  const rafCleanup = useRef<(() => void) | null>(null)
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
    const cleanup = Tempus.add(() => {
      // Update GSAP ticker
      gsap.ticker.tick()
    }, { priority: 0 })

    rafCleanup.current = cleanup || null

    return () => {
      if (rafCleanup.current) {
        rafCleanup.current()
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