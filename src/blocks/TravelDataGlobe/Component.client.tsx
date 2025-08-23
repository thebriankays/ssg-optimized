'use client'

import { TravelDataGlobeWrapper } from '@/components/TravelDataGlobe/TravelDataGlobeWrapper'
import type { 
  TravelAdvisory, 
  VisaRequirement, 
  Airport, 
  MichelinRestaurant,
  Country,
  GlobeView 
} from '@/components/TravelDataGlobe/types'

interface TravelDataGlobeClientProps {
  advisories: TravelAdvisory[]
  visaRequirements: VisaRequirement[]
  airports: Airport[]
  restaurants: MichelinRestaurant[]
  countries: Country[]
  defaultView?: GlobeView
  globeSettings?: {
    autoRotate?: boolean
    autoRotateSpeed?: number
    atmosphereColor?: string
    atmosphereAltitude?: number
  }
  glassSettings?: {
    tint?: string
    opacity?: number
    blur?: number
  }
}

export function TravelDataGlobeClient({
  advisories,
  visaRequirements,
  airports,
  restaurants,
  countries,
  defaultView = 'advisories',
  globeSettings,
  glassSettings,
}: TravelDataGlobeClientProps) {
  return (
    <TravelDataGlobeWrapper
      advisories={advisories}
      visaRequirements={visaRequirements}
      airports={airports}
      restaurants={restaurants}
      countries={countries}
      className="travel-data-globe-wrapper"
      glassSettings={glassSettings}
    />
  )
}