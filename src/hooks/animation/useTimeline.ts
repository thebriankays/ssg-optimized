import { useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { useAnimation } from '@/providers/Animation'

export function useTimeline(id?: string) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const { registerAnimation, unregisterAnimation } = useAnimation()
  
  const create = useCallback((options?: gsap.TimelineVars) => {
    // Kill existing timeline
    if (timelineRef.current) {
      timelineRef.current.kill()
    }
    
    // Create new timeline
    const tl = gsap.timeline(options)
    timelineRef.current = tl
    
    // Register if ID provided
    if (id) {
      registerAnimation(id, tl)
    }
    
    return tl
  }, [id, registerAnimation])
  
  const play = useCallback(() => {
    timelineRef.current?.play()
  }, [])
  
  const pause = useCallback(() => {
    timelineRef.current?.pause()
  }, [])
  
  const reverse = useCallback(() => {
    timelineRef.current?.reverse()
  }, [])
  
  const seek = useCallback((time: number) => {
    timelineRef.current?.seek(time)
  }, [])
  
  const progress = useCallback((value?: number) => {
    if (value !== undefined) {
      timelineRef.current?.progress(value)
    }
    return timelineRef.current?.progress() || 0
  }, [])
  
  return {
    timeline: timelineRef.current,
    create,
    play,
    pause,
    reverse,
    seek,
    progress,
  }
}