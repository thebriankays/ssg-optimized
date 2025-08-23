import { useState, useCallback } from 'react'

export function useRipple() {
  const [ripples, setRipples] = useState<Array<{
    x: number
    y: number
    size: number
    id: number
  }>>([])
  
  const createRipple = useCallback((event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = event.clientX - rect.left - size / 2
    const y = event.clientY - rect.top - size / 2
    
    const newRipple = {
      x,
      y,
      size,
      id: Date.now(),
    }
    
    setRipples((prev) => [...prev, newRipple])
    
    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
    }, 600)
  }, [])
  
  const rippleProps = {
    style: ripples.map((ripple) => ({
      left: ripple.x,
      top: ripple.y,
      width: ripple.size,
      height: ripple.size,
    })),
  }
  
  return { rippleProps, createRipple }
}