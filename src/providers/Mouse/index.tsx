'use client'

import { createContext, useContext, useEffect, useRef, ReactNode } from 'react'
import MouseFollower from 'mouse-follower'
import { gsap } from 'gsap'

interface MouseContextValue {
  cursor: MouseFollower | null
  
  // State management
  addState: (state: string) => void
  removeState: (state: string) => void
  toggleState: (state: string) => void
  
  // Content
  setText: (text: string) => void
  removeText: () => void
  setIcon: (icon: string) => void
  removeIcon: () => void
  setMedia: (media: string) => void
  removeMedia: () => void
  
  // Effects
  setStick: (element: HTMLElement | string) => void
  removeStick: () => void
  setSkewing: (amount: number) => void
  removeSkewing: () => void
  
  // Visibility
  show: () => void
  hide: () => void
}

const MouseContext = createContext<MouseContextValue | null>(null)

export function MouseProvider({ children }: { children: ReactNode }) {
  const cursorRef = useRef<MouseFollower | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Register GSAP with MouseFollower
    MouseFollower.registerGSAP(gsap)

    // Initialize cursor
    const cursor = new MouseFollower({
      container: document.body,
      className: 'mf-cursor',
      innerClassName: 'mf-cursor-inner',
      textClassName: 'mf-cursor-text',
      mediaClassName: 'mf-cursor-media',
      mediaBoxClassName: 'mf-cursor-media-box',
      
      visible: true,
      visibleOnState: false,
      speed: 0.55,
      ease: 'expo.out',
      overwrite: true,
      
      skewing: 0,
      skewingText: 2,
      skewingIcon: 2,
      skewingMedia: 2,
      skewingDelta: 0.001,
      skewingDeltaMax: 0.15,
      
      stickDelta: 0.15,
      showTimeout: 20,
      hideOnLeave: true,
      hideTimeout: 300,
      
      stateDetection: {
        '-pointer': 'a, button',
        '-hidden': 'iframe',
        '-glass': '[data-cursor-glass]',
        '-drag': '[data-cursor-drag]',
      },
    })

    cursorRef.current = cursor

    // Add custom styles
    const style = document.createElement('style')
    style.textContent = `
      .mf-cursor {
        z-index: 9999;
      }
      
      .mf-cursor.-glass .mf-cursor-inner {
        backdrop-filter: blur(10px);
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .mf-cursor.-drag .mf-cursor-inner {
        scale: 1.5;
      }
      
      .mf-cursor.-drag .mf-cursor-inner::after {
        content: '';
        position: absolute;
        inset: 30%;
        border: 2px solid currentColor;
        border-radius: 50%;
        opacity: 0.5;
      }
    `
    document.head.appendChild(style)

    return () => {
      cursor.destroy()
      style.remove()
    }
  }, [])

  const value: MouseContextValue = {
    cursor: cursorRef.current,
    
    // State management
    addState: (state) => cursorRef.current?.addState(state),
    removeState: (state) => cursorRef.current?.removeState(state),
    toggleState: (state) => {
      const cursor = cursorRef.current
      if (!cursor) return
      
      const hasState = cursor.el?.classList.contains(state)
      if (hasState) {
        cursor.removeState(state)
      } else {
        cursor.addState(state)
      }
    },
    
    // Content
    setText: (text) => cursorRef.current?.setText(text),
    removeText: () => cursorRef.current?.removeText(),
    setIcon: (icon) => cursorRef.current?.setIcon(icon),
    removeIcon: () => cursorRef.current?.removeIcon(),
    setMedia: (media) => cursorRef.current?.setImg(media),
    removeMedia: () => cursorRef.current?.removeImg(),
    
    // Effects
    setStick: (element) => cursorRef.current?.setStick(element),
    removeStick: () => cursorRef.current?.removeStick(),
    setSkewing: (amount) => cursorRef.current?.setSkewing(amount),
    removeSkewing: () => cursorRef.current?.removeSkewing(),
    
    // Visibility
    show: () => cursorRef.current?.show(),
    hide: () => cursorRef.current?.hide(),
  }

  return (
    <MouseContext.Provider value={value}>
      {children}
    </MouseContext.Provider>
  )
}

export function useMouse() {
  const context = useContext(MouseContext)
  if (!context) {
    throw new Error('useMouse must be used within MouseProvider')
  }
  return context
}