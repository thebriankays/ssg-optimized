import { useRef, MutableRefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScrollbar } from '@14islands/r3f-scroll-rig'
import * as THREE from 'three'

interface ScrollAnimationOptions {
  onScroll?: (progress: number, velocity: number) => void
  onEnter?: () => void
  onLeave?: () => void
  onProgress?: (progress: number) => void
}

export function useScrollAnimation(
  ref: MutableRefObject<THREE.Object3D>,
  options: ScrollAnimationOptions = {}
) {
  const { scroll } = useScrollbar()
  const wasInView = useRef(false)
  
  useFrame(() => {
    if (!ref.current || !scroll) return
    
    const { progress, velocity } = scroll
    
    // For now, we'll just use scroll progress
    // TODO: Implement proper viewport tracking
    
    // Handle scroll
    options.onScroll?.(progress, velocity)
    options.onProgress?.(progress)
  })
}