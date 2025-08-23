'use client'

import { WebGLView } from '@/components/canvas/WebGLView'
import { WebGLText } from './WebGLText'
import type { WebGLTextConfig } from './types'

interface WebGLTextWrapperProps extends WebGLTextConfig {
  className?: string
  style?: React.CSSProperties
}

export function WebGLTextWrapper({
  className = '',
  style,
  ...textProps
}: WebGLTextWrapperProps) {
  return (
    <div className={`webgl-text-wrapper ${className}`} style={style}>
      <WebGLView>
        <WebGLText {...textProps} />
      </WebGLView>
    </div>
  )
}

export { WebGLText }
export type { WebGLTextConfig }