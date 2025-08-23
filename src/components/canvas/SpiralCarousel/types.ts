import * as THREE from 'three'

export interface SpiralCarouselItem {
  id: string
  image: string
  title?: string
  description?: string
  link?: string
  aspectRatio?: number
}

export interface SpiralCarouselProps {
  items: SpiralCarouselItem[]
  radius?: number
  angleBetween?: number
  verticalDistance?: number
  itemWidth?: number
  itemHeight?: number
  enablePostProcessing?: boolean
  autoRotate?: boolean
  autoRotateSpeed?: number
  onItemClick?: (item: SpiralCarouselItem, index: number) => void
  onItemHover?: (item: SpiralCarouselItem | null, index: number | null) => void
  className?: string
}

export interface SpiralItemData {
  item: SpiralCarouselItem
  index: number
  position: THREE.Vector3
  rotation: THREE.Euler
  scale: number
  opacity: number
}

export interface SpiralCarouselState {
  activeIndex: number | null
  hoveredIndex: number | null
  progress: number
  isDragging: boolean
  dragStart: { x: number; y: number } | null
  velocity: number
}