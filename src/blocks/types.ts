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
  title: string
  description?: string
  googleMapsApiKey: string
  mapSettings?: {
    mapId: string
    defaultLocation?: {
      lat: number
      lng: number
      altitude?: number
      heading?: number
      tilt?: number
      range?: number
    }
    gestureHandling?: 'greedy' | 'cooperative' | 'none' | 'auto'
  }
  pois?: Array<{
    name: string
    description?: string
    category?: string
    location?: {
      lat: number
      lng: number
      altitude?: number
    }
    image?: any
    icon?: string
  }>
  tours?: Array<{
    name: string
    description?: string
    waypoints?: Array<{
      name?: string
      description?: string
      location?: {
        lat: number
        lng: number
        altitude?: number
        heading?: number
        tilt?: number
        range?: number
      }
      duration?: number
      transitionDuration?: number
    }>
  }>
}

export interface StorytellingBlock {
  blockType: 'storytelling'
  sections?: Array<{
    type?: 'intro' | 'chapter' | 'quote' | 'parallax' | 'outro'
    title?: string
    subtitle?: string
    content?: any
    quote?: string
    simpleContent?: string
    media?: {
      type?: 'none' | 'image' | 'video' | 'webgl'
      image?: any
      video?: any
      webglComponent?: 'spiral' | 'particles' | 'waves'
      webglProps?: any
    }
    layout?: 'center' | 'left' | 'right' | 'fullscreen'
    animation?: {
      type?: 'none' | 'fade' | 'slide' | 'scale' | 'parallax'
      duration?: number
      delay?: number
    }
    background?: {
      color?: string
      gradient?: string
      image?: any
      blur?: number
      overlay?: string
    }
  }>
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