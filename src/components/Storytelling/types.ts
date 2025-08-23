export interface StorySection {
  id: string
  type: 'intro' | 'chapter' | 'quote' | 'parallax' | 'outro'
  title?: string
  subtitle?: string
  content?: string
  media?: {
    type: 'image' | 'video' | 'webgl'
    src?: string
    webglComponent?: string
    webglProps?: Record<string, any>
  }
  layout?: 'left' | 'right' | 'center' | 'fullscreen'
  animation?: {
    type: 'fade' | 'slide' | 'scale' | 'parallax'
    duration?: number
    delay?: number
    offset?: number
  }
  background?: {
    color?: string
    gradient?: string
    image?: string
    blur?: number
    overlay?: string
  }
}