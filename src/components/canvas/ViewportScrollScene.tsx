'use client'

import { 
  ScrollScene, 
  ViewportScrollScene as R3FViewportScrollScene,
  ScrollSceneChildProps,
  ViewportScrollSceneChildProps
} from '@14islands/r3f-scroll-rig'
import { RefObject } from 'react'

interface ViewportScrollSceneProps {
  children: (props: ViewportScrollSceneChildProps) => React.ReactNode
  track: RefObject<HTMLElement>
  className?: string
  style?: React.CSSProperties
  inViewportMargin?: string
  inViewportThreshold?: number
  hideOffscreen?: boolean
  visible?: boolean
  debug?: boolean
  priority?: number
  hud?: boolean
  camera?: any
  margin?: number
  orthographic?: boolean
}

export function ViewportScrollScene({
  children,
  track,
  className,
  style,
  inViewportMargin = "0%",
  inViewportThreshold = 0,
  hideOffscreen = false,
  visible = true,
  debug = false,
  priority = 1,
  hud,
  camera,
  margin,
  orthographic = false,
}: ViewportScrollSceneProps) {
  // NOTE: This component should be used INSIDE a UseCanvas wrapper
  // Do not wrap it with UseCanvas here to avoid tunneling DOM content
  return (
    <R3FViewportScrollScene
      track={track}
      inViewportMargin={inViewportMargin}
      inViewportThreshold={inViewportThreshold}
      hideOffscreen={hideOffscreen}
      visible={visible}
      debug={debug}
      priority={priority}
      hud={hud}
      camera={camera}
      margin={margin}
      orthographic={orthographic}
    >
      {children}
    </R3FViewportScrollScene>
  )
}