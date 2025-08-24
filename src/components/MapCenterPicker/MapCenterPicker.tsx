'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useField, useAllFormFields } from '@payloadcms/ui'
import { loadGoogleMaps } from '@/lib/google-maps/loader'
import './MapCenterPicker.scss'

export const MapCenterPicker: React.FC = () => {
  const { value: enabled, setValue: setEnabled } = useField<boolean>({ path: 'areaExplorerConfig.customCenter.enabled' })
  const { value: lat, setValue: setLat } = useField<number>({ path: 'areaExplorerConfig.customCenter.lat' })
  const { value: lng, setValue: setLng } = useField<number>({ path: 'areaExplorerConfig.customCenter.lng' })
  const { value: desc, setValue: setDesc } = useField<string>({ path: 'areaExplorerConfig.customCenter.description' })
  
  // Get destination coordinates
  const [allFields] = useAllFormFields()
  const destLat = allFields?.lat?.value as number
  const destLng = allFields?.lng?.value as number
  const destTitle = allFields?.title?.value as string
  
  const mapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showMap, setShowMap] = useState(false)

  const initializeMap = useCallback(async () => {
    try {
      await loadGoogleMaps()
      
      if (!mapRef.current || !window.google) return
      
      // Use custom center if set, otherwise use destination coordinates
      const centerLat = (enabled && lat) ? lat : destLat || 0
      const centerLng = (enabled && lng) ? lng : destLng || 0
      
      // Initialize map
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 13,
        mapTypeId: 'roadmap',
        streetViewControl: true,
        mapTypeControl: true,
        fullscreenControl: true,
      })
      
      // Add marker
      markerRef.current = new google.maps.Marker({
        position: { lat: centerLat, lng: centerLng },
        map: mapInstanceRef.current,
        draggable: true,
        title: desc || 'Map Center',
        animation: google.maps.Animation.DROP,
      })
      
      // Update coordinates when marker is dragged
      markerRef.current.addListener('dragend', () => {
        const position = markerRef.current?.getPosition()
        if (position) {
          setEnabled(true)
          setLat(position.lat())
          setLng(position.lng())
        }
      })
      
      // Update coordinates when map is clicked
      mapInstanceRef.current.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng && markerRef.current) {
          markerRef.current.setPosition(event.latLng)
          setEnabled(true)
          setLat(event.latLng.lat())
          setLng(event.latLng.lng())
        }
      })
      
      // Initialize autocomplete
      if (inputRef.current) {
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['geocode', 'establishment'],
          fields: ['geometry', 'formatted_address', 'name', 'place_id']
        })
        
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace()
          
          if (place?.geometry?.location) {
            const newLat = place.geometry.location.lat()
            const newLng = place.geometry.location.lng()
            
            setEnabled(true)
            setLat(newLat)
            setLng(newLng)
            setDesc(place.name || place.formatted_address || 'Custom location')
            
            // Update map and marker
            if (mapInstanceRef.current && markerRef.current) {
              const newPosition = { lat: newLat, lng: newLng }
              mapInstanceRef.current.setCenter(newPosition)
              mapInstanceRef.current.setZoom(15)
              markerRef.current.setPosition(newPosition)
            }
          }
        })
      }
      
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to initialize map:', error)
      setIsLoading(false)
    }
  }, [enabled, lat, lng, desc, destLat, destLng, setEnabled, setLat, setLng, setDesc])

  useEffect(() => {
    if (showMap) {
      initializeMap()
    }
    
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
      if (markerRef.current) {
        google.maps.event.clearInstanceListeners(markerRef.current)
      }
      if (mapInstanceRef.current) {
        google.maps.event.clearInstanceListeners(mapInstanceRef.current)
      }
    }
  }, [showMap, initializeMap])
  
  // Update marker position when coordinates change
  useEffect(() => {
    if (markerRef.current && lat && lng) {
      markerRef.current.setPosition({ lat, lng })
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setCenter({ lat, lng })
      }
    }
  }, [lat, lng])

  return (
    <div className="map-center-picker">
      <div className="picker-header">
        <label>Search for Location or Click Map</label>
        <button
          type="button"
          className="toggle-map-btn"
          onClick={() => setShowMap(!showMap)}
        >
          {showMap ? 'Hide Map' : 'Show Map'}
        </button>
      </div>
      
      <div className="search-container">
        <input
          ref={inputRef}
          type="text"
          placeholder="e.g., Eiffel Tower, Times Square, City Center"
          disabled={isLoading}
          className="location-search"
        />
      </div>
      
      {enabled && lat && lng && (
        <div className="current-center">
          <strong>Current Center:</strong> {desc || 'Custom location'}
          <br />
          <small>Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}</small>
          <button
            type="button"
            className="reset-btn"
            onClick={() => {
              setEnabled(false)
              setLat(destLat)
              setLng(destLng)
              setDesc('')
              if (markerRef.current && destLat && destLng) {
                markerRef.current.setPosition({ lat: destLat, lng: destLng })
                mapInstanceRef.current?.setCenter({ lat: destLat, lng: destLng })
              }
            }}
          >
            Reset to Default
          </button>
        </div>
      )}
      
      {showMap && (
        <div className="map-container">
          <div ref={mapRef} className="map-canvas" />
          {isLoading && (
            <div className="map-loading">
              Loading map...
            </div>
          )}
        </div>
      )}
      
      <p className="help-text">
        {showMap 
          ? 'Click on the map or drag the marker to set a custom center point. This will be the focal point for the 3D map view.'
          : 'Use this to center the 3D map on a specific landmark or area instead of the general destination coordinates.'
        }
      </p>
    </div>
  )
}

export default MapCenterPicker