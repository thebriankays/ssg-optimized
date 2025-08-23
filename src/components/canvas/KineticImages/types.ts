import * as THREE from 'three'

export interface KineticImage {
  id: string
  src: string
  alt?: string
  width?: number
  height?: number
}

export interface KineticImagesConfig {
  images: KineticImage[]
  variant?: 'tower' | 'paper' | 'spiral'
  autoRotate?: boolean
  rotateSpeed?: number
  scrollSpeed?: number
  gap?: number
  canvasSize?: number
  enableInteraction?: boolean
}

export interface BillboardProps {
  texture: THREE.Texture
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: number | [number, number, number]
  variant?: 'front' | 'back'
}

export interface BannerProps {
  count?: number
  radius?: number
  height?: number
  gradientColors?: string[]
}