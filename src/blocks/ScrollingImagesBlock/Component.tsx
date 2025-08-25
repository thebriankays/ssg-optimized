'use client'

import React from 'react'
import type { ScrollingImagesBlock as ScrollingImagesBlockType } from '@/payload-types'
import { ScrollingImages } from '@/components/canvas/ScrollingImages'

export const ScrollingImagesBlock: React.FC<ScrollingImagesBlockType> = ({ 
  images = [],
  direction = 'horizontal',
  speed = 1,
  gap = 20,
  autoScroll = true,
  pauseOnHover = true,
}) => {
  // Transform block images to component format
  const imageItems = images?.map((item, index) => {
    const imageUrl = typeof item.image === 'object' && item.image?.url ? item.image.url : ''
    const altText = item.alt || (typeof item.image === 'object' && item.image?.alt) || `Image ${index + 1}`
    return {
      id: `image-${index}`,
      src: imageUrl,
      alt: altText,
    }
  }).filter(item => item.src) || []

  if (imageItems.length === 0) {
    return (
      <section className="block my-16">
        <div className="container">
          <p className="text-gray-500 text-center">No images to display</p>
        </div>
      </section>
    )
  }

  // Convert speed to duration (higher speed = shorter duration)
  const duration = 30 / (speed || 1)

  return (
    <section className="block my-16">
      <ScrollingImages
        images={imageItems}
        direction={direction || 'horizontal'}
        speed={duration}
        gap={gap || 20}
        pauseOnHover={pauseOnHover ?? true}
        fadeEdges={true}
      />
    </section>
  )
}