'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { gsap } from 'gsap'

interface AnimationContextValue {
  gsap: typeof gsap
  ScrollTrigger: any
  SplitText: any
  pluginsLoaded: boolean
  registerAnimation: (id: string, animation: any) => void
  unregisterAnimation: (id: string) => void
  getAnimation: (id: string) => any
  scrollTo: (target: any, options?: any) => void
  refreshScrollTrigger: () => void
}

const AnimationContext = createContext<AnimationContextValue | null>(null)

export function AnimationProvider({ children }: { children: ReactNode }) {
  // Basic GSAP configuration without plugins for now
  React.useEffect(() => {
    gsap.config({
      autoSleep: 60,
      force3D: true,
      nullTargetWarn: false,
    })

    gsap.defaults({
      ease: 'power3.out',
      duration: 1,
    })
  }, [])

  const value: AnimationContextValue = {
    gsap,
    ScrollTrigger: null, // Disabled for now
    SplitText: null,     // Disabled for now
    pluginsLoaded: false,
    registerAnimation: () => {},
    unregisterAnimation: () => {},
    getAnimation: () => undefined,
    scrollTo: (target, options = {}) => {
      if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth', ...options })
      } else if (typeof target === 'string') {
        const el = document.querySelector(target)
        el?.scrollIntoView({ behavior: 'smooth', ...options })
      } else if (target instanceof Element) {
        target.scrollIntoView({ behavior: 'smooth', ...options })
      }
    },
    refreshScrollTrigger: () => {
      // No-op for now
    },
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