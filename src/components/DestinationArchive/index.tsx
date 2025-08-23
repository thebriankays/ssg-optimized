import { cn } from '@/utilities/ui'
import React from 'react'
import { DestinationCard, type DestinationCardData } from '@/components/DestinationCard'

export type Props = {
  destinations: DestinationCardData[]
}

export const DestinationArchive: React.FC<Props> = (props) => {
  const { destinations } = props

  return (
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {destinations?.map((destination, index) => {
            if (typeof destination === 'object' && destination !== null) {
              return (
                <div className="col-span-4" key={destination.id || index}>
                  <DestinationCard className="h-full" destination={destination} />
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}