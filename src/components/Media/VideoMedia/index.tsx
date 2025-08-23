'use client'

import { cn } from '@/utilities/ui'
import React, { useEffect, useRef, forwardRef, useState } from 'react'

import type { Props as MediaProps } from '../types'

import { getMediaUrl } from '@/utilities/getMediaUrl'

export const VideoMedia = forwardRef<HTMLVideoElement, MediaProps>((props, ref) => {
  const { onClick, resource, videoClassName } = props
  const [isPlaying, setIsPlaying] = useState(true)

  const internalRef = useRef<HTMLVideoElement>(null)
  const videoRef = (ref as any) || internalRef

  useEffect(() => {
    const video = typeof videoRef === 'object' ? videoRef.current : null
    if (video) {
      video.addEventListener('suspend', () => {
        // console.warn('Video was suspended, rendering fallback image.')
      })

      // Add glass effect overlay on hover
      video.addEventListener('mouseenter', () => {
        video.style.filter = 'brightness(1.1) contrast(1.05)'
      })
      
      video.addEventListener('mouseleave', () => {
        video.style.filter = 'brightness(1) contrast(1)'
      })

      return () => {
        video.removeEventListener('mouseenter', () => {})
        video.removeEventListener('mouseleave', () => {})
      }
    }
  }, [videoRef])

  const handleClick = (e: React.MouseEvent) => {
    const video = typeof videoRef === 'object' ? videoRef.current : null
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play()
      }
      setIsPlaying(!isPlaying)
    }
    if (onClick) onClick(e)
  }

  if (resource && typeof resource === 'object') {
    const { filename } = resource

    return (
      <div className="relative group">
        <video
          autoPlay
          className={cn(
            'w-full h-full object-cover transition-all duration-300',
            'rounded-lg overflow-hidden',
            videoClassName
          )}
          controls={false}
          loop
          muted
          onClick={handleClick}
          playsInline
          ref={videoRef}
        >
          <source src={getMediaUrl(`/media/${filename}`)} />
        </video>
        
        {/* Glass play/pause overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-black/30 backdrop-blur-md rounded-full p-4">
            <svg 
              className="w-12 h-12 text-white/80" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              {isPlaying ? (
                // Pause icon
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              ) : (
                // Play icon
                <path d="M8 5v14l11-7z" />
              )}
            </svg>
          </div>
        </div>
      </div>
    )
  }

  return null
})

VideoMedia.displayName = 'VideoMedia'
