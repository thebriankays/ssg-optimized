'use client'

import React from 'react'
import dynamic from 'next/dynamic'

// Dynamic import for client-side only rendering
const TravelDataGlobeClient = dynamic(
  () => import('./Component.client').then(mod => mod.TravelDataGlobeClient),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#000',
        color: '#fff'
      }}>
        <div>Loading globe...</div>
      </div>
    )
  }
)

// Props interface matching the data structure from the server component
interface TravelDataGlobeWrapperProps {
  advisories: Array<{
    id: string
    countryName: string
    countryCode: string
    level: 1 | 2 | 3 | 4
    summary: string
    updatedAt: string
  }>
  visaRequirements: Array<{
    id: string
    fromCountry: string
    toCountry: string
    requirementType: 'visa-free' | 'visa-on-arrival' | 'visa-required' | 'evisa'
    duration?: number
  }>
  airports: Array<{
    id: string
    name: string
    code: string
    city: string
    country: string
    countryCode: string
    latitude: number
    longitude: number
    type: 'international' | 'domestic'
  }>
  restaurants: Array<{
    id: string
    name: string
    city: string
    country: string
    countryCode: string
    latitude: number
    longitude: number
    stars: 1 | 2 | 3
    cuisine?: string
    chef?: string
  }>
  countries: Array<{
    id: string
    name: string
    code: string
    capital?: string
    region?: string
    subregion?: string
    population?: number
    flag?: string
  }>
  defaultView?: 'advisories' | 'visa' | 'michelin' | 'airports'
  globeSettings?: any
  glassSettings?: any
}

export const TravelDataGlobeWrapper: React.FC<TravelDataGlobeWrapperProps> = (props) => {
  return <TravelDataGlobeClient {...props} />
}