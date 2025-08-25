'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'

type StartEndFunc = (self: any) => string | number

export interface ScrollTriggerConfig {
  trigger?: string | HTMLElement | null
  start?: string | number | StartEndFunc
  end?: string | number | StartEndFunc
  pin?: boolean | string | HTMLElement
  pinSpacing?: boolean
  pinType?: 'fixed' | 'transform'
  scrub?: boolean | number
  snap?: number | number[] | StartEndFunc | object
  animation?: gsap.core.Animation
  toggleClass?: string | object
  toggleActions?: string
  once?: boolean
  markers?: boolean
  id?: string
  onUpdate?: (self: any) => void
  onToggle?: (self: any) => void
  onEnter?: (self: any) => void
  onLeave?: (self: any) => void
  onEnterBack?: (self: any) => void
  onLeaveBack?: (self: any) => void
  onRefresh?: (self: any) => void
  onComplete?: (self: any) => void
  onReverseComplete?: (self: any) => void
  onStart?: (self: any) => void
  invalidateOnRefresh?: boolean
  refreshPriority?: number
  [key: string]: any
}

// Temporary stub - ScrollTrigger will be loaded dynamically
export function useScrollTrigger(
  config: ScrollTriggerConfig | (() => ScrollTriggerConfig | void),
  deps: React.DependencyList = []
) {
  const scrollTriggerRef = useRef<any>(null)

  useIsomorphicLayoutEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return

    // Dynamically import ScrollTrigger to avoid module-level errors
    const setupScrollTrigger = async () => {
      try {
        const { ScrollTrigger } = await import('gsap/dist/ScrollTrigger')
        
        // Get config
        const triggerConfig = typeof config === 'function' ? config() : config
        if (!triggerConfig) return

        // Register plugin
        gsap.registerPlugin(ScrollTrigger)

        // Create timeline if animation is provided
        let timeline: gsap.core.Timeline | null = null
        if (triggerConfig.animation) {
          timeline = gsap.timeline({
            scrollTrigger: triggerConfig as any,
          })
        } else {
          // Create standalone ScrollTrigger
          scrollTriggerRef.current = ScrollTrigger.create(triggerConfig as any)
        }

        // Store cleanup function
        return () => {
          if (timeline) {
            timeline.kill()
          }
          if (scrollTriggerRef.current) {
            scrollTriggerRef.current.kill()
            scrollTriggerRef.current = null
          }
        }
      } catch (error) {
        console.warn('ScrollTrigger not available:', error)
      }
    }

    let cleanup: (() => void) | undefined
    setupScrollTrigger().then(cleanupFn => {
      cleanup = cleanupFn
    })

    return () => {
      if (cleanup) cleanup()
    }
  }, deps)

  return scrollTriggerRef.current
}

// Batch helper for performance
export function useScrollTriggerBatch(
  targets: string | HTMLElement[],
  config: {
    interval?: number
    batchMax?: number
    onEnter?: (elements: HTMLElement[]) => void
    onLeave?: (elements: HTMLElement[]) => void
    onEnterBack?: (elements: HTMLElement[]) => void
    onLeaveBack?: (elements: HTMLElement[]) => void
    start?: string | number | StartEndFunc
    end?: string | number | StartEndFunc
    once?: boolean
  },
  deps: React.DependencyList = []
) {
  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined') return

    const setupBatch = async () => {
      try {
        const { ScrollTrigger } = await import('gsap/dist/ScrollTrigger')
        gsap.registerPlugin(ScrollTrigger)

        const batch = ScrollTrigger.batch(targets, {
          ...config,
          onEnter: config.onEnter as any,
          onLeave: config.onLeave as any,
          onEnterBack: config.onEnterBack as any,
          onLeaveBack: config.onLeaveBack as any,
        } as any)

        return () => {
          batch.forEach(trigger => trigger.kill())
        }
      } catch (error) {
        console.warn('ScrollTrigger batch not available:', error)
      }
    }

    let cleanup: (() => void) | undefined
    setupBatch().then(cleanupFn => {
      cleanup = cleanupFn
    })

    return () => {
      if (cleanup) cleanup()
    }
  }, deps)
}

// Helper for creating scrubbed animations
export function useScrubAnimation(
  trigger: string | HTMLElement | null,
  animation: () => gsap.core.Animation | gsap.core.Timeline,
  options: Partial<ScrollTriggerConfig> = {},
  deps: React.DependencyList = []
) {
  return useScrollTrigger(() => {
    const tl = animation()
    return {
      trigger,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
      ...options,
      animation: tl,
    }
  }, deps)
}

// Helper for reveal animations
export function useRevealAnimation(
  trigger: string | HTMLElement | null,
  animation: () => gsap.core.Animation | gsap.core.Timeline | null,
  options: Partial<ScrollTriggerConfig> = {},
  deps: React.DependencyList = []
) {
  return useScrollTrigger(() => {
    const tl = animation()
    if (!tl) return
    return {
      trigger,
      start: 'top 80%',
      once: true,
      ...options,
      animation: tl,
    }
  }, deps)
}