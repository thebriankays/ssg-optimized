'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { APIProvider, Map, AdvancedMarker, Marker } from '@vis.gl/react-google-maps'
import { ViewportScrollScene } from '@14islands/r3f-scroll-rig'
import { GoogleMaps3DTiles } from './GoogleMaps3DTiles'
import { useAnimationFrame } from '@/hooks/useAnimationFrame'
import { GlassCard } from '@/components/ui/glass/GlassCard'
import { motion, AnimatePresence } from 'framer-motion'
import type { Location, POI, Tour, AreaExplorerConfig } from './types'

interface AreaExplorerProps {
  config: AreaExplorerConfig
  pois?: POI[]
  tours?: Tour[]
  apiKey: string
  className?: string
  onPOIClick?: (poi: POI) => void
  onLocationChange?: (location: Location) => void
}

export function AreaExplorer({
  config,
  pois = [],
  tours = [],
  apiKey,
  className = '',
  onPOIClick,
  onLocationChange,
}: AreaExplorerProps) {
  const mapRef = useRef<google.maps.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null)
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0)
  const [tourProgress, setTourProgress] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [show3D, setShow3D] = useState(config.enable3D !== false)
  
  // Handle POI selection
  const handlePOIClick = useCallback((poi: POI) => {
    setSelectedPOI(poi)
    onPOIClick?.(poi)
    
    // Pan to POI location
    if (mapRef.current) {
      mapRef.current.panTo({ 
        lat: poi.location.lat, 
        lng: poi.location.lng 
      })
      mapRef.current.setZoom(18)
    }
  }, [onPOIClick])
  
  // Start tour
  const startTour = useCallback((tour: Tour) => {
    setSelectedTour(tour)
    setIsPlaying(true)
    setCurrentWaypointIndex(0)
    setTourProgress(0)
  }, [])
  
  // Stop tour
  const stopTour = useCallback(() => {
    setIsPlaying(false)
    setSelectedTour(null)
    setCurrentWaypointIndex(0)
    setTourProgress(0)
  }, [])
  
  // Tour animation
  useAnimationFrame((deltaTime) => {
    if (!isPlaying || !selectedTour || !mapRef.current) return
    
    const currentWaypoint = selectedTour.waypoints[currentWaypointIndex]
    const nextWaypoint = selectedTour.waypoints[currentWaypointIndex + 1]
    
    if (!currentWaypoint) {
      stopTour()
      return
    }
    
    // Update progress
    const waypointDuration = currentWaypoint.duration || 5
    const transitionDuration = currentWaypoint.transitionDuration || 3
    const totalDuration = waypointDuration + (nextWaypoint ? transitionDuration : 0)
    
    setTourProgress((prev) => {
      const newProgress = prev + (deltaTime / 1000) / totalDuration
      
      if (newProgress >= 1) {
        // Move to next waypoint
        if (nextWaypoint) {
          setCurrentWaypointIndex(currentWaypointIndex + 1)
          
          // Pan to next waypoint
          mapRef.current?.panTo({
            lat: nextWaypoint.location.lat,
            lng: nextWaypoint.location.lng
          })
          
          return 0
        } else {
          // Tour finished
          stopTour()
          return 1
        }
      }
      
      return newProgress
    })
  }, isPlaying)
  
  return (
    <APIProvider apiKey={apiKey}>
      <div className={`area-explorer ${className}`} ref={mapContainerRef}>
        {/* 2D Map */}
        <div className="area-explorer__map">
          <Map
            mapId={config.mapId}
            defaultCenter={{
              lat: config.defaultLocation.lat,
              lng: config.defaultLocation.lng
            }}
            defaultZoom={15}
            defaultTilt={config.defaultLocation.tilt || 60}
            defaultHeading={config.defaultLocation.heading || 0}
            disableDefaultUI={true}
            gestureHandling={config.gestureHandling || 'greedy'}
            onCameraChanged={(event) => {
              mapRef.current = event.map
              if (event.detail) {
                const { center, zoom, tilt, heading } = event.detail
                if (center) {
                  onLocationChange?.({
                    lat: center.lat,
                    lng: center.lng,
                    altitude: 0,
                    heading: heading || 0,
                    tilt: tilt || 0,
                    range: zoom ? 1000 * Math.pow(2, 20 - zoom) : 1000,
                  })
                }
              }
            }}
          >
            {/* POI Markers */}
            {pois.map((poi) => (
              <AdvancedMarker
                key={poi.id}
                position={{ lat: poi.location.lat, lng: poi.location.lng }}
                onClick={() => handlePOIClick(poi)}
                title={poi.name}
              >
                <div className="area-explorer__marker">
                  {poi.icon && (
                    <img 
                      src={poi.icon} 
                      alt={poi.name}
                      style={{ width: 32, height: 32 }}
                    />
                  )}
                  <span>{poi.name}</span>
                </div>
              </AdvancedMarker>
            ))}
            
            {/* Tour waypoint markers */}
            {selectedTour && selectedTour.waypoints.map((waypoint, index) => (
              <Marker
                key={`waypoint-${index}`}
                position={{ lat: waypoint.location.lat, lng: waypoint.location.lng }}
                title={waypoint.name || `Waypoint ${index + 1}`}
                opacity={index === currentWaypointIndex ? 1 : 0.5}
              />
            ))}
          </Map>
        </div>
        
        {/* 3D Overlay */}
        {show3D && mapContainerRef.current && (
          <ViewportScrollScene
            track={mapContainerRef as React.MutableRefObject<HTMLElement>}
            hideOffscreen={false}
          >
            {() => (
              <GoogleMaps3DTiles
                apiKey={apiKey}
                center={{
                  lat: config.defaultLocation.lat,
                  lng: config.defaultLocation.lng,
                }}
                zoom={15}
                tilt={config.defaultLocation.tilt || 60}
                heading={config.defaultLocation.heading || 0}
              />
            )}
          </ViewportScrollScene>
        )}
        
        {/* Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="area-explorer__controls"
            >
              <GlassCard
                variant="frosted"
                className="area-explorer__panel"
              >
                {/* 3D Toggle */}
                <div className="area-explorer__3d-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={show3D}
                      onChange={(e) => setShow3D(e.target.checked)}
                    />
                    Show 3D View
                  </label>
                </div>
                
                {/* Tour Selection */}
                {tours.length > 0 && (
                  <div className="area-explorer__tours">
                    <h3>Guided Tours</h3>
                    <div className="area-explorer__tour-list">
                      {tours.map((tour) => (
                        <button
                          key={tour.id}
                          onClick={() => startTour(tour)}
                          disabled={isPlaying}
                          className={`area-explorer__tour-item ${
                            selectedTour?.id === tour.id ? 'active' : ''
                          }`}
                        >
                          <span className="name">{tour.name}</span>
                          {tour.duration && (
                            <span className="duration">
                              {Math.round(tour.duration / 60)}min
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* POI List */}
                {pois.length > 0 && (
                  <div className="area-explorer__pois">
                    <h3>Points of Interest</h3>
                    <div className="area-explorer__poi-list">
                      {pois.map((poi) => (
                        <button
                          key={poi.id}
                          onClick={() => handlePOIClick(poi)}
                          className={`area-explorer__poi-item ${
                            selectedPOI?.id === poi.id ? 'active' : ''
                          }`}
                        >
                          <span className="name">{poi.name}</span>
                          {poi.category && (
                            <span className="category">{poi.category}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Tour Controls */}
                {isPlaying && selectedTour && (
                  <div className="area-explorer__tour-controls">
                    <div className="area-explorer__tour-info">
                      <h4>{selectedTour.name}</h4>
                      <p>
                        {selectedTour.waypoints[currentWaypointIndex]?.name || 
                         `Waypoint ${currentWaypointIndex + 1}`}
                      </p>
                    </div>
                    <div className="area-explorer__tour-progress">
                      <div 
                        className="progress-bar"
                        style={{ width: `${tourProgress * 100}%` }}
                      />
                    </div>
                    <button
                      onClick={stopTour}
                      className="area-explorer__stop-button"
                    >
                      Stop Tour
                    </button>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Toggle Controls Button */}
        <button
          onClick={() => setShowControls(!showControls)}
          className="area-explorer__toggle"
        >
          {showControls ? 'Hide' : 'Show'} Controls
        </button>
        
        {/* POI Detail Panel */}
        <AnimatePresence>
          {selectedPOI && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="area-explorer__detail"
            >
              <GlassCard variant="frosted">
                <button
                  onClick={() => setSelectedPOI(null)}
                  className="area-explorer__close"
                >
                  ×
                </button>
                
                {selectedPOI.image && (
                  <img 
                    src={selectedPOI.image} 
                    alt={selectedPOI.name}
                    className="area-explorer__detail-image"
                  />
                )}
                
                <h3>{selectedPOI.name}</h3>
                {selectedPOI.category && (
                  <span className="category">{selectedPOI.category}</span>
                )}
                {selectedPOI.description && (
                  <p>{selectedPOI.description}</p>
                )}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </APIProvider>
  )
}