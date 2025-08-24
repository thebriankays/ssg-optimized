import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { TravelDataGlobeBlock as TravelDataGlobeBlockType } from '../types'
import { TravelDataGlobeWrapper } from './ComponentWrapper'

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
      countryName: typeof doc.country === 'object' && doc.country ? doc.country.name : (doc.countryTag || ''),
      countryCode: typeof doc.country === 'object' && doc.country ? doc.country.code : '',
      level: parseInt(doc.threatLevel) as 1 | 2 | 3 | 4,
      summary: doc.title || '',
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
      name: doc.name,
      code: doc.iata || '',
      city: doc.city,
      country: typeof doc.country === 'object' && doc.country ? doc.country.name : '',
      countryCode: typeof doc.country === 'object' && doc.country ? doc.country.code : '',
      latitude: doc.latitude,
      longitude: doc.longitude,
      type: 'international' as 'international' | 'domestic', // Default since type isn't in the schema
    })),
    restaurants: restaurants.docs.map(doc => ({
      id: doc.id.toString(),
      name: doc.name,
      city: doc.location?.city || '',
      country: typeof doc.country === 'object' && doc.country ? doc.country.name : '',
      countryCode: typeof doc.country === 'object' && doc.country ? doc.country.code : '',
      latitude: doc.location?.latitude || 0,
      longitude: doc.location?.longitude || 0,
      stars: (doc.rating || 1) as 1 | 2 | 3,
      cuisine: doc.cuisine || undefined,
      chef: undefined, // Chef field doesn't exist in MichelinRestaurant
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
      
      <TravelDataGlobeWrapper
        {...transformedData}
        defaultView={defaultView || 'advisories'}
        globeSettings={globeSettings}
        glassSettings={glassSettings}
      />
    </section>
  )
}