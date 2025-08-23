import React, { useRef } from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'
import { GlassContainer } from '@/components/ui/glass/GlassComponents'
import { UseCanvas, ScrollScene } from '@14islands/r3f-scroll-rig'
import { LiquidGlassEffect } from '@/components/canvas/LiquidGlassEffect'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ 
  links, 
  richText
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="container" ref={containerRef}>
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
            return <CMSLink key={i} size="lg" {...link} />
          })}
        </div>
      </GlassContainer>

      {/* WebGL Enhancement */}
      {typeof window !== 'undefined' && (
        <UseCanvas>
          <ScrollScene track={containerRef}>
            {() => (
              <LiquidGlassEffect 
                intensity={0.5}
                speed={0.2}
                followMouse={false}
              />
            )}
          </ScrollScene>
        </UseCanvas>
      )}
    </div>
  )
}
