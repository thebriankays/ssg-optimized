'use client'

import { ReactNode } from 'react'
import './styles.scss'

interface RaysBackgroundProps {
  children?: ReactNode
  className?: string
  darkMode?: boolean
}

export function RaysBackground({
  children,
  className = '',
  darkMode = false
}: RaysBackgroundProps) {
  return (
    <div className={`rays-background ${darkMode ? 'rays-background--dark' : ''} ${className}`}>
      <div className="rays-background__effect">
        <div className="rays-background__base" />
        <div className="rays-background__overlay" />
      </div>
      {children && (
        <div className="rays-background__content">
          {children}
        </div>
      )}
    </div>
  )
}