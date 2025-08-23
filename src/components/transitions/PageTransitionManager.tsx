'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { PageTransition } from './PageTransition'

// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface TransitionState {
  isTransitioning: boolean
  direction: 'out' | 'in'
  pendingHref: string | null
}

export function PageTransitionManager() {
  const router = useRouter()
  const pathname = usePathname()
  const [transitionState, setTransitionState] = useState<TransitionState>({
    isTransitioning: false,
    direction: 'out',
    pendingHref: null
  })
  
  const isAnimatingRef = useRef(false)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  // Handle page enter animation when pathname changes
  useEffect(() => {
    if (isAnimatingRef.current) return

    // Initial setup - page starts invisible
    gsap.set('#page-content', { 
      opacity: 0, 
      y: 12, 
      pointerEvents: 'none' 
    })

    // Start WebGL transition in
    setTransitionState(prev => ({
      ...prev,
      isTransitioning: true,
      direction: 'in'
    }))

    // Animate page content in after a brief delay
    const tl = gsap.timeline({ delay: 0.2 })
    tl.to('#page-content', { 
      opacity: 1, 
      y: 0, 
      duration: 0.6, 
      ease: 'power2.out',
      pointerEvents: 'auto'
    })
    .add(() => {
      // Refresh ScrollTrigger and resume scroll
      ScrollTrigger.refresh(true)
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    })

  }, [pathname])

  // Handle WebGL transition completion
  const handleTransitionComplete = useCallback(() => {
    setTransitionState(prev => ({
      ...prev,
      isTransitioning: false
    }))

    // If we have a pending navigation, execute it now
    if (transitionState.pendingHref && transitionState.direction === 'out') {
      router.push(transitionState.pendingHref)
      setTransitionState(prev => ({
        ...prev,
        pendingHref: null
      }))
    }

    isAnimatingRef.current = false
  }, [router, transitionState.direction, transitionState.pendingHref])

  // Navigation handler for transition links
  const handleTransitionNavigation = useCallback((href: string) => {
    if (isAnimatingRef.current || transitionState.pendingHref === href) return

    isAnimatingRef.current = true
    
    // Pause scroll
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    // Kill any existing timeline
    timelineRef.current?.kill()

    // Animate page content out
    timelineRef.current = gsap.timeline()
    timelineRef.current.to('#page-content', { 
      opacity: 0, 
      y: -12, 
      duration: 0.35, 
      ease: 'power2.in',
      pointerEvents: 'none'
    })

    // Start WebGL transition out
    setTransitionState({
      isTransitioning: true,
      direction: 'out',
      pendingHref: href
    })

  }, [transitionState.pendingHref])

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
      setTransitionState({
        isTransitioning: true,
        direction: 'in',
        pendingHref: null
      })
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timelineRef.current?.kill()
    }
  }, [])

  return (
    <>
      <PageTransition
        isTransitioning={transitionState.isTransitioning}
        direction={transitionState.direction}
        onComplete={handleTransitionComplete}
      />
      
      {/* Optional overlay for additional visual feedback */}
      <div
        id="transition-overlay"
        className="pointer-events-none fixed inset-0 z-[9998] bg-black/5 opacity-0 transition-opacity duration-300"
        style={{
          opacity: transitionState.isTransitioning && transitionState.direction === 'out' ? 1 : 0
        }}
      />
    </>
  )
}