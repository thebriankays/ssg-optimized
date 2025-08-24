'use client'

import { useEffect, useRef, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { PageTransition } from './PageTransition'
import { useTransitionStore } from '@/lib/stores/transition-store'

// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function PageTransitionManager() {
  const router = useRouter()
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)
  const { isTransitioning, direction, startTransition, endTransition } = useTransitionStore()
  
  const isAnimatingRef = useRef(false)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  // Handle page enter animation when pathname changes
  useEffect(() => {
    if (isAnimatingRef.current) return

    // Skip animations for now - just ensure content is visible
    gsap.set('#page-content', { 
      opacity: 1, 
      y: 0, 
      pointerEvents: 'auto' 
    })

    // Refresh ScrollTrigger and resume scroll
    ScrollTrigger.refresh(true)
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
    
    // Just refresh ScrollTrigger and resume scroll
    ScrollTrigger.refresh(true)
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''

  }, [pathname])

  // Navigation handler for transition links
  const handleTransitionNavigation = useCallback((href: string) => {
    if (isAnimatingRef.current) return

    isAnimatingRef.current = true
    
    // Pause scroll
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    // Kill any existing timeline
    timelineRef.current?.kill()

    // Skip animation for now - just disable pointer events
    gsap.set('#page-content', { pointerEvents: 'none' })

    // Start WebGL transition out
    startTransition('out', href, () => {
      router.push(href)
      endTransition()
      isAnimatingRef.current = false
    })

  }, [router, startTransition, endTransition])

  // Click handler for transition links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[data-transition]') as HTMLAnchorElement

      if (!link) return

      const href = link.getAttribute('href')
      
      // Only handle internal links
      const isInternal = href?.startsWith('/') && 
                        !link.target && 
                        !e.metaKey && 
                        !e.ctrlKey && 
                        !e.shiftKey && 
                        !e.altKey

      if (!href || !isInternal) return

      e.preventDefault()
      handleTransitionNavigation(href)
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [handleTransitionNavigation])

  // Handle programmatic navigation events from usePageTransition hook
  useEffect(() => {
    const handleProgrammaticNavigation = (e: CustomEvent) => {
      const { href, options } = e.detail
      
      if (options?.delay) {
        setTimeout(() => {
          handleTransitionNavigation(href)
        }, options.delay)
      } else {
        handleTransitionNavigation(href)
      }
    }

    window.addEventListener('page-transition-navigate', handleProgrammaticNavigation as EventListener)
    return () => window.removeEventListener('page-transition-navigate', handleProgrammaticNavigation as EventListener)
  }, [handleTransitionNavigation])

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      if (isAnimatingRef.current) return
      
      // For browser navigation, skip the out animation and go straight to in
      startTransition('in', null, () => {
        endTransition()
      })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [startTransition, endTransition])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timelineRef.current?.kill()
    }
  }, [])

  return (
    <>
      <PageTransition
        isTransitioning={isTransitioning}
        direction={direction}
        containerRef={containerRef}
      />
      
      {/* CSS fallback overlay for visual feedback */}
      <div
        id="transition-overlay"
        className="pointer-events-none fixed inset-0 z-[9998] bg-black opacity-0 transition-all duration-700"
        style={{
          opacity: isTransitioning ? 1 : 0,
          transform: isTransitioning 
            ? (direction === 'out' ? 'scaleY(1)' : 'scaleY(0)') 
            : 'scaleY(0)',
          transformOrigin: direction === 'out' ? 'top' : 'bottom',
          transition: 'transform 0.7s cubic-bezier(0.65, 0, 0.35, 1), opacity 0.7s ease'
        }}
      />
    </>
  )
}