'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React from 'react'
import { GlassContainer } from '@/components/ui/glass/GlassComponents'
import { Media } from '@/components/Media'
import type { Destination } from '@/payload-types'

export type DestinationCardData = Pick<
  Destination, 
  'id' | 'title' | 'slug' | 'country' | 'city' | 'continent' | 'featuredImage' | 'flagSvg' | 'countryData'
>

export const DestinationCard: React.FC<{
  className?: string
  destination: DestinationCardData
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, destination } = props

  const { slug, title, country, city, continent, featuredImage, flagSvg, countryData } = destination || {}
  const href = `/destinations/${slug}`

  return (
    <article
      className={cn(
        'group cursor-pointer overflow-hidden',
        className,
      )}
      ref={card.ref}
    >
      <GlassContainer 
        preset="frosted" 
        className="h-full p-0 overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
        interactive
        glowOnHover
      >
        <div className="relative w-full aspect-video overflow-hidden">
          {!featuredImage && (
            <div className="w-full h-full flex items-center justify-center bg-white/5">
              <span className="text-white/30">No image</span>
            </div>
          )}
          {featuredImage && typeof featuredImage !== 'string' && (
            <div className="transition-transform duration-300 group-hover:scale-110">
              <Media resource={featuredImage} size="33vw" />
            </div>
          )}
          {flagSvg && (
            <div 
              className="absolute top-2 right-2 w-8 h-6 opacity-80"
              dangerouslySetInnerHTML={{ __html: flagSvg }}
            />
          )}
        </div>
        <div className="p-4">
          <div className="flex items-baseline gap-2 mb-2">
            {continent && (
              <span className="text-xs text-white/50">{continent}</span>
            )}
            {country && (
              <span className="text-xs text-white/50">{country}</span>
            )}
          </div>
          <h3 className="text-lg font-medium text-white/90">
            <Link className={cn('not-prose', 'hover:text-white')} href={href} ref={link.ref}>
              {title}
            </Link>
          </h3>
          {city && (
            <p className="text-sm text-white/70 mt-1">{city}</p>
          )}
        </div>
      </GlassContainer>
    </article>
  )
}