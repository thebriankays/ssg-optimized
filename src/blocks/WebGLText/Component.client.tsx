'use client'

import { WebGLTextWrapper } from '@/components/canvas/WebGLText'
import type { WebGLTextConfig } from '@/components/canvas/WebGLText'

interface WebGLTextClientProps {
  config: WebGLTextConfig & {
    position?: [number, number, number]
    rotation?: [number, number, number]
    scale?: number
  }
  style?: React.CSSProperties
}

export function WebGLTextClient({ config, style }: WebGLTextClientProps) {
  return (
    <WebGLTextWrapper
      {...config}
      className="webgl-text-block"
      style={style}
    />
  )
}