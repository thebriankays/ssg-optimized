export interface CarouselItem {
  id: string
  image: string
  title?: string
  description?: string
  link?: string
}

export interface WebGLCarouselConfig {
  items: CarouselItem[]
  radius?: number
  itemWidth?: number
  itemHeight?: number
  autoRotate?: boolean
  rotateSpeed?: number
  showIndicators?: boolean
  enableNavigation?: boolean
}

export interface CarouselItemProps {
  item: CarouselItem
  index: number
  totalItems: number
  currentIndex: number
  radius: number
  itemWidth: number
  itemHeight: number
  onClick?: (item: CarouselItem, index: number) => void
  onHover?: (item: CarouselItem | null, index: number | null) => void
}