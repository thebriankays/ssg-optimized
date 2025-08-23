// Cesium loader utility
// We'll use dynamic imports for Cesium as it's a large library

let cesiumPromise: Promise<typeof import('cesium')> | null = null

export const loadCesium = async () => {
  if (!cesiumPromise) {
    // Set the base URL for Cesium assets before loading
    if (typeof window !== 'undefined') {
      (window as any).CESIUM_BASE_URL = '/cesium'
    }
    
    cesiumPromise = import('cesium').then((cesiumModule) => {
      // Set default access token if provided
      const token = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN
      if (token && cesiumModule.Ion) {
        cesiumModule.Ion.defaultAccessToken = token
      }
      
      // Make Cesium available globally for compatibility
      if (typeof window !== 'undefined') {
        (window as any).Cesium = cesiumModule
      }
      
      return cesiumModule
    })
  }
  return cesiumPromise
}

// Helper to check if Cesium is already loaded
export const isCesiumLoaded = () => {
  return typeof window !== 'undefined' && (window as any).Cesium
}

// Get Cesium CSS URL
export const getCesiumCSSUrl = () => {
  return '/cesium/Widgets/widgets.css'
}
