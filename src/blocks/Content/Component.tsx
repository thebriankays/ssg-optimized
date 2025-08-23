import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'
import { GlassContainer } from '@/components/ui/glass/GlassComponents'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  return (
    <div className="container my-16">
      <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { enableLink, link, richText, size } = col

            return (
              <div
                className={cn(
                  `col-span-4 lg:col-span-${colsSpanClasses[size!]}`,
                  {
                    'md:col-span-2': size !== 'full',
                  }
                )}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
                key={index}
              >
                <GlassContainer 
                  preset="frosted" 
                  className="p-8 h-full animate-fade-in"
                  animated
                  interactive
                >
                  {richText && (
                    <div className="prose prose-invert max-w-none">
                      <RichText data={richText} enableGutter={false} />
                    </div>
                  )}

                  {enableLink && (
                    <div className="mt-6">
                      <CMSLink {...link} />
                    </div>
                  )}
                </GlassContainer>
              </div>
            )
          })}
      </div>
    </div>
  )
}
