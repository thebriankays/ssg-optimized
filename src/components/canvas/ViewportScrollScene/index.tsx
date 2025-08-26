import React, { forwardRef } from 'react'
import { ViewportScrollScene as BaseViewportScrollScene } from '@14islands/r3f-scroll-rig'

interface ViewportScrollSceneProps {
  track: React.RefObject<HTMLElement>
  children: React.ReactNode | ((props: any) => React.ReactNode)
  hideOffscreen?: boolean
  scissor?: boolean
  [key: string]: any
}

const ViewportScrollScene = forwardRef<any, ViewportScrollSceneProps>(
  ({ track, children, hideOffscreen = true, scissor = false, ...props }, ref) => {
    return (
      <BaseViewportScrollScene
        ref={ref}
        track={track}
        hideOffscreen={hideOffscreen}
        scissor={scissor}
        {...props}
      >
        {children}
      </BaseViewportScrollScene>
    )
  }
)

ViewportScrollScene.displayName = 'ViewportScrollScene'

export default ViewportScrollScene