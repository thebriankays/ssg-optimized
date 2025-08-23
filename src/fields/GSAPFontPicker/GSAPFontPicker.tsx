'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useField } from '@payloadcms/ui'
import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import { InertiaPlugin } from 'gsap/InertiaPlugin'

// Register plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(Draggable, InertiaPlugin)
}
import type { TextFieldClientComponent } from 'payload'
import './GSAPFontPicker.scss'

// Import the font registry
import { FONT_REGISTRY, type FontConfig } from '../../fonts/font-registry'

interface FontPickerValue {
  family: string
  weight?: string
  style?: string
  size?: number
  lineHeight?: number
  letterSpacing?: number
}

export const GSAPFontPicker: TextFieldClientComponent = ({ field, path }) => {
  const { value, setValue } = useField<FontPickerValue>({ path })
  const [showPicker, setShowPicker] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const rolodexRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const animationRef = useRef<GSAPAnimation | null>(null)
  const dragRef = useRef<Draggable | null>(null)

  // Parse the font data
  const fonts = FONT_REGISTRY.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))

  // Get current font index
  const currentFontIndex = fonts.findIndex(f => f.family === value?.family)

  // Load actual font only when selected (like the example)
  const loadActualFont = useCallback((font: FontConfig) => {
    if (typeof window === 'undefined' || !font) return

    const fontId = `google-font-${font.id}`
    const existingLink = document.getElementById(fontId)
    
    if (!existingLink && font.type === 'google') {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.id = fontId
      link.href = `https://fonts.googleapis.com/css2?family=${font.family.replace(/ /g, '+')}:wght@${font.weights.join(';')}&display=swap`
      document.head.appendChild(link)
    }
    // Local fonts are already available via Next.js
  }, [])

  // Handle font selection
  const selectFont = useCallback((font: FontConfig) => {
    const newValue: FontPickerValue = {
      family: font.family,
      weight: font.weights.includes('400') ? '400' : font.weights[0],
      style: 'normal',
      size: value?.size || 16,
      lineHeight: value?.lineHeight || 1.5,
      letterSpacing: value?.letterSpacing || 0
    }
    
    setValue(newValue)
    loadActualFont(font) // Only load when actually selected
  }, [value, setValue, loadActualFont])

  // Generate preview image style (like the example)
  const getFontPreviewStyle = useCallback((font: FontConfig) => {
    // This would use pre-generated font preview images
    // For now, we'll create a CSS class-based system
    return {
      backgroundImage: `url('/font-previews/${font.id}.svg')`, // Would be pre-generated
      backgroundSize: '30em auto',
      backgroundRepeat: 'no-repeat',
      height: '2em',
      imageRendering: 'optimizeQuality' as const
    }
  }, [])

  // Get font style for actual display (selected font)
  const getActualFontStyle = useCallback((font: FontConfig) => {
    if (font.type === 'local') {
      return `var(${font.variable}), ${font.category}`
    } else {
      return `"${font.family}", ${font.category}`
    }
  }, [])

  // Initialize rolodex with EXACT original CodePen logic
  useEffect(() => {
    if (!showPicker || !rolodexRef.current || !listRef.current) return

    console.log('Initializing image-based 3D rolodex...')

    const initRolodex = () => {
      const slides = gsap.utils.toArray('.font-item') as HTMLElement[]
      console.log('Found font items:', slides.length)
      
      if (slides.length === 0) {
        setTimeout(initRolodex, 100)
        return
      }

      const slideCount = slides.length
      const itemH = 64
      const wrapH = slideCount * itemH
      const wrapVal = gsap.utils.wrap(0, wrapH)
      const r = (slideCount * itemH) / (2 * Math.PI)

      console.log('Rolodex config:', { slideCount, itemH, wrapH, r })

      // Set rolodex height - EXACTLY like original
      gsap.set(rolodexRef.current, { height: `${2 * Math.round(r)}px` })

      // Position slides in 3D cylinder - EXACTLY like original
      slides.forEach((slide, i) => {
        gsap.set(slide, {
          yPercent: -50,
          y: r,
          z: r,
          rotateX: `${i * (360 / slideCount)}deg`,
          transformOrigin: `50% 50% -${r}px`
        })
      })

      // Create the rotation animation - EXACTLY like original
      const animation = gsap.to(slides, {
        duration: 1,
        rotateX: '-=360deg',
        ease: 'none',
        paused: true
      })

      animationRef.current = animation

      // Create proxy div for dragging - EXACTLY like original
      const proxy = document.createElement('div')

      // Update function - EXACTLY like original
      function updateProgress(this: any) {
        const progress = wrapVal(this.y) / wrapH
        animation.progress(progress)
        
        // Update selected index
        const newIndex = Math.round(progress * slideCount) % slideCount
        setSelectedIndex(newIndex)
        
        // Update active states
        slides.forEach((slide, idx) => {
          if (idx === newIndex) {
            slide.classList.add('active')
          } else {
            slide.classList.remove('active')
          }
        })
      }

      // Create draggable - EXACTLY like original
      const drag = Draggable.create(proxy, {
        type: 'y',
        trigger: listRef.current,
        inertia: true,
        onDrag: updateProgress,
        onThrowUpdate: updateProgress,
        snap: {
          y: (y: number) => {
            return Math.round(y / itemH) * itemH
          }
        },
        onThrowComplete: function() {
          const progress = wrapVal(this.y) / wrapH
          const newIndex = Math.round(progress * slideCount) % slideCount
          const selectedFont = fonts[newIndex]
          if (selectedFont) {
            selectFont(selectedFont)
          }
        }
      })[0]

      dragRef.current = drag

      console.log('3D rolodex initialized successfully')

      // Set initial position
      if (currentFontIndex >= 0) {
        const targetY = currentFontIndex * itemH
        gsap.set(proxy, { y: targetY })
        updateProgress.call({ y: targetY })
      } else {
        updateProgress.call({ y: 0 })
      }
    }

    // Initialize after DOM is ready
    requestAnimationFrame(initRolodex)

    return () => {
      console.log('Cleaning up 3D rolodex...')
      animationRef.current?.kill()
      dragRef.current?.kill()
      animationRef.current = null
      dragRef.current = null
    }
  }, [showPicker, fonts, currentFontIndex, selectFont])

  // Get current font
  const currentFont = fonts.find(f => f.family === value?.family)

  return (
    <div className="gsap-font-picker-wrapper">
      <label className="field-label">{typeof field.label === 'string' ? field.label : 'Font'}</label>
      
      {/* Current Selection Display - Shows actual font */}
      <div className="current-selection" onClick={() => setShowPicker(!showPicker)}>
        <div className="selection-preview">
          {currentFont ? (
            <>
              <span 
                className="font-name"
                style={{ 
                  fontFamily: getActualFontStyle(currentFont)
                }}
              >
                {currentFont.displayName}
              </span>
              <span className="selection-details">
                {value?.weight} • {value?.size}px
              </span>
            </>
          ) : (
            <span className="placeholder">Select a font...</span>
          )}
        </div>
        <div className="dropdown-arrow">▼</div>
      </div>

      {/* Image-based 3D Rolodex Picker */}
      {showPicker && (
        <div className="font-picker-overlay" onClick={() => setShowPicker(false)}>
          <div className="font-picker-container" onClick={(e) => e.stopPropagation()}>
            <div className="picker-header">
              <h3>Select Font</h3>
              <button className="close-btn" onClick={() => setShowPicker(false)}>×</button>
            </div>
            
            <div className="rolodex" ref={rolodexRef}>
              <ul ref={listRef}>
                {fonts.map((font, index) => (
                  <li 
                    key={font.id}
                    className={`font-item font-preview-${font.id} ${index === selectedIndex ? 'active' : ''}`}
                    onClick={() => {
                      selectFont(font)
                      setShowPicker(false)
                    }}
                  >
                    {/* Use background image for preview, with text fallback */}
                    <div className="font-preview-container">
                      <span className="font-preview-fallback">
                        {font.displayName}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="picker-info">
              <p>Drag to browse • Click to select</p>
              {fonts[selectedIndex] && (
                <div className="font-details">
                  <span className="category">{fonts[selectedIndex].category}</span>
                  <span className="weights">{fonts[selectedIndex].weights.length} weights</span>
                  <span className="type">{fonts[selectedIndex].type}</span>
                </div>
              )}
            </div>

            {/* Font Settings */}
            {currentFont && (
              <div className="font-settings-compact">
                <div className="setting-row">
                  <label>Weight</label>
                  <select
                    value={value?.weight || '400'}
                    onChange={(e) => {
                      if (value) {
                        setValue({ ...value, weight: e.target.value })
                      }
                    }}
                  >
                    {currentFont.weights.map(weight => (
                      <option key={weight} value={weight}>{weight}</option>
                    ))}
                  </select>
                  
                  <label>Size</label>
                  <input
                    type="number"
                    min="8"
                    max="96"
                    value={value?.size || 16}
                    onChange={(e) => {
                      const size = Number(e.target.value)
                      if (value) {
                        setValue({ ...value, size })
                      }
                    }}
                  />
                  <span className="size-unit">px</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
