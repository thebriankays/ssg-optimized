import { TravelDataGlobe } from './TravelDataGlobe'
import { processTopoJSON, simplifyCountryFeatures } from './utils/dataProcessing'
import type { 
  TravelAdvisory, 
  VisaRequirement, 
  Airport, 
  MichelinRestaurant,
  Country 
} from './types'

interface TravelDataGlobeWrapperProps {
  advisories: TravelAdvisory[]
  visaRequirements: VisaRequirement[]
  airports: Airport[]
  restaurants: MichelinRestaurant[]
  countries: Country[]
  className?: string
  glassSettings?: {
    tint?: string
    opacity?: number
    blur?: number
  }
}

export async function TravelDataGlobeWrapper({
  advisories,
  visaRequirements,
  airports,
  restaurants,
  countries,
  className,
  glassSettings,
}: TravelDataGlobeWrapperProps) {
  // Load and process topology data
  const topology = await fetch('/countries-110m.json').then(res => res.json())
  const features = processTopoJSON(topology)
  const simplifiedFeatures = simplifyCountryFeatures(features)
  
  return (
    <TravelDataGlobe
      features={simplifiedFeatures}
      advisories={advisories}
      visaRequirements={visaRequirements}
      airports={airports}
      restaurants={restaurants}
      countries={countries}
      className={className}
      glassSettings={glassSettings}
    />
  )
}