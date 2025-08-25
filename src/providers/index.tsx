'use client'

import React from 'react'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { CanvasProvider } from './Canvas'
import { AnimationProvider } from './Animation'
import { MouseProvider } from './Mouse'
import { QualityProvider } from './Quality'
import { MouseFollowerProvider } from '@/components/mouse-follower'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <AnimationProvider>
        <MouseProvider>
          <MouseFollowerProvider>
            <QualityProvider>
              <CanvasProvider>
                <HeaderThemeProvider>{children}</HeaderThemeProvider>
              </CanvasProvider>
            </QualityProvider>
          </MouseFollowerProvider>
        </MouseProvider>
      </AnimationProvider>
    </ThemeProvider>
  )
}