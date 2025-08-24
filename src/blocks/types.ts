// Temporary block type definitions until Payload generates them properly

export interface TravelDataGlobeBlock {
  blockType: 'travel-data-globe'
  title?: string
  description?: string
  defaultView?: 'advisories' | 'visa' | 'michelin' | 'airports'
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
  dataSettings?: {
    maxAirports?: number
    maxRestaurants?: number
    showOnlyThreeStars?: boolean
  }
}

export interface AreaExplorerBlock {
  blockType: 'area-explorer'
  locationName?: string
  locationDescription?: string
  location?: {
    lat: number
    lng: number
  }
  cameraOrbitType?: 'fixed-orbit' | 'dynamic-orbit'
  cameraSpeed?: number
  poiTypes?: string[]
  poiDensity?: number
  poiSearchRadius?: number
}

export interface StorytellingBlock {
  blockType: 'storytelling'
  title: string
  date?: string
  description?: string
  createdBy?: string
  coverImage?: any
  imageCredit?: string
  chapters?: Array<{
    title: string
    content?: string
    dateTime?: string
    location?: {
      lat: number
      lng: number
    }
    address?: string
    chapterImage?: any
    imageCredit?: string
    cameraZoom?: number
    cameraTilt?: number
    cameraHeading?: number
    showLocationMarker?: boolean
    showFocusRadius?: boolean
    focusRadius?: number
  }>
  theme?: 'light' | 'dark'
  autoPlay?: boolean
  autoPlayDelay?: number
}

export interface BackgroundBlock {
  blockType: 'background'
  type: 'none' | 'whatamesh' | 'gradient' | 'particles' | 'fluid'
  colors?: {
    color1?: string
    color2?: string
    color3?: string
    color4?: string
  }
  intensity?: number
  animationSpeed?: number
  fullScreen?: boolean
  fixed?: boolean
}

export interface WebGLTextBlock {
  blockType: 'webgl-text'
  text: string
  typography?: {
    font?: string
    fontSize?: number
    letterSpacing?: number
    lineHeight?: number
    maxWidth?: number
    textAlign?: 'left' | 'center' | 'right' | 'justify'
  }
  appearance?: {
    color?: string
    emissive?: string
    emissiveIntensity?: number
    material?: 'basic' | 'standard' | 'physical'
    metalness?: number
    roughness?: number
  }
  outline?: {
    enabled?: boolean
    outlineColor?: string
    outlineWidth?: number
    outlineOpacity?: number
  }
  animation?: {
    type?: 'none' | 'typewriter' | 'fade' | 'wave' | 'glitch'
    duration?: number
    delay?: number
    stagger?: number
  }
  transform?: {
    position?: {
      x?: number
      y?: number
      z?: number
    }
    rotation?: {
      x?: number
      y?: number
      z?: number
    }
    scale?: number
  }
  layout?: {
    height?: string
    fullWidth?: boolean
    backgroundColor?: string
  }
}