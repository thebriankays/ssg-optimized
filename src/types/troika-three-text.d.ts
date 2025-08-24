declare module 'troika-three-text' {
  import { Object3D, Material, Color, Vector3, Mesh } from 'three'

  export class Text extends Mesh {
    constructor()
    
    // Text properties
    text: string
    font?: string
    fontSize?: number
    letterSpacing?: number
    lineHeight?: number | 'normal'
    maxWidth?: number
    textAlign?: 'left' | 'right' | 'center' | 'justify'
    textIndent?: number
    whiteSpace?: 'normal' | 'nowrap'
    overflowWrap?: 'normal' | 'break-word'
    anchorX?: number | 'left' | 'center' | 'right'
    anchorY?: number | 'top' | 'top-baseline' | 'middle' | 'bottom-baseline' | 'bottom'
    
    // Material properties
    color?: Color | string | number
    depthOffset?: number
    clipRect?: [number, number, number, number] | null
    orientation?: string
    glyphGeometryDetail?: number
    sdfGlyphSize?: number
    gpuAccelerate?: boolean
    
    // Outline/stroke properties
    outlineWidth?: number | string
    outlineColor?: Color | string | number
    outlineOpacity?: number
    outlineBlur?: number | string
    outlineOffsetX?: number | string
    outlineOffsetY?: number | string
    strokeWidth?: number | string
    strokeColor?: Color | string | number
    strokeOpacity?: number
    fillOpacity?: number
    
    // Material
    material?: Material | Material[]
    
    // Methods
    sync(callback?: () => void): void
    dispose(): void
    
    // Getters
    readonly textRenderInfo: object | null
    readonly geometry: any
  }

  export function preloadFont(
    font: string,
    text?: string,
    callback?: () => void
  ): void
}