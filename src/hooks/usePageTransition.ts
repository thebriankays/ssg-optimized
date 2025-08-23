'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export interface TransitionOptions {
  /** Custom delay before starting transition (ms) */
  delay?: number
  /** Disable transition for this navigation */
  skipTransition?: boolean
}

export function usePageTransition() {
  const router = useRouter()

  const navigateTo = useCallback((href: string, options: TransitionOptions = {}) => {
    if (options.skipTransition) {
      router.push(href)
      return
    }

    // For programmatic navigation, we'll dispatch a custom event
    // that the PageTransitionManager can listen to
    const event = new CustomEvent('page-transition-navigate', {
      detail: { href, options }
    })
    
    if (options.delay) {
      setTimeout(() => {
        window.dispatchEvent(event)
      }, options.delay)
    } else {
      window.dispatchEvent(event)
    }
  }, [router])

  const createTransitionLink = useCallback((href: string, options: TransitionOptions = {}) => {
    return {
      href,
      'data-transition': options.skipTransition ? undefined : '',
      onClick: options.skipTransition ? undefined : (e: React.MouseEvent) => {
        e.preventDefault()
        navigateTo(href, options)
      }
    }
  }, [navigateTo])

  return {
    navigateTo,
    createTransitionLink
  }
}