'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React, { Fragment } from 'react'
import { GlassContainer } from '@/components/ui/glass/GlassComponents'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title } = doc || {}
  const { description, image: metaImage } = meta || {}

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = `/${relationTo}/${slug}`

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
          {!metaImage && (
            <div className="w-full h-full flex items-center justify-center bg-white/5">
              <span className="text-white/30">No image</span>
            </div>
          )}
          {metaImage && typeof metaImage !== 'string' && (
            <div className="transition-transform duration-300 group-hover:scale-110">
              <Media 
                resource={metaImage} 
                size="33vw"
                enableWebGL={true}
                parallaxSpeed={0.15}
              />
            </div>
          )}
        </div>
        <div className="p-4">
          {showCategories && hasCategories && (
            <div className="uppercase text-sm mb-4 text-white/60">
              {categories?.map((category, index) => {
                if (typeof category === 'object') {
                  const { title: titleFromCategory } = category

                  const categoryTitle = titleFromCategory || 'Untitled category'

                  const isLast = index === categories.length - 1

                  return (
                    <Fragment key={index}>
                      {categoryTitle}
                      {!isLast && <Fragment>, &nbsp;</Fragment>}
                    </Fragment>
                  )
                }

                return null
              })}
            </div>
          )}
          {titleToUse && (
            <div className="prose prose-invert">
              <h3 className="text-white">
                <Link className="not-prose hover:text-white/80 transition-colors" href={href} ref={link.ref}>
                  {titleToUse}
                </Link>
              </h3>
            </div>
          )}
          {description && (
            <div className="mt-2">
              <p className="text-white/70">{sanitizedDescription}</p>
            </div>
          )}
        </div>
      </GlassContainer>
    </article>
  )
}
