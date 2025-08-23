import type { BannerBlock as BannerBlockProps } from 'src/payload-types'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'
import { GlassContainer } from '@/components/ui/glass/GlassComponents'

type Props = {
  className?: string
} & BannerBlockProps

export const BannerBlock: React.FC<Props> = ({ className, content, style }) => {
  const glassPreset = style === 'error' ? 'refractive' : 
                     style === 'success' ? 'holographic' :
                     style === 'warning' ? 'liquid' : 'frosted'
  
  return (
    <div className={cn('mx-auto my-8 w-full', className)}>
      <GlassContainer 
        preset={glassPreset}
        className={cn('py-3 px-6', {
          'text-blue-300': style === 'info',
          'text-red-300': style === 'error',
          'text-green-300': style === 'success',
          'text-yellow-300': style === 'warning',
        })}
        animated={style === 'warning' || style === 'error'}
        glowOnHover
      >
        <RichText data={content} enableGutter={false} enableProse={false} />
      </GlassContainer>
    </div>
  )
}
