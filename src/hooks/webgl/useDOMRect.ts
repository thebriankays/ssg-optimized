import { useEffect, useState, RefObject } from 'react'
import { useThree } from '@react-three/fiber'

export function useDOMRect(ref: RefObject<HTMLElement>) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const size = useThree((state) => state.size)

  useEffect(() => {
    if (!ref.current) return

    const updateRect = () => {
      if (ref.current) {
        setRect(ref.current.getBoundingClientRect())
      }
    }

    // Initial measurement
    updateRect()

    // Update on resize
    const resizeObserver = new ResizeObserver(updateRect)
    resizeObserver.observe(ref.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [ref, size]) // Include size to update when canvas resizes

  return rect
}