'use client'

import { useState, useEffect } from 'react'
import { TravelDataGlobe } from './TravelDataGlobe'
import { processTopoJSON, simplifyCountryFeatures } from './utils/dataProcessing'
import type { 
  TravelAdvisory, 
  VisaRequirement, 
  Airport, 
  MichelinRestaurant,
  Country,
  GeoFeature 
} from './types'
import './travel-data-globe.scss'

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

export function TravelDataGlobeWrapper({
  advisories,
  visaRequirements,
  airports,
  restaurants,
  countries,
  className,
  glassSettings,
}: TravelDataGlobeWrapperProps) {
  const [features, setFeatures] = useState<GeoFeature[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Load and process topology data
    const loadTopology = async () => {
      try {
        const topology = await fetch('/countries-110m.json').then(res => res.json())
        const processedFeatures = processTopoJSON(topology)
        const simplifiedFeatures = simplifyCountryFeatures(processedFeatures)
        setFeatures(simplifiedFeatures)
      } catch (error) {
        console.error('Failed to load topology data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadTopology()
  }, [])
  
  if (isLoading || features.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div>Loading globe data...</div>
      </div>
    )
  }
  
  return (
    <TravelDataGlobe
      features={features}
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