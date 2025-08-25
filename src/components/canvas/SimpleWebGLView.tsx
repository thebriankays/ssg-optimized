'use client'

import { useCanvas } from '@14islands/r3f-scroll-rig'
import { ReactNode, useRef, useEffect } from 'react'
import { Group } from 'three'

interface SimpleWebGLViewProps {
  children: ReactNode
  className?: string
  id?: string
}

/**
 * SimpleWebGLView - A simplified approach to rendering WebGL content
 * This component doesn't try to hide/show DOM elements which causes the disappearing content issue
 */
export function SimpleWebGLView({ children, className = '', id }: SimpleWebGLViewProps) {
  const groupRef = useRef<Group>(null!)
  
  // Use the useCanvas hook directly without wrapping DOM elements
  useCanvas(
    () => {
      const group = new Group()
      groupRef.current = group
      return group
    },
    { 
      // Props can be passed here if needed
    },
    {
      key: id,
      dispose: true
    }
  )
  
  useEffect(() => {
    if (groupRef.current && children) {
      // Add children to the group
      // This is a simplified approach - you may need to adjust based on your needs
    }
  }, [children])
  
  // Return an empty div as a placeholder
  // The actual WebGL content is rendered in the GlobalCanvas
  return <div className={className} data-webgl-placeholder={id} />
}

/**
 * WebGLContent - For rendering pure WebGL content without DOM tracking
 * Use this when you just want to add 3D content to the canvas
 */
export function WebGLContent({ children }: { children: ReactNode }) {
  useCanvas(children as any)
  return null
}