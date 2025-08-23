'use client'

import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React from 'react'
import { Media } from '@/components/Media'
import { GlassContainer } from '@/components/ui/glass/GlassComponents'
import type { Experience } from '@/payload-types'

export type ExperienceCardData = Pick<
  Experience,
  'slug' | 'title' | 'shortDescription' | 'heroImage' | 'experienceType' | 'duration' | 'priceRange' | 'destinations' | 'featured'
>

export const ExperienceCard: React.FC<{
  className?: string
  experience: ExperienceCardData
}> = ({ className, experience }) => {
  const { card, link } = useClickableCard({})
  const href = `/experiences/${experience.slug}`

  // Extract experience type name
  const experienceTypeName = 
    experience.experienceType && typeof experience.experienceType === 'object' 
      ? experience.experienceType.name 
      : 'Experience'

  // Count destinations
  const destinationCount = experience.destinations?.length || 0

  // Format price
  const formattedPrice = experience.priceRange?.startingFrom 
    ? `From ${experience.priceRange.currency} ${experience.priceRange.startingFrom.toLocaleString()}`
    : 'Contact for pricing'

  // Format duration
  const durationText = experience.duration 
    ? `${experience.duration.days} days / ${experience.duration.nights} nights`
    : ''

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
        {/* Featured Badge */}
        {experience.featured && (
          <div className="absolute top-4 left-4 z-10">
            <GlassContainer preset="holographic" className="px-3 py-1 text-sm font-semibold">
              Featured
            </GlassContainer>
          </div>
        )}

        {/* Hero Image with WebGL */}
        <div className="relative w-full aspect-[16/9] overflow-hidden">
          {experience.heroImage && typeof experience.heroImage !== 'string' ? (
            <div className="transition-transform duration-300 group-hover:scale-110">
              <Media 
                resource={experience.heroImage} 
                size="33vw"
                enableWebGL={true}
                parallaxSpeed={0.2}
              />
            </div>
          ) : (
            <div className="w-full h-full bg-white/5 flex items-center justify-center">
              <span className="text-white/30">No image</span>
            </div>
          )}
          
          {/* Experience Type Overlay */}
          <div className="absolute bottom-4 left-4">
            <GlassContainer preset="clear" className="px-3 py-1 text-sm">
              {experienceTypeName}
            </GlassContainer>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h3 className="text-xl font-semibold mb-2">
            <Link href={href} ref={link.ref} className="text-white hover:text-white/80 transition-colors">
              {experience.title}
            </Link>
          </h3>

          {/* Description */}
          {experience.shortDescription && (
            <p className="text-white/70 mb-4 line-clamp-2">
              {experience.shortDescription}
            </p>
          )}

          {/* Details */}
          <div className="space-y-2 text-sm text-white/60">
            {durationText && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{durationText}</span>
              </div>
            )}
            
            {destinationCount > 0 && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{destinationCount} destinations</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-lg font-semibold text-white">
              {formattedPrice}
            </p>
            {experience.priceRange?.pricingNote && (
              <p className="text-xs text-white/50 mt-1">
                {experience.priceRange.pricingNote}
              </p>
            )}
          </div>
        </div>
      </GlassContainer>
    </article>
  )
}

export default ExperienceCard
