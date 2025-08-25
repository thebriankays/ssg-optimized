import { useRef, useCallback } from 'react'
import { useIsomorphicLayoutEffect } from '../useIsomorphicLayoutEffect'
import { gsap } from 'gsap'

export function useGSAPAnimation(
  callback: () => void | (() => void),
  deps: React.DependencyList = []
) {
  const cleanupRef = useRef<(() => void) | void>(undefined)
  
  useIsomorphicLayoutEffect(() => {
    // Create GSAP context with suppressEvents to prevent display:none issues
    const ctx = gsap.context(() => {
      cleanupRef.current = callback()
    })
    
    return () => {
      // Clean up function from callback
      if (typeof cleanupRef.current === 'function') {
        cleanupRef.current()
      }
      // Kill context instead of reverting to prevent display:none issues
      ctx.kill()
    }
  }, deps)
}