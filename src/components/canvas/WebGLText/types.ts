export interface WebGLTextConfig {
  text: string
  font?: string
  fontSize?: number
  color?: string
  emissive?: string
  emissiveIntensity?: number
  letterSpacing?: number
  lineHeight?: number
  maxWidth?: number
  textAlign?: 'left' | 'right' | 'center' | 'justify'
  anchorX?: number | 'left' | 'center' | 'right'
  anchorY?: number | 'top' | 'top-baseline' | 'middle' | 'bottom-baseline' | 'bottom'
  clipRect?: [number, number, number, number]
  depthOffset?: number
  direction?: 'auto' | 'ltr' | 'rtl'
  fillOpacity?: number
  outlineBlur?: number
  outlineColor?: string
  outlineOffsetX?: number
  outlineOffsetY?: number
  outlineOpacity?: number
  outlineWidth?: number | string
  overflowWrap?: 'normal' | 'break-word'
  strokeColor?: string
  strokeOpacity?: number
  strokeWidth?: number | string
  whiteSpace?: 'normal' | 'nowrap'
  material?: 'basic' | 'standard' | 'physical'
  metalness?: number
  roughness?: number
  animation?: {
    type: 'none' | 'typewriter' | 'fade' | 'wave' | 'glitch'
    duration?: number
    delay?: number
    stagger?: number
  }
}