import { cn } from '@/utilities/ui'
import React from 'react'
import { GlassContainer } from '@/components/ui/glass/GlassComponents'

import { Card, CardPostData } from '@/components/Card'

export type Props = {
  posts: CardPostData[]
  className?: string
}

export const CollectionArchive: React.FC<Props> = (props) => {
  const { posts, className } = props

  return (
    <div className={cn('container', className)}>
      <GlassContainer 
        preset="clear" 
        className="p-8"
        animated
      >
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-6 gap-x-6 lg:gap-y-8 lg:gap-x-8">
          {posts?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div 
                  className="col-span-4 animate-fade-in" 
                  key={index}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <Card 
                    className="h-full transform transition-all duration-300 hover:translate-y-[-4px]" 
                    doc={result} 
                    relationTo="posts" 
                    showCategories 
                  />
                </div>
              )
            }

            return null
          })}
        </div>
      </GlassContainer>
    </div>
  )
}
