'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { ViewportScrollScene } from '@/components/canvas/ViewportScrollScene'
import { UseCanvas } from '@14islands/r3f-scroll-rig'
import { TravelDataGlobeR3F, GlobeRef } from './TravelDataGlobeR3F'
import { 
  GlobeView, 
  TravelAdvisory, 
  VisaRequirement, 
  Airport, 
  MichelinRestaurant,
  Country,
  GeoFeature,
  GlobePoint
} from './types'
import { 
  processTravelAdvisories,
  processVisaRequirements,
  airportsToGlobePoints,
  restaurantsToGlobePoints,
  searchAirports,
  searchRestaurants,
  getCountryCentroid
} from './utils/dataProcessing'
import { normalizeCountryName } from '@/lib/country-mappings'
import { GlassCard } from '@/components/ui/glass/GlassCard'
import { motion, AnimatePresence } from 'framer-motion'

interface TravelDataGlobeProps {
  features: GeoFeature[]
  advisories: TravelAdvisory[]
  visaRequirements: VisaRequirement[]
  airports: Airport[]
  restaurants: MichelinRestaurant[]
  countries: Country[]
  className?: string
  glassSettings?: {
    tint?: string
    opacity?: number
    blur?: number
  }
}

export function TravelDataGlobe({
  features,
  advisories,
  visaRequirements,
  airports,
  restaurants,
  countries,
  className = '',
  glassSettings = {
    tint: '#000000',
    opacity: 0.8,
    blur: 10,
  }
}: TravelDataGlobeProps) {
  const globeRef = useRef<GlobeRef>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<GlobeView>('advisories')
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [selectedPoint, setSelectedPoint] = useState<GlobePoint | null>(null)
  const [hoveredPoint, setHoveredPoint] = useState<GlobePoint | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  
  // Process data for current view
  const advisoryMap = useMemo(() => 
    processTravelAdvisories(advisories, features), 
    [advisories, features]
  )
  
  const visaMap = useMemo(() => 
    selectedCountry ? processVisaRequirements(visaRequirements, selectedCountry) : new Map(),
    [visaRequirements, selectedCountry]
  )
  
  const globePoints = useMemo(() => {
    if (view === 'airports') {
      const filtered = searchTerm ? searchAirports(airports, searchTerm) : airports
      return airportsToGlobePoints(filtered.slice(0, 50)) // Limit for performance
    } else if (view === 'michelin') {
      const filtered = searchTerm ? searchRestaurants(restaurants, searchTerm) : restaurants
      return restaurantsToGlobePoints(filtered.slice(0, 100)) // Limit for performance
    }
    return []
  }, [view, airports, restaurants, searchTerm])
  
  // Handle country selection
  const handleCountryClick = (countryName: string) => {
    setSelectedCountry(countryName)
    setShowDetails(true)
    
    // Find country centroid and focus camera
    const feature = features.find(f => f.properties.NAME === countryName)
    if (feature && globeRef.current) {
      const centroid = getCountryCentroid(feature)
      if (centroid) {
        globeRef.current.pointOfView({
          lat: centroid[1],
          lng: centroid[0],
          altitude: 1.5,
        }, 1000)
      }
    }
  }
  
  // Handle point selection
  const handlePointClick = (point: GlobePoint) => {
    setSelectedPoint(point)
    setShowDetails(true)
    
    if (globeRef.current) {
      globeRef.current.pointOfView({
        lat: point.lat,
        lng: point.lng,
        altitude: 1.2,
      }, 1000)
    }
  }
  
  // Create a small proxy ref for the WebGL scene
  const proxyRef = useRef<HTMLDivElement>(null)
  
  return (
    <section className={`block travel-data-globe ${className}`}>
      {/* Controls */}
      <GlassCard
        variant="frosted"
        className="travel-data-globe__controls"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '20px',
          zIndex: 10,
          maxWidth: '320px',
        }}
      >
        {/* View tabs */}
        <div className="travel-data-globe__tabs">
          <button
            className={`travel-data-globe__tab ${view === 'advisories' ? 'active' : ''}`}
            onClick={() => setView('advisories')}
          >
            Travel Advisories
          </button>
          <button
            className={`travel-data-globe__tab ${view === 'visa' ? 'active' : ''}`}
            onClick={() => setView('visa')}
          >
            Visa Requirements
          </button>
          <button
            className={`travel-data-globe__tab ${view === 'michelin' ? 'active' : ''}`}
            onClick={() => setView('michelin')}
          >
            Michelin Stars
          </button>
          <button
            className={`travel-data-globe__tab ${view === 'airports' ? 'active' : ''}`}
            onClick={() => setView('airports')}
          >
            Airports
          </button>
        </div>
        
        {/* Search input for applicable views */}
        {(view === 'airports' || view === 'michelin') && (
          <input
            type="text"
            placeholder={`Search ${view === 'airports' ? 'airports' : 'restaurants'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="travel-data-globe__search"
          />
        )}
        
        {/* Country selector for visa view */}
        {view === 'visa' && (
          <select
            value={selectedCountry || ''}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="travel-data-globe__select"
          >
            <option value="">Select passport country...</option>
            {countries.map(country => (
              <option key={country.id} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
        )}
        
        {/* Legend */}
        <div className="travel-data-globe__legend">
          {view === 'advisories' && (
            <>
              <div className="travel-data-globe__legend-item">
                <span className="color-box" style={{ backgroundColor: '#00ff00' }} />
                Level 1 - Exercise Normal Precautions
              </div>
              <div className="travel-data-globe__legend-item">
                <span className="color-box" style={{ backgroundColor: '#ffff00' }} />
                Level 2 - Exercise Increased Caution
              </div>
              <div className="travel-data-globe__legend-item">
                <span className="color-box" style={{ backgroundColor: '#ff8800' }} />
                Level 3 - Reconsider Travel
              </div>
              <div className="travel-data-globe__legend-item">
                <span className="color-box" style={{ backgroundColor: '#ff0000' }} />
                Level 4 - Do Not Travel
              </div>
            </>
          )}
          
          {view === 'visa' && selectedCountry && (
            <>
              <div className="travel-data-globe__legend-item">
                <span className="color-box" style={{ backgroundColor: '#00ff00' }} />
                Visa Free
              </div>
              <div className="travel-data-globe__legend-item">
                <span className="color-box" style={{ backgroundColor: '#88ff00' }} />
                Visa on Arrival
              </div>
              <div className="travel-data-globe__legend-item">
                <span className="color-box" style={{ backgroundColor: '#ffff00' }} />
                eVisa Available
              </div>
              <div className="travel-data-globe__legend-item">
                <span className="color-box" style={{ backgroundColor: '#ff8800' }} />
                Visa Required
              </div>
            </>
          )}
          
          {view === 'michelin' && (
            <>
              <div className="travel-data-globe__legend-item">
                <span className="color-box" style={{ backgroundColor: '#ffff00' }} />
                1 Michelin Star
              </div>
              <div className="travel-data-globe__legend-item">
                <span className="color-box" style={{ backgroundColor: '#ff8800' }} />
                2 Michelin Stars
              </div>
              <div className="travel-data-globe__legend-item">
                <span className="color-box" style={{ backgroundColor: '#ff0000' }} />
                3 Michelin Stars
              </div>
            </>
          )}
        </div>
      </GlassCard>
      
      {/* Details panel */}
      <AnimatePresence>
        {showDetails && (selectedCountry || selectedPoint) && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <GlassCard
              variant="frosted"
              className="travel-data-globe__details"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '20px',
                zIndex: 10,
                maxHeight: '40vh',
                overflowY: 'auto',
              }}
            >
              <button
                onClick={() => {
                  setShowDetails(false)
                  setSelectedCountry(null)
                  setSelectedPoint(null)
                }}
                className="travel-data-globe__close"
              >
                ×
              </button>
              
              {selectedCountry && view === 'advisories' && (
                <>
                  <h3>{selectedCountry}</h3>
                  {advisoryMap.has(selectedCountry) ? (
                    <div>
                      <p>Level {advisoryMap.get(selectedCountry)!.level}</p>
                      <p>{advisoryMap.get(selectedCountry)!.summary}</p>
                    </div>
                  ) : (
                    <p>No travel advisory information available.</p>
                  )}
                </>
              )}
              
              {selectedCountry && view === 'visa' && (
                <>
                  <h3>From {selectedCountry}</h3>
                  {/* Would show visa requirements here */}
                </>
              )}
              
              {selectedPoint && view === 'airports' && (
                <>
                  <h3>{selectedPoint.data.name}</h3>
                  <p>Code: {selectedPoint.data.code}</p>
                  <p>City: {selectedPoint.data.city}</p>
                  <p>Country: {selectedPoint.data.country}</p>
                </>
              )}
              
              {selectedPoint && view === 'michelin' && (
                <>
                  <h3>{selectedPoint.data.name}</h3>
                  <p>Stars: {'★'.repeat(selectedPoint.data.stars)}</p>
                  <p>City: {selectedPoint.data.city}</p>
                  {selectedPoint.data.chef && <p>Chef: {selectedPoint.data.chef}</p>}
                  {selectedPoint.data.cuisine && <p>Cuisine: {selectedPoint.data.cuisine}</p>}
                </>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* SMALL proxy to track – this is key */}
      <div ref={proxyRef} className="webgl-proxy h-[55vh] rounded-lg" />
      
      {/* Globe - Only WebGL subtree is tunneled */}
      <UseCanvas>
        <ViewportScrollScene
          track={proxyRef as React.MutableRefObject<HTMLElement>}
          hideOffscreen={false}
        >
          {() => (
            <TravelDataGlobeR3F
              ref={globeRef}
              features={features}
              advisories={advisoryMap}
              visaRequirements={visaMap}
              points={globePoints}
              selectedCountry={selectedCountry || undefined}
              hoveredCountry={hoveredCountry || undefined}
              view={view}
              onCountryClick={handleCountryClick}
              onCountryHover={setHoveredCountry}
              onPointClick={handlePointClick}
              onPointHover={setHoveredPoint}
            />
          )}
        </ViewportScrollScene>
      </UseCanvas>
    </section>
  )
}