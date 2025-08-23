import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'
import { GlassContainer } from '@/components/ui/glass/GlassComponents'

import type { MediaBlock as MediaBlockProps } from '@/payload-types'

import { Media } from '../../components/Media'

type Props = MediaBlockProps & {
  breakout?: boolean
  captionClassName?: string
  className?: string
  enableGutter?: boolean
  imgClassName?: string
  staticImage?: StaticImageData
  disableInnerContainer?: boolean
}

export const MediaBlock: React.FC<Props> = (props) => {
  const {
    captionClassName,
    className,
    enableGutter = true,
    imgClassName,
    media,
    staticImage,
    disableInnerContainer,
  } = props

  let caption
  if (media && typeof media === 'object') caption = media.caption

  return (
    <div
      className={cn(
        '',
        {
          container: enableGutter,
        },
        className,
      )}
    >
      {(media || staticImage) && (
        <>
          <div className="relative glass-media-wrapper animate-fade-in">
            <Media
              imgClassName={cn(
                'rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105',
                imgClassName
              )}
              resource={media}
              src={staticImage}
              enableWebGL={true}
              parallaxSpeed={0.3}
            />
            
            {/* Glass overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
          </div>

          {caption && (
            <div
              className={cn(
                'mt-6',
                {
                  container: !disableInnerContainer,
                },
                captionClassName,
              )}
              style={{ animationDelay: '0.2s' }}
            >
              <GlassContainer preset="frosted" className="p-4 animate-fade-in">
                <div className="prose prose-invert max-w-none">
                  <RichText data={caption} enableGutter={false} />
                </div>
              </GlassContainer>
            </div>
          )}
        </>
      )}
    </div>
  )
}
