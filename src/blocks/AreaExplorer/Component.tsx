import React from 'react'
import dynamic from 'next/dynamic'
import type { AreaExplorerBlock as AreaExplorerBlockType } from '../types'

// Dynamic import for client-side only rendering
const AreaExplorerClient = dynamic(
  () => import('./Component.client').then(mod => mod.AreaExplorerClient),
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
        <div>Loading 3D map...</div>
      </div>
    )
  }
)

export const AreaExplorerBlock: React.FC<AreaExplorerBlockType> = ({
  title,
  description,
  googleMapsApiKey,
  mapSettings,
  pois,
  tours,
}) => {
  // Transform data to match component interface
  const config = {
    mapId: mapSettings?.mapId || '',
    defaultLocation: {
      lat: mapSettings?.defaultLocation?.lat || 40.7128,
      lng: mapSettings?.defaultLocation?.lng || -74.0060,
      altitude: mapSettings?.defaultLocation?.altitude || 1000,
      heading: mapSettings?.defaultLocation?.heading || 0,
      tilt: mapSettings?.defaultLocation?.tilt || 60,
      range: mapSettings?.defaultLocation?.range || 2000,
    },
    gestureHandling: mapSettings?.gestureHandling as any || 'greedy',
  }
  
  const transformedPOIs = pois?.map((poi: any, index: number) => ({
    id: `poi-${index}`,
    name: poi.name || '',
    description: poi.description,
    category: poi.category,
    location: {
      lat: poi.location?.lat || 0,
      lng: poi.location?.lng || 0,
      altitude: poi.location?.altitude,
    },
    image: typeof poi.image === 'object' && poi.image?.url ? poi.image.url : undefined,
    icon: poi.icon,
  })) || []
  
  const transformedTours = tours?.map((tour: any, index: number) => ({
    id: `tour-${index}`,
    name: tour.name || '',
    description: tour.description,
    waypoints: tour.waypoints?.map((waypoint: any) => ({
      name: waypoint.name,
      description: waypoint.description,
      location: {
        lat: waypoint.location?.lat || 0,
        lng: waypoint.location?.lng || 0,
        altitude: waypoint.location?.altitude,
        heading: waypoint.location?.heading,
        tilt: waypoint.location?.tilt,
        range: waypoint.location?.range,
      },
      duration: waypoint.duration,
      transitionDuration: waypoint.transitionDuration,
    })) || [],
    duration: tour.waypoints?.reduce((total: number, wp: any) => 
      total + (wp.duration || 5) + (wp.transitionDuration || 3), 0
    ),
  })) || []
  
  return (
    <section className="area-explorer-block">
      {title && <h2 className="area-explorer-block__title">{title}</h2>}
      {description && <p className="area-explorer-block__description">{description}</p>}
      
      <AreaExplorerClient
        config={config}
        pois={transformedPOIs}
        tours={transformedTours}
        apiKey={googleMapsApiKey || ''}
      />
    </section>
  )
}