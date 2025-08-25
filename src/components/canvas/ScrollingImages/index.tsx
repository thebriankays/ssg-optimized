'use client'

import React, { useRef, useEffect, useState } from 'react'
import './ScrollingImages.scss'

interface ScrollingImagesProps {
  images: Array<{
    id: string
    src: string
    alt?: string
    caption?: string
  }>
  direction?: 'horizontal' | 'vertical'
  speed?: number
  gap?: number
  pauseOnHover?: boolean
  fadeEdges?: boolean
}

export function ScrollingImages({ 
  images, 
  direction = 'horizontal',
  speed = 30, // seconds for full scroll
  gap = 32, // pixels
  pauseOnHover = true,
  fadeEdges = true,
}: ScrollingImagesProps) {
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Duplicate images for seamless loop
  const duplicatedImages = [...images, ...images]
  
  const animationStyle = {
    animationDuration: `${speed}s`,
    animationPlayState: isHovered && pauseOnHover ? 'paused' : 'running',
  }
  
  return (
    <div 
      ref={containerRef}
      className={`scrolling-images scrolling-images--${direction}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Fade edges overlay */}
      {fadeEdges && (
        <>
          <div className={`scrolling-images__fade scrolling-images__fade--start`} />
          <div className={`scrolling-images__fade scrolling-images__fade--end`} />
        </>
      )}
      
      {/* Scrolling content */}
      <div 
        className="scrolling-images__content"
        style={animationStyle}
      >
        {duplicatedImages.map((image, index) => (
          <div 
            key={`${image.id}-${index}`} 
            className="scrolling-images__item"
            style={{ [direction === 'horizontal' ? 'marginRight' : 'marginBottom']: `${gap}px` }}
          >
            <img
              src={image.src}
              alt={image.alt || ''}
              className="scrolling-images__image"
              loading="lazy"
            />
            {image.caption && (
              <p className="scrolling-images__caption">{image.caption}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}