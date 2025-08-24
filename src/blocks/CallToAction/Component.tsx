import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { GlassContainer } from '@/components/ui/glass/GlassComponents'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ 
  links, 
  richText
}) => {
  return (
    <div className="container">
      <GlassContainer 
        preset="frosted"
        className="p-8 flex flex-col gap-8 md:flex-row md:justify-between md:items-center"
        interactive
        glowOnHover
        liquidEffect
      >
        <div className="max-w-[48rem] flex items-center">
          {richText && <RichText className="mb-0" data={richText} enableGutter={false} />}
        </div>
        <div className="flex flex-col gap-4">
          {(links || []).map(({ link }, i) => {
            // Filter out null appearance values
            const linkProps = {
              ...link,
              appearance: link?.appearance || undefined,
            }
            return <CMSLink key={i} size="lg" {...linkProps} />
          })}
        </div>
      </GlassContainer>
    </div>
  )
}
