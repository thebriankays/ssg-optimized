'use client'

import { useEffect, useRef } from 'react'
import MouseFollower from 'mouse-follower'
import { gsap } from 'gsap'
import './mouse-follower.scss'

// Register GSAP with MouseFollower
if (typeof window !== 'undefined' && gsap) {
  MouseFollower.registerGSAP(gsap)
}

interface MouseFollowerProviderProps {
  options?: any
  children?: React.ReactNode
}

let cursorInstance: MouseFollower | null = null

export function MouseFollowerProvider({ children, options = {} }: MouseFollowerProviderProps) {
  const isInitialized = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined' || isInitialized.current) return

    // Default options with all sizes
    const defaultOptions = {
      el: null,
      container: document.body,
      className: 'mf-cursor',
      innerClassName: 'mf-cursor-inner',
      textClassName: 'mf-cursor-text',
      mediaClassName: 'mf-cursor-media',
      mediaBoxClassName: 'mf-cursor-media-box',
      iconSvgClassName: 'mf-svgsprite',
      iconSvgNamePrefix: '-',
      iconSvgSrc: '',
      dataAttr: 'cursor',
      hiddenState: '-hidden',
      textState: '-text',
      iconState: '-icon',
      activeState: '-active',
      mediaState: '-media',
      stateDetection: {
        '-pointer': 'a,.clickable,[data-cursor-pointer]',
        '-hidden': 'iframe,input,textarea,select,[data-cursor-hidden]',
        '-exclusion': '[data-cursor*="-exclusion"]',
        '-difference': '[data-cursor*="-difference"]',
        '-sm': '[data-cursor*="-sm"]',  // Small size
        '-md': '[data-cursor*="-md"]',  // Medium size
        '-lg': '[data-cursor*="-lg"]',  // Large size
        '-xl': '[data-cursor*="-xl"]',  // Extra large size
        '-xxl': '[data-cursor*="-xxl"]', // Extra extra large size
        '-drag': '[data-cursor*="-drag"]',
        '-color-yellow': '[data-cursor*="-color-yellow"]',
        '-color-turquois': '[data-cursor*="-color-turquois"]',
        '-color-green': '[data-cursor*="-color-green"]',
        '-color-purple': '[data-cursor*="-color-purple"]',
        '-color-white': '[data-cursor*="-color-white"]',
        '-color-black': '[data-cursor*="-color-black"]',
      },
      visible: true,
      visibleOnState: false,
      speed: 0.7,
      ease: 'expo.out',
      overwrite: true,
      skewing: 2,
      skewingText: 2,
      skewingIcon: 2,
      skewingMedia: 2,
      skewingDelta: 0.001,
      skewingDeltaMax: 0.15,
      stickDelta: 0.15,
      showTimeout: 20,
      hideOnLeave: true,
      hideTimeout: 300,
      hideMediaTimeout: 300,
    }

    // Merge options
    const finalOptions = { ...defaultOptions, ...options }

    try {
      // Create cursor instance and let Cuberto handle everything
      cursorInstance = new MouseFollower(finalOptions)
      isInitialized.current = true

      // Add custom brackets HTML after a short delay
      requestAnimationFrame(() => {
        const cursorEl = document.querySelector('.mf-cursor')
        if (cursorEl && !cursorEl.querySelector('.mf-cursor-brackets')) {
          const bracketsHTML = `
            <div class="mf-cursor-brackets">
              <div class="mf-cursor-bracket mf-cursor-bracket--tl">
                <span></span>
                <span></span>
              </div>
              <div class="mf-cursor-bracket mf-cursor-bracket--tr">
                <span></span>
                <span></span>
              </div>
              <div class="mf-cursor-bracket mf-cursor-bracket--bl">
                <span></span>
                <span></span>
              </div>
              <div class="mf-cursor-bracket mf-cursor-bracket--br">
                <span></span>
                <span></span>
              </div>
              <div class="mf-cursor-dot"></div>
            </div>
          `
          cursorEl.insertAdjacentHTML('afterbegin', bracketsHTML)
        }
      })
    } catch (error) {
      console.error('Failed to initialize MouseFollower:', error)
    }

    // Cleanup
    return () => {
      if (cursorInstance) {
        cursorInstance.destroy()
        cursorInstance = null
        isInitialized.current = false
      }
    }
  }, [options])

  return <>{children}</>
}

// Export utility functions for cursor control
export const cursor = {
  show: () => cursorInstance?.show(),
  hide: () => cursorInstance?.hide(),
  setText: (text: string) => cursorInstance?.setText(text),
  removeText: () => cursorInstance?.removeText(),
  setIcon: (icon: string) => cursorInstance?.setIcon(icon),
  removeIcon: () => cursorInstance?.removeIcon(),
  setImg: (src: string) => cursorInstance?.setImg(src),
  removeImg: () => cursorInstance?.removeImg(),
  setVideo: (src: string) => cursorInstance?.setVideo(src),
  removeVideo: () => cursorInstance?.removeVideo(),
  addState: (state: string) => cursorInstance?.addState(state),
  removeState: (state: string) => cursorInstance?.removeState(state),
  toggleState: (state: string) => cursorInstance?.toggleState?.(state),
  setStick: (el: HTMLElement) => cursorInstance?.setStick(el),
  removeStick: () => cursorInstance?.removeStick(),
  setSkewing: (value: number) => cursorInstance?.setSkewing(value),
  removeSkewing: () => cursorInstance?.removeSkewing(),
  destroy: () => cursorInstance?.destroy(),
}

// Hook for using cursor in components
export function useMouseFollower() {
  return cursor
}
