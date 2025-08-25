'use client'

import React from 'react'
import type { WebGLCarouselBlock as WebGLCarouselBlockType } from '@/payload-types'
import { WebGLCarousel } from '@/components/canvas/WebGLCarousel/WebGLCarousel'

export const WebGLCarouselBlock: React.FC<WebGLCarouselBlockType> = ({ 
  items = [],
  autoplay = true,
  autoplaySpeed = 5,
  variant = 'default',
  showIndicators = true,
  showArrows = true,
}) => {
  // Transform block items to carousel items
  const carouselItems = items?.map((item, index) => ({
    id: `item-${index}`,
    image: typeof item.image === 'object' && item.image?.url ? item.image.url : '/placeholder.jpg',
    title: item.title || `Item ${index + 1}`,
    description: item.description || undefined, // Convert null to undefined
  })) || []

  if (carouselItems.length === 0) {
    return (
      <section className="block my-16">
        <div className="container">
          <p className="text-gray-500 text-center">No carousel items to display</p>
        </div>
      </section>
    )
  }

  return (
    <section className="block my-16">
      <div className="container">
        <WebGLCarousel
          items={carouselItems}
          radius={3}
          itemWidth={1.5}
          itemHeight={2}
          autoRotate={autoplay ?? true}
          rotateSpeed={0.5}
          showIndicators={showIndicators ?? true}
          enableNavigation={showArrows ?? true}
        />
      </div>
    </section>
  )
}