import { useRef, useCallback } from 'react'
import { useIsomorphicLayoutEffect } from '../useIsomorphicLayoutEffect'
import { gsap } from 'gsap'

export function useGSAPAnimation(
  callback: () => void | (() => void),
  deps: React.DependencyList = []
) {
  const cleanupRef = useRef<(() => void) | void>(undefined)
  
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