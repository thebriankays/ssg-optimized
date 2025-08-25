'use client'

import { useEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { gsap } from 'gsap'
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect'

type StartEndFunc = (self: ScrollTrigger) => string | number

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
  onUpdate?: (self: ScrollTrigger) => void
  onToggle?: (self: ScrollTrigger) => void
  onEnter?: (self: ScrollTrigger) => void
  onLeave?: (self: ScrollTrigger) => void
  onEnterBack?: (self: ScrollTrigger) => void
  onLeaveBack?: (self: ScrollTrigger) => void
  onRefresh?: (self: ScrollTrigger) => void
  onComplete?: (self: ScrollTrigger) => void
  onReverseComplete?: (self: ScrollTrigger) => void
  onStart?: (self: ScrollTrigger) => void
  invalidateOnRefresh?: boolean
  refreshPriority?: number
  [key: string]: any
}

export function useScrollTrigger(
  config: ScrollTriggerConfig | (() => ScrollTriggerConfig | void),
  deps: React.DependencyList = []
) {
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null)

  useIsomorphicLayoutEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return

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

    // Cleanup function
    return () => {
      if (timeline) {
        timeline.kill()
      }
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill()
        scrollTriggerRef.current = null
      }
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

    gsap.registerPlugin(ScrollTrigger)

    const batch = ScrollTrigger.batch(targets, {
      ...config,
      // Removed opacity: 0 to prevent content from disappearing
      onEnter: config.onEnter as any,
      onLeave: config.onLeave as any,
      onEnterBack: config.onEnterBack as any,
      onLeaveBack: config.onLeaveBack as any,
    } as any)

    return () => {
      batch.forEach(trigger => trigger.kill())
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