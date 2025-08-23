import { cn } from '@/utilities/ui'
import React from 'react'
import { ExperienceCard, ExperienceCardData } from '@/components/ExperienceCard'

export type Props = {
  experiences: ExperienceCardData[]
  className?: string
}

export const ExperienceArchive: React.FC<Props> = ({ experiences, className }) => {
  return (
    <div className={cn('container', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {experiences?.map((experience, index) => {
          if (typeof experience === 'object' && experience !== null) {
            return (
              <ExperienceCard 
                key={experience.slug || index} 
                experience={experience} 
                className="h-full"
              />
            )
          }
          return null
        })}
      </div>
    </div>
  )
}

export default ExperienceArchive