'use client'

import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { GeoFeature, GlobePoint, TravelAdvisory, VisaRequirement } from './types'
import { getAdvisoryColor, getVisaColor } from './utils/dataProcessing'

interface TravelDataGlobeR3FProps {
  features: GeoFeature[]
  advisories: Map<string, TravelAdvisory>
  visaRequirements: Map<string, VisaRequirement>
  points: GlobePoint[]
  selectedCountry?: string
  hoveredCountry?: string
  view: 'advisories' | 'visa' | 'michelin' | 'airports'
  autoRotate?: boolean
  autoRotateSpeed?: number
  atmosphereColor?: string
  atmosphereAltitude?: number
  onCountryClick?: (country: string) => void
  onCountryHover?: (country: string | null) => void
  onPointClick?: (point: GlobePoint) => void
  onPointHover?: (point: GlobePoint | null) => void
}

export interface GlobeRef {
  pointOfView: (coords: { lat?: number; lng?: number; altitude?: number }, duration?: number) => void
  controls: any
}

const GLOBE_RADIUS = 100

export const TravelDataGlobeR3F = forwardRef<GlobeRef, TravelDataGlobeR3FProps>(({
  features,
  advisories,
  visaRequirements,
  points,
  selectedCountry,
  hoveredCountry,
  view,
  autoRotate = true,
  autoRotateSpeed = 0.5,
  atmosphereColor = '#3386f4',
  atmosphereAltitude = 0.25,
  onCountryClick,
  onCountryHover,
  onPointClick,
  onPointHover,
}, ref) => {
  const groupRef = useRef<THREE.Group>(null)
  const controlsRef = useRef<any>(null)
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())
  const { camera, gl, size } = useThree()
  
  const [countryMeshes, setCountryMeshes] = useState<Map<string, THREE.Mesh>>(new Map())
  const [pointMeshes, setPointMeshes] = useState<THREE.Mesh[]>([])
  
  // Handle pointer of view animation
  useImperativeHandle(ref, () => ({
    pointOfView: (coords: { lat?: number; lng?: number; altitude?: number }, duration = 1000) => {
      if (!controlsRef.current) return
      
      const { lat = 0, lng = 0, altitude = 2.5 } = coords
      
      // Convert lat/lng to spherical coordinates
      const phi = (90 - lat) * Math.PI / 180
      const theta = (lng + 180) * Math.PI / 180
      
      // Calculate camera position
      const distance = GLOBE_RADIUS * altitude
      const x = distance * Math.sin(phi) * Math.cos(theta)
      const y = distance * Math.cos(phi)
      const z = distance * Math.sin(phi) * Math.sin(theta)
      
      // Animate camera position
      const startPos = camera.position.clone()
      const endPos = new THREE.Vector3(x, y, z)
      const startTime = Date.now()
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3) // Ease out cubic
        
        camera.position.lerpVectors(startPos, endPos, eased)
        camera.lookAt(0, 0, 0)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      animate()
    },
    controls: controlsRef.current,
  }))
  
  // Convert GeoJSON features to Three.js geometries
  useEffect(() => {
    const meshes = new Map<string, THREE.Mesh>()
    
    features.forEach(feature => {
      if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
        const coordinates = feature.geometry.type === 'Polygon' 
          ? [feature.geometry.coordinates]
          : feature.geometry.coordinates
        
        // Create vertices for the country polygon
        const vertices: number[] = []
        const indices: number[] = []
        let vertexIndex = 0
        
        coordinates.forEach((polygon: any[]) => {
          const polygonVertices: THREE.Vector3[] = []
          
          polygon[0].forEach((coord: [number, number]) => {
            const [lng, lat] = coord
            const phi = (90 - lat) * Math.PI / 180
            const theta = (lng + 180) * Math.PI / 180
            
            // Slightly offset from globe surface to prevent z-fighting
            const radius = GLOBE_RADIUS * 1.001
            const x = radius * Math.sin(phi) * Math.cos(theta)
            const y = radius * Math.cos(phi)
            const z = radius * Math.sin(phi) * Math.sin(theta)
            
            vertices.push(x, y, z)
            polygonVertices.push(new THREE.Vector3(x, y, z))
          })
          
          // Simple triangulation for convex polygons
          // For better results, consider using earcut.js
          for (let i = 1; i < polygonVertices.length - 1; i++) {
            indices.push(vertexIndex, vertexIndex + i, vertexIndex + i + 1)
          }
          
          vertexIndex += polygonVertices.length
        })
        
        // Create buffer geometry
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
        geometry.setIndex(indices)
        geometry.computeVertexNormals()
        
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color('#ffffff'),
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
        })
        
        const mesh = new THREE.Mesh(geometry, material)
        mesh.userData = { country: feature.properties.NAME, feature }
        
        meshes.set(feature.properties.NAME, mesh)
      }
    })
    
    setCountryMeshes(meshes)
  }, [features])
  
  // Update country colors based on view
  useEffect(() => {
    countryMeshes.forEach((mesh, countryName) => {
      const material = mesh.material as THREE.MeshBasicMaterial
      
      if (view === 'advisories') {
        const advisory = advisories.get(countryName)
        if (advisory) {
          material.color = new THREE.Color(getAdvisoryColor(advisory.level))
          material.opacity = 0.8
        } else {
          material.color = new THREE.Color('#444444')
          material.opacity = 0.3
        }
      } else if (view === 'visa' && selectedCountry) {
        const requirement = visaRequirements.get(countryName)
        if (requirement) {
          material.color = new THREE.Color(getVisaColor(requirement.requirementType))
          material.opacity = 0.8
        } else {
          material.color = new THREE.Color('#444444')
          material.opacity = 0.3
        }
      } else {
        material.color = new THREE.Color('#666666')
        material.opacity = 0.4
      }
      
      // Highlight selected/hovered countries
      if (countryName === selectedCountry) {
        material.opacity = 1
      } else if (countryName === hoveredCountry) {
        material.opacity = 0.9
      }
    })
  }, [view, advisories, visaRequirements, selectedCountry, hoveredCountry, countryMeshes])
  
  // Create point meshes
  useEffect(() => {
    const meshes: THREE.Mesh[] = []
    
    if (view === 'michelin' || view === 'airports') {
      points.forEach(point => {
        const phi = (90 - point.lat) * Math.PI / 180
        const theta = (point.lng + 180) * Math.PI / 180
        
        const x = GLOBE_RADIUS * Math.sin(phi) * Math.cos(theta)
        const y = GLOBE_RADIUS * Math.cos(phi)
        const z = GLOBE_RADIUS * Math.sin(phi) * Math.sin(theta)
        
        const geometry = new THREE.SphereGeometry(point.size || 0.2, 8, 8)
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(point.color || '#ffffff'),
        })
        
        const mesh = new THREE.Mesh(geometry, material)
        mesh.position.set(x, y, z)
        mesh.userData = { point }
        
        meshes.push(mesh)
      })
    }
    
    setPointMeshes(meshes)
  }, [points, view])
  
  // Handle mouse interactions
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / size.width) * 2 - 1
      mouse.current.y = -(event.clientY / size.height) * 2 + 1
    }
    
    const handleClick = () => {
      raycaster.current.setFromCamera(mouse.current, camera)
      
      // Check country intersections
      const countryIntersects = raycaster.current.intersectObjects(Array.from(countryMeshes.values()))
      if (countryIntersects.length > 0 && onCountryClick) {
        const country = countryIntersects[0].object.userData.country
        onCountryClick(country)
      }
      
      // Check point intersections
      const pointIntersects = raycaster.current.intersectObjects(pointMeshes)
      if (pointIntersects.length > 0 && onPointClick) {
        const point = pointIntersects[0].object.userData.point
        onPointClick(point)
      }
    }
    
    gl.domElement.addEventListener('mousemove', handleMouseMove)
    gl.domElement.addEventListener('click', handleClick)
    
    return () => {
      gl.domElement.removeEventListener('mousemove', handleMouseMove)
      gl.domElement.removeEventListener('click', handleClick)
    }
  }, [camera, size, gl, countryMeshes, pointMeshes, onCountryClick, onPointClick])
  
  // Animation loop
  useFrame(() => {
    if (autoRotate && groupRef.current && !controlsRef.current?.userData.interacting) {
      groupRef.current.rotation.y += autoRotateSpeed * 0.001
    }
    
    // Update hover state
    raycaster.current.setFromCamera(mouse.current, camera)
    
    const countryIntersects = raycaster.current.intersectObjects(Array.from(countryMeshes.values()))
    if (countryIntersects.length > 0) {
      const country = countryIntersects[0].object.userData.country
      onCountryHover?.(country)
    } else {
      onCountryHover?.(null)
    }
    
    const pointIntersects = raycaster.current.intersectObjects(pointMeshes)
    if (pointIntersects.length > 0) {
      const point = pointIntersects[0].object.userData.point
      onPointHover?.(point)
    } else {
      onPointHover?.(null)
    }
  })
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
      
      <group ref={groupRef}>
        {/* Globe sphere */}
        <mesh>
          <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
          <meshPhongMaterial
            color="#1a1a1a"
            emissive="#1a1a1a"
            emissiveIntensity={0.1}
            shininess={10}
          />
        </mesh>
        
        {/* Atmosphere */}
        <mesh>
          <sphereGeometry args={[GLOBE_RADIUS * (1 + atmosphereAltitude), 64, 64]} />
          <meshBasicMaterial
            color={atmosphereColor}
            transparent
            opacity={0.1}
            side={THREE.BackSide}
          />
        </mesh>
        
        {/* Countries */}
        {Array.from(countryMeshes.values()).map((mesh, index) => (
          <primitive key={index} object={mesh} />
        ))}
        
        {/* Points */}
        {pointMeshes.map((mesh, index) => (
          <primitive key={index} object={mesh} />
        ))}
      </group>
      
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        minDistance={GLOBE_RADIUS * 1.2}
        maxDistance={GLOBE_RADIUS * 4}
        rotateSpeed={0.5}
        zoomSpeed={0.5}
        onStart={() => {
          if (controlsRef.current) {
            controlsRef.current.userData.interacting = true
          }
        }}
        onEnd={() => {
          if (controlsRef.current) {
            controlsRef.current.userData.interacting = false
          }
        }}
      />
    </>
  )
})

TravelDataGlobeR3F.displayName = 'TravelDataGlobeR3F'