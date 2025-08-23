import React from 'react'
import dynamic from 'next/dynamic'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { TravelDataGlobeBlock as TravelDataGlobeBlockType } from '../types'

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

export const TravelDataGlobeBlock: React.FC<TravelDataGlobeBlockType> = async ({
  title,
  description,
  defaultView,
  globeSettings,
  glassSettings,
  dataSettings,
}) => {
  const payload = await getPayload({ config })
  
  // Fetch all required data
  const [advisories, visaRequirements, airports, restaurants, countries] = await Promise.all([
    payload.find({
      collection: 'travel-advisories',
      limit: 1000,
    }),
    payload.find({
      collection: 'visa-requirements',
      limit: 10000,
    }),
    payload.find({
      collection: 'airports',
      where: {
        type: {
          equals: 'international',
        },
      },
      limit: dataSettings?.maxAirports || 50,
    }),
    payload.find({
      collection: 'michelin-restaurants',
      where: dataSettings?.showOnlyThreeStars ? {
        stars: {
          equals: 3,
        },
      } : {},
      limit: dataSettings?.maxRestaurants || 100,
    }),
    payload.find({
      collection: 'countries',
      limit: 250,
    }),
  ])
  
  // Transform data to match component interface
  const transformedData = {
    advisories: advisories.docs.map(doc => ({
      id: doc.id.toString(),
      countryName: doc.country as string,
      countryCode: doc.countryCode as string,
      level: parseInt(doc.threatLevel) as 1 | 2 | 3 | 4,
      summary: doc.description as string,
      updatedAt: doc.updatedAt,
    })),
    visaRequirements: visaRequirements.docs.map(doc => ({
      id: doc.id.toString(),
      fromCountry: typeof doc.passportCountry === 'string' ? doc.passportCountry : (doc.passportCountry as any)?.name || '',
      toCountry: typeof doc.destinationCountry === 'string' ? doc.destinationCountry : (doc.destinationCountry as any)?.name || '',
      requirementType: doc.requirement as 'visa-free' | 'visa-on-arrival' | 'visa-required' | 'evisa',
      duration: doc.days || undefined,
    })),
    airports: airports.docs.map(doc => ({
      id: doc.id.toString(),
      name: doc.name as string,
      code: doc.iata as string,
      city: (typeof doc.city === 'string' ? doc.city : (doc.city as any)?.name) as string,
      country: (typeof doc.country === 'string' ? doc.country : (doc.country as any)?.name) as string,
      countryCode: doc.countryCode as string,
      latitude: doc.latitude as number,
      longitude: doc.longitude as number,
      type: doc.type as 'international' | 'domestic',
    })),
    restaurants: restaurants.docs.map(doc => ({
      id: doc.id.toString(),
      name: doc.name as string,
      city: doc.city as string,
      country: (typeof doc.country === 'string' ? doc.country : (doc.country as any)?.name) as string,
      countryCode: doc.countryCode as string,
      latitude: doc.latitude as number,
      longitude: doc.longitude as number,
      stars: doc.michelinStars as 1 | 2 | 3,
      cuisine: doc.cuisine as string | undefined,
      chef: doc.chef as string | undefined,
    })),
    countries: countries.docs.map(doc => ({
      id: doc.id.toString(),
      name: doc.name,
      code: doc.code,
      capital: doc.capital || undefined,
      region: doc.region || undefined,
      subregion: doc.subregion || undefined,
      population: undefined, // No population field directly on Country
      flag: doc.flag || undefined, // flag filename, not SVG
    })),
  }
  
  return (
    <section className="travel-data-globe-block">
      {title && <h2 className="travel-data-globe-block__title">{title}</h2>}
      {description && <p className="travel-data-globe-block__description">{description}</p>}
      
      <TravelDataGlobeClient
        {...transformedData}
        defaultView={defaultView || 'advisories'}
        globeSettings={globeSettings}
        glassSettings={glassSettings}
      />
    </section>
  )
}