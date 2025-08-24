'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import * as TWEEN from '@tweenjs/tween.js'
import './area-explorer.scss'

export interface AreaExplorerConfig {
  location: {
    coordinates: { lat: number; lng: number }
    name?: string
    description?: string
  }
  camera: {
    orbitType: 'fixed-orbit' | 'dynamic-orbit'
    speed: number // revolutions per minute
  }
  poi: {
    types: string[]
    density: number
    searchRadius: number
  }
}

interface AreaExplorerProps {
  config: AreaExplorerConfig
  apiKey: string
  mapId: string
  className?: string
}

interface CameraState {
  center: google.maps.LatLngLiteral
  zoom: number
  tilt: number
  heading: number
}

export function AreaExplorer({ config, apiKey, mapId, className = '' }: AreaExplorerProps) {
  const mapRef = useRef<google.maps.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([])
  const animationRef = useRef<number | null>(null)
  const orbitTweenRef = useRef<TWEEN.Tween<any> | null>(null)
  
  const [activeTypes, setActiveTypes] = useState<string[]>(config.poi.types)
  const [places, setPlaces] = useState<google.maps.places.PlaceResult[]>([])
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null)
  const [isOrbiting, setIsOrbiting] = useState(true)
  const [currentLocation, setCurrentLocation] = useState(config.location.coordinates)

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

        // Create map with 3D tiles
        const map = new google.maps.Map(mapContainerRef.current, {
          center: config.location.coordinates,
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
        placesServiceRef.current = new google.maps.places.PlacesService(map)

        // Initialize autocomplete
        if (searchInputRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
            fields: ['geometry', 'name', 'formatted_address'],
          })
          
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace()
            if (place.geometry?.location) {
              const lat = place.geometry.location.lat()
              const lng = place.geometry.location.lng()
              const newLocation = { lat, lng }
              setCurrentLocation(newLocation)
              flyToLocation(newLocation, 2000)
              searchNearbyPlaces(newLocation)
            }
          })
        }

        // Start orbit if enabled
        if (isOrbiting) {
          startOrbit()
        }

        // Initial place search
        searchNearbyPlaces(config.location.coordinates)
      } catch (error) {
        console.error('Error loading Google Maps:', error)
      }
    }

    initializeMap()

    return () => {
      stopOrbit()
      clearMarkers()
    }
  }, [apiKey, mapId, config.location.coordinates])

  // Fly to location with smooth animation
  const flyToLocation = useCallback((location: { lat: number; lng: number }, duration: number = 2000) => {
    if (!mapRef.current) return

    const from: CameraState = {
      center: mapRef.current.getCenter()?.toJSON() || config.location.coordinates,
      zoom: mapRef.current.getZoom() || 17,
      tilt: mapRef.current.getTilt() || 65,
      heading: mapRef.current.getHeading() || 0,
    }

    const to: CameraState = {
      center: location,
      zoom: 18,
      tilt: 65,
      heading: from.heading,
    }

    new TWEEN.Tween(from)
      .to(to, duration)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate((state) => {
        mapRef.current?.moveCamera(state)
      })
      .start()
  }, [config.location.coordinates])

  // Start orbit animation
  const startOrbit = useCallback(() => {
    if (!mapRef.current || orbitTweenRef.current) return

    const orbitSpeed = config.camera.speed * 6 // degrees per second
    let currentHeading = mapRef.current.getHeading() || 0

    const updateOrbit = () => {
      if (!mapRef.current || !isOrbiting) return

      currentHeading = (currentHeading + orbitSpeed / 60) % 360 // 60fps

      let tilt = 65
      let zoom = 17

      if (config.camera.orbitType === 'dynamic-orbit') {
        // Add sine wave variation for dynamic orbit
        const time = Date.now() / 1000
        const sinePhase = (time * config.camera.speed * 0.1) % (2 * Math.PI)
        tilt = 65 + 10 * Math.sin(sinePhase) // Vary tilt ±10 degrees
        zoom = 17 + 0.5 * Math.sin(sinePhase) // Vary zoom ±0.5
      }

      mapRef.current.moveCamera({
        heading: currentHeading,
        tilt,
        zoom,
      })

      requestAnimationFrame(updateOrbit)
    }

    updateOrbit()
  }, [config.camera.orbitType, config.camera.speed, isOrbiting])

  // Stop orbit
  const stopOrbit = useCallback(() => {
    if (orbitTweenRef.current) {
      orbitTweenRef.current.stop()
      orbitTweenRef.current = null
    }
  }, [])

  // Clear markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => {
      marker.map = null
    })
    markersRef.current = []
  }, [])

  // Search for nearby places
  const searchNearbyPlaces = useCallback((location: { lat: number; lng: number }) => {
    if (!placesServiceRef.current || !mapRef.current) return

    clearMarkers()
    const allPlaces: google.maps.places.PlaceResult[] = []
    let completedRequests = 0

    activeTypes.forEach((type) => {
      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius: config.poi.searchRadius,
        type: type as any,
      }

      placesServiceRef.current!.nearbySearch(request, (results, status) => {
        completedRequests++
        
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const limitedResults = results.slice(0, Math.ceil(config.poi.density / activeTypes.length))
          allPlaces.push(...limitedResults)
        }

        if (completedRequests === activeTypes.length) {
          // All requests completed
          const finalPlaces = allPlaces.slice(0, config.poi.density)
          setPlaces(finalPlaces)
          createMarkers(finalPlaces)
        }
      })
    })
  }, [activeTypes, config.poi.density, config.poi.searchRadius])

  // Create markers for places
  const createMarkers = useCallback(async (places: google.maps.places.PlaceResult[]) => {
    if (!mapRef.current) return

    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary

    places.forEach((place) => {
      if (!place.geometry?.location) return

      const marker = new AdvancedMarkerElement({
        map: mapRef.current,
        position: place.geometry.location,
        title: place.name,
        content: createMarkerContent(place),
      })

      marker.addListener('click', () => {
        handlePlaceClick(place)
      })

      markersRef.current.push(marker)
    })
  }, [])

  // Create marker content
  const createMarkerContent = (place: google.maps.places.PlaceResult) => {
    const content = document.createElement('div')
    content.className = 'marker-content'
    content.innerHTML = `
      <div class="marker-pin">
        <div class="marker-label">${place.name}</div>
      </div>
    `
    return content
  }

  // Toggle POI type
  const toggleType = useCallback((type: string) => {
    setActiveTypes((prev) => {
      const newTypes = prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
      
      // Re-search with new types
      setTimeout(() => searchNearbyPlaces(currentLocation), 0)
      
      return newTypes
    })
  }, [currentLocation, searchNearbyPlaces])

  // Handle place selection
  const handlePlaceClick = useCallback((place: google.maps.places.PlaceResult) => {
    setSelectedPlace(place)
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      flyToLocation({ lat, lng }, 1500)
    }
  }, [flyToLocation])

  // Handle orbit toggle
  useEffect(() => {
    if (isOrbiting) {
      startOrbit()
    } else {
      stopOrbit()
    }
  }, [isOrbiting, startOrbit, stopOrbit])

  return (
    <div className={`area-explorer ${className}`}>
      {/* 3D Map */}
      <div ref={mapContainerRef} className="area-explorer__map" />

      {/* Control Panel */}
      <div className="area-explorer__sidebar">
        <div className="control-panel">
          <h2>{config.location.name || 'Area Explorer'}</h2>
          {config.location.description && (
            <p className="location-description">{config.location.description}</p>
          )}

          {/* Location Search */}
          <div className="section">
            <h3>Location Search</h3>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for a location..."
              className="search-input"
            />
          </div>

          {/* POI Types */}
          <div className="section">
            <h3>Points of Interest</h3>
            <div className="poi-types">
              {config.poi.types.map((type) => (
                <button
                  key={type}
                  className={`poi-type-btn ${activeTypes.includes(type) ? 'active' : ''}`}
                  onClick={() => toggleType(type)}
                >
                  {type.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Controls */}
          <div className="section">
            <h3>Camera Controls</h3>
            <label className="control-toggle">
              <input
                type="checkbox"
                checked={isOrbiting}
                onChange={(e) => setIsOrbiting(e.target.checked)}
              />
              <span>Auto Orbit</span>
            </label>
            <div className="camera-info">
              <div>Orbit Type: <strong>{config.camera.orbitType.replace('-', ' ')}</strong></div>
              <div>Speed: <strong>{config.camera.speed} RPM</strong></div>
            </div>
          </div>

          {/* Camera Actions */}
          <div className="section">
            <div className="camera-actions">
              <button
                onClick={() => {
                  if (mapRef.current) {
                    const heading = mapRef.current.getHeading() || 0
                    mapRef.current.moveCamera({ heading: heading - 30 })
                  }
                }}
                className="action-btn"
              >
                ⟲ Rotate Left
              </button>
              <button
                onClick={() => {
                  if (mapRef.current) {
                    const heading = mapRef.current.getHeading() || 0
                    mapRef.current.moveCamera({ heading: heading + 30 })
                  }
                }}
                className="action-btn"
              >
                Rotate Right ⟳
              </button>
              <button
                onClick={() => {
                  if (mapRef.current) {
                    const tilt = mapRef.current.getTilt() || 65
                    mapRef.current.moveCamera({ tilt: Math.min(80, tilt + 10) })
                  }
                }}
                className="action-btn"
              >
                Tilt Up
              </button>
              <button
                onClick={() => {
                  if (mapRef.current) {
                    const tilt = mapRef.current.getTilt() || 65
                    mapRef.current.moveCamera({ tilt: Math.max(0, tilt - 10) })
                  }
                }}
                className="action-btn"
              >
                Tilt Down
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Places List */}
      {places.length > 0 && (
        <div className="area-explorer__places">
          <h3>Nearby Places ({places.length})</h3>
          <div className="places-list">
            {places.map((place, index) => (
              <div
                key={`${place.place_id}-${index}`}
                className={`place-item ${selectedPlace?.place_id === place.place_id ? 'active' : ''}`}
                onClick={() => handlePlaceClick(place)}
              >
                <div className="place-name">{place.name}</div>
                {place.rating && (
                  <div className="place-rating">★ {place.rating}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Place Details */}
      {selectedPlace && (
        <div className="area-explorer__detail">
          <button
            className="close-btn"
            onClick={() => setSelectedPlace(null)}
          >
            ×
          </button>
          <h2>{selectedPlace.name}</h2>
          <p className="place-address">{selectedPlace.vicinity}</p>
          {selectedPlace.rating && (
            <div className="rating">
              ★ {selectedPlace.rating} 
              {selectedPlace.user_ratings_total && (
                <span> ({selectedPlace.user_ratings_total} reviews)</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
