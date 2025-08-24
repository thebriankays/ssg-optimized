import React from 'react'
import type { AreaExplorerBlock as AreaExplorerBlockType } from '../types'
import { AreaExplorerClient } from './Component.client'

export const AreaExplorerBlock: React.FC<AreaExplorerBlockType> = async (props) => {
  // Transform Payload data to match Google's config structure
  const config = {
    location: {
      coordinates: {
        lat: props.location?.lat || 40.7128,
        lng: props.location?.lng || -74.0060,
      },
      name: props.locationName,
      description: props.locationDescription,
    },
    camera: {
      orbitType: props.cameraOrbitType || 'fixed-orbit',
      speed: props.cameraSpeed || 2.2,
    },
    poi: {
      types: props.poiTypes || ['tourist_attraction', 'restaurant', 'cafe'],
      density: props.poiDensity || 40,
      searchRadius: props.poiSearchRadius || 1500,
    },
  }

  // Use environment variables - no API keys in the CMS
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  const mapId = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || ''

  if (!apiKey || !mapId) {
    return (
      <div className="area-explorer-error">
        <p>Google Maps configuration missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY and NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID to your environment variables.</p>
      </div>
    )
  }

  return (
    <section className="area-explorer-block">
      <AreaExplorerClient
        config={config}
        apiKey={apiKey}
        mapId={mapId}
      />
    </section>
  )
}
