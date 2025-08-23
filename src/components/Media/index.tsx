'use client'

import React, { Fragment, forwardRef, useRef } from 'react'
import { UseCanvas, ScrollScene } from '@14islands/r3f-scroll-rig'
import { WebGLImage } from '@/components/canvas/scroll-rig'

import type { Props } from './types'

import { ImageMedia } from './ImageMedia'
import { VideoMedia } from './VideoMedia'

// Export the type for other components to use
export type { Props as MediaProps } from './types'

export const Media = forwardRef<HTMLElement, Props>((props, ref) => {
  const { 
    className, 
    htmlElement = 'div', 
    resource,
    enableWebGL = false,
    parallaxSpeed = 0,
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null)
  
  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')
  const Tag = htmlElement || Fragment

  // Combine refs if external ref is provided
  const setRefs = (el: any) => {
    mediaRef.current = el
    if (ref) {
      if (typeof ref === 'function') {
        ref(el)
      } else {
        (ref as any).current = el
      }
    }
  }

  return (
    <>
      <Tag
        {...(htmlElement !== null
          ? {
              className,
              ref: containerRef as any,
            }
          : {})}
      >
        {isVideo ? (
          <VideoMedia {...props} ref={setRefs} />
        ) : (
          <ImageMedia {...props} ref={setRefs} />
        )}
      </Tag>

      {/* WebGL Enhancement */}
      {enableWebGL && typeof window !== 'undefined' && (
        <UseCanvas>
          <ScrollScene track={containerRef}>
            {({ scale, scrollState }) => (
              <WebGLImage
                el={mediaRef}
                scale={scale}
                scrollState={scrollState}
                parallaxSpeed={parallaxSpeed}
                isVideo={isVideo}
              />
            )}
          </ScrollScene>
        </UseCanvas>
      )}
    </>
  )
})

Media.displayName = 'Media'
