/**
 * Cesium utilities for 3D map rendering with Google Photorealistic 3D Tiles
 */

import type { Viewer, Cartesian3, Camera } from 'cesium'

// Camera configuration constants
export const CAMERA_HEIGHT = 100 // meters above target
export const BASE_PITCH = -30 // degrees downward
export const AUTO_ORBIT_PITCH_AMPLITUDE = 10 // pitch variation during orbit
export const RANGE_AMPLITUDE_RELATIVE = 0.55
export const ZOOM_FACTOR = 20

export const CAMERA_OFFSET = {
  heading: 0, // No rotation offset
  pitch: BASE_PITCH * Math.PI / 180, // Convert to radians
  range: 800, // 800 meters from center
}

export const START_COORDINATES = {
  longitude: 0,
  latitude: 60,
  height: 15000000, // 15,000 km above surface
}

export interface CameraOptions {
  position?: {
    x: number
    y: number
    z: number
  }
  heading?: number
  pitch?: number
  roll?: number
}

export interface FocusOptions {
  focusRadius?: number
  showFocus?: boolean
  showLocationMarker?: boolean
}

export interface OrbitOptions {
  type: 'fixed-orbit' | 'dynamic-orbit'
  speed: number // revolutions per minute
}

/**
 * Calculate camera position for auto-orbit
 */
export function calculateAutoOrbitFrame(
  viewer: Viewer,
  center: { lat: number; lng: number },
  orbitType: 'fixed-orbit' | 'dynamic-orbit',
  time: number,
  speed: number
): CameraOptions {
  const baseHeading = (time * speed * 6) % 360 // 6 degrees per second at speed=1
  
  let pitch = BASE_PITCH
  let range = CAMERA_OFFSET.range
  
  if (orbitType === 'dynamic-orbit') {
    // Sine wave variation for dynamic orbit
    const sinePhase = (time * speed * 0.1) % (2 * Math.PI)
    pitch = BASE_PITCH + AUTO_ORBIT_PITCH_AMPLITUDE * Math.sin(sinePhase)
    range = CAMERA_OFFSET.range * (1 + RANGE_AMPLITUDE_RELATIVE * Math.sin(sinePhase))
  }
  
  return {
    heading: baseHeading * Math.PI / 180,
    pitch: pitch * Math.PI / 180,
    roll: 0,
  }
}

/**
 * Fly camera to a specific location with animation
 */
export async function flyToLocation(
  viewer: Viewer,
  location: { lat: number; lng: number; altitude?: number },
  options?: {
    duration?: number
    heading?: number
    pitch?: number
    range?: number
  }
): Promise<void> {
  const Cesium = await import('cesium')
  
  const destination = Cesium.Cartesian3.fromDegrees(
    location.lng,
    location.lat,
    location.altitude || CAMERA_HEIGHT
  )
  
  return new Promise((resolve) => {
    viewer.camera.flyTo({
      destination,
      orientation: {
        heading: Cesium.Math.toRadians(options?.heading || 0),
        pitch: Cesium.Math.toRadians(options?.pitch || BASE_PITCH),
        roll: 0,
      },
      duration: (options?.duration || 3000) / 1000, // Convert ms to seconds
      complete: () => resolve(),
    })
  })
}

/**
 * Initialize Google Photorealistic 3D Tiles
 */
export async function initializeGoogle3DTiles(
  viewer: Viewer,
  apiKey: string
): Promise<void> {
  const Cesium = await import('cesium')
  
  // Add Google Photorealistic 3D Tiles
  try {
    const tileset = await Cesium.Cesium3DTileset.fromUrl(
      `https://tile.googleapis.com/v1/3dtiles/root.json?key=${apiKey}`,
      {
        skipLevelOfDetail: false,
        maximumScreenSpaceError: 2,
        maximumMemoryUsage: 512,
      }
    )
    
    viewer.scene.primitives.add(tileset)
    
    // Hide default globe to show only 3D tiles
    viewer.scene.globe.show = false
    
    // Apply Google Maps attribution
    const credit = new Cesium.Credit(
      '© Google Maps',
      true
    )
    viewer.scene.frameState.creditDisplay.addStaticCredit(credit)
  } catch (error) {
    console.error('Failed to load Google 3D Tiles:', error)
  }
}

/**
 * Create a focus radius visualization
 */
export async function createFocusRadius(
  viewer: Viewer,
  center: { lat: number; lng: number },
  radius: number
): Promise<any> {
  const Cesium = await import('cesium')
  
  const entity = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(center.lng, center.lat),
    ellipse: {
      semiMinorAxis: radius,
      semiMajorAxis: radius,
      height: 0,
      material: Cesium.Color.fromCssColorString('#4285F4').withAlpha(0.2),
      outline: true,
      outlineColor: Cesium.Color.fromCssColorString('#4285F4'),
    },
  })
  
  return entity
}

/**
 * Add a location marker
 */
export async function addLocationMarker(
  viewer: Viewer,
  location: { lat: number; lng: number; altitude?: number },
  options?: {
    label?: string
    color?: string
    icon?: string
  }
): Promise<any> {
  const Cesium = await import('cesium')
  
  const entity = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(
      location.lng,
      location.lat,
      location.altitude || 0
    ),
    billboard: options?.icon ? {
      image: options.icon,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      scale: 0.5,
    } : undefined,
    point: !options?.icon ? {
      pixelSize: 10,
      color: Cesium.Color.fromCssColorString(options?.color || '#4285F4'),
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    } : undefined,
    label: options?.label ? {
      text: options.label,
      font: '14pt sans-serif',
      verticalOrigin: Cesium.VerticalOrigin.TOP,
      pixelOffset: new Cesium.Cartesian2(0, 20),
    } : undefined,
  })
  
  return entity
}
