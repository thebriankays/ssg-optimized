'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import * as TWEEN from '@tweenjs/tween.js'
import './storytelling.scss'

export interface StoryChapter {
  id: string | number
  title: string
  content?: string
  dateTime?: string
  imageUrl?: string
  imageCredit?: string
  coords: { lat: number; lng: number }
  address?: string
  cameraOptions?: {
    position?: { x: number; y: number; z: number }
    heading?: number
    pitch?: number
    roll?: number
    zoom?: number
    tilt?: number
  }
  focusOptions?: {
    focusRadius?: number
    showFocus?: boolean
    showLocationMarker?: boolean
  }
}

export interface StorytellingConfig {
  properties: {
    title: string
    date?: string
    description?: string
    createdBy?: string
    imageUrl?: string
    imageCredit?: string
    cameraOptions?: any
  }
  chapters: StoryChapter[]
  appearance?: {
    theme?: 'light' | 'dark'
  }
}

interface StorytellingProps {
  config: StorytellingConfig
  apiKey: string
  mapId: string
  className?: string
}

export function Storytelling({ config, apiKey, mapId, className = '' }: StorytellingProps) {
  const mapRef = useRef<google.maps.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([])
  const animationRef = useRef<number | null>(null)
  const focusCircleRef = useRef<google.maps.Circle | null>(null)
  
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showLocationMarker, setShowLocationMarker] = useState(true)
  const [showFocusRadius, setShowFocusRadius] = useState(false)
  const [focusRadius, setFocusRadius] = useState(3000)
  
  const currentChapter = config.chapters[currentChapterIndex]

  // Animation loop for TWEEN
  useEffect(() => {
    const animate = (time: number) => {
      TWEEN.update(time)
      animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = async () => {
      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places', 'marker'],
        mapIds: [mapId],
      })

      try {
        const google = await loader.load()
        
        if (!mapContainerRef.current) return

        // Get initial location from first chapter or default
        const initialLocation = config.chapters[0]?.coords || { lat: 40.7128, lng: -74.0060 }

        // Create map with 3D tiles
        const map = new google.maps.Map(mapContainerRef.current, {
          center: initialLocation,
          zoom: 17,
          tilt: 65,
          heading: 0,
          mapId: mapId, // Required for 3D tiles
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          // Enable 3D controls
          tiltInteractionEnabled: true,
          headingInteractionEnabled: true,
        })
        
        mapRef.current = map

        // Create markers for all chapters
        await createChapterMarkers()

        // Fly to first chapter
        if (config.chapters.length > 0) {
          flyToChapter(0)
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error)
      }
    }

    initializeMap()

    return () => {
      clearMarkers()
      if (focusCircleRef.current) {
        focusCircleRef.current.setMap(null)
      }
    }
  }, [apiKey, mapId])

  // Create markers for all chapters
  const createChapterMarkers = useCallback(async () => {
    if (!mapRef.current) return

    clearMarkers()
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary

    config.chapters.forEach((chapter, index) => {
      if (!chapter.coords) return

      const isActive = index === currentChapterIndex
      const marker = new AdvancedMarkerElement({
        map: mapRef.current,
        position: chapter.coords,
        title: chapter.title,
        content: createMarkerContent(chapter, index + 1, isActive),
      })

      marker.addListener('click', () => {
        goToChapter(index)
      })

      markersRef.current.push(marker)
    })
  }, [config.chapters, currentChapterIndex])

  // Create marker content
  const createMarkerContent = (chapter: StoryChapter, number: number, isActive: boolean) => {
    const content = document.createElement('div')
    content.className = `story-marker ${isActive ? 'active' : ''}`
    content.innerHTML = `
      <div class="marker-number">${number}</div>
      <div class="marker-label">${chapter.title}</div>
    `
    return content
  }

  // Clear markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => {
      marker.map = null
    })
    markersRef.current = []
  }, [])

  // Fly to chapter with animation
  const flyToChapter = useCallback((index: number) => {
    const chapter = config.chapters[index]
    if (!chapter || !mapRef.current) return

    const from = {
      center: mapRef.current.getCenter()?.toJSON() || chapter.coords,
      zoom: mapRef.current.getZoom() || 17,
      tilt: mapRef.current.getTilt() || 65,
      heading: mapRef.current.getHeading() || 0,
    }

    const to = {
      center: chapter.coords,
      zoom: chapter.cameraOptions?.zoom || 17,
      tilt: chapter.cameraOptions?.tilt || (chapter.cameraOptions?.pitch ? -chapter.cameraOptions.pitch : 65),
      heading: chapter.cameraOptions?.heading || 0,
    }

    new TWEEN.Tween(from)
      .to(to, 3000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate((state) => {
        mapRef.current?.moveCamera(state)
      })
      .onComplete(() => {
        // Update focus radius if needed
        updateFocusRadius(chapter)
        // Update markers to show active state
        createChapterMarkers()
      })
      .start()
  }, [config.chapters, createChapterMarkers])

  // Update focus radius visualization
  const updateFocusRadius = useCallback((chapter: StoryChapter) => {
    if (!mapRef.current) return

    // Remove existing circle
    if (focusCircleRef.current) {
      focusCircleRef.current.setMap(null)
      focusCircleRef.current = null
    }

    // Add new circle if enabled
    const showFocus = chapter.focusOptions?.showFocus ?? showFocusRadius
    const radius = chapter.focusOptions?.focusRadius ?? focusRadius

    if (showFocus) {
      focusCircleRef.current = new google.maps.Circle({
        map: mapRef.current,
        center: chapter.coords,
        radius: radius,
        fillColor: '#4285F4',
        fillOpacity: 0.1,
        strokeColor: '#4285F4',
        strokeOpacity: 0.3,
        strokeWeight: 2,
      })
    }
  }, [showFocusRadius, focusRadius])

  // Go to specific chapter
  const goToChapter = useCallback((index: number) => {
    if (index >= 0 && index < config.chapters.length) {
      setCurrentChapterIndex(index)
      flyToChapter(index)
    }
  }, [config.chapters.length, flyToChapter])

  // Navigation functions
  const nextChapter = useCallback(() => {
    goToChapter(currentChapterIndex + 1)
  }, [currentChapterIndex, goToChapter])

  const prevChapter = useCallback(() => {
    goToChapter(currentChapterIndex - 1)
  }, [currentChapterIndex, goToChapter])

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return

    const timer = setTimeout(() => {
      if (currentChapterIndex < config.chapters.length - 1) {
        nextChapter()
      } else {
        setIsPlaying(false)
      }
    }, 5000) // 5 seconds per chapter

    return () => clearTimeout(timer)
  }, [isPlaying, currentChapterIndex, config.chapters.length, nextChapter])

  // Save camera position (for edit mode)
  const saveCameraPosition = useCallback(() => {
    if (!mapRef.current) return

    const camera = {
      center: mapRef.current.getCenter()?.toJSON(),
      zoom: mapRef.current.getZoom(),
      tilt: mapRef.current.getTilt(),
      heading: mapRef.current.getHeading(),
    }

    console.log('Camera position saved:', camera)
    // In a real implementation, this would save to the config
  }, [])

  return (
    <div className={`storytelling ${className} theme-${config.appearance?.theme || 'dark'}`}>
      {/* 3D Map */}
      <div ref={mapContainerRef} className="storytelling__map" />

      {/* Story Panel */}
      <div className="storytelling__panel">
        {/* Cover Page */}
        {currentChapterIndex === 0 && config.properties && (
          <div className="story-cover">
            {config.properties.imageUrl && (
              <img 
                src={config.properties.imageUrl} 
                alt={config.properties.title}
                className="cover-image"
              />
            )}
            <h1 className="story-title">{config.properties.title}</h1>
            {config.properties.date && (
              <div className="story-date">{config.properties.date}</div>
            )}
            {config.properties.description && (
              <p className="story-description">{config.properties.description}</p>
            )}
            {config.properties.createdBy && (
              <div className="story-author">By {config.properties.createdBy}</div>
            )}
            <button 
              onClick={() => goToChapter(1)}
              className="start-button"
            >
              Begin Interactive Story
            </button>
          </div>
        )}

        {/* Chapter Content */}
        {currentChapter && (
          <div className="chapter-content">
            {currentChapter.imageUrl && (
              <img 
                src={currentChapter.imageUrl} 
                alt={currentChapter.title}
                className="chapter-image"
              />
            )}
            <h2 className="chapter-title">{currentChapter.title}</h2>
            {currentChapter.dateTime && (
              <div className="chapter-date">{currentChapter.dateTime}</div>
            )}
            {currentChapter.content && (
              <div className="chapter-text">{currentChapter.content}</div>
            )}
            {currentChapter.address && (
              <div className="chapter-address">{currentChapter.address}</div>
            )}
            {currentChapter.imageCredit && (
              <div className="image-credit">Photo: {currentChapter.imageCredit}</div>
            )}
          </div>
        )}

        {/* Navigation Controls */}
        <div className="story-navigation">
          <button
            onClick={prevChapter}
            disabled={currentChapterIndex === 0}
            className="nav-button prev"
          >
            ← Previous
          </button>
          
          <div className="chapter-indicator">
            {currentChapterIndex + 1} / {config.chapters.length}
          </div>
          
          <button
            onClick={nextChapter}
            disabled={currentChapterIndex === config.chapters.length - 1}
            className="nav-button next"
          >
            Next →
          </button>
        </div>

        {/* Play Controls */}
        <div className="play-controls">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="play-button"
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
        </div>

        {/* Chapter List */}
        <div className="chapter-list">
          {config.chapters.map((chapter, index) => (
            <div
              key={chapter.id || index}
              className={`chapter-item ${index === currentChapterIndex ? 'active' : ''}`}
              onClick={() => goToChapter(index)}
            >
              <div className="chapter-number">{index + 1}</div>
              <div className="chapter-name">{chapter.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Controls (Admin Mode) */}
      {isEditMode && (
        <div className="edit-controls">
          <h3>Edit Chapter</h3>
          
          <label className="control-toggle">
            <input
              type="checkbox"
              checked={showLocationMarker}
              onChange={(e) => setShowLocationMarker(e.target.checked)}
            />
            <span>Display Location Marker</span>
          </label>

          <label className="control-toggle">
            <input
              type="checkbox"
              checked={showFocusRadius}
              onChange={(e) => {
                setShowFocusRadius(e.target.checked)
                updateFocusRadius(currentChapter)
              }}
            />
            <span>Display Radius Focus</span>
          </label>

          {showFocusRadius && (
            <div className="radius-control">
              <label>Focus Radius: {focusRadius}m</label>
              <input
                type="range"
                min="500"
                max="10000"
                step="500"
                value={focusRadius}
                onChange={(e) => {
                  setFocusRadius(Number(e.target.value))
                  updateFocusRadius(currentChapter)
                }}
              />
            </div>
          )}

          <button onClick={saveCameraPosition} className="save-button">
            Save Camera Position
          </button>
          
          <button onClick={() => setIsEditMode(false)} className="leave-edit-button">
            Leave Edit Mode
          </button>
        </div>
      )}

      {/* Edit Mode Toggle */}
      <button
        onClick={() => setIsEditMode(!isEditMode)}
        className="edit-toggle"
      >
        {isEditMode ? '✓' : '✏️'} Edit
      </button>
    </div>
  )
}
