'use client'

import { useRef, useEffect, useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Tiles3DLoader } from '@loaders.gl/3d-tiles'
import { load } from '@loaders.gl/core'
import * as THREE from 'three'

interface GoogleMaps3DTilesProps {
  apiKey: string
  center: { lat: number; lng: number }
  zoom?: number
  tilt?: number
  heading?: number
  onLoad?: () => void
}

export function GoogleMaps3DTiles({
  apiKey,
  center,
  zoom = 15,
  tilt = 60,
  heading = 0,
  onLoad,
}: GoogleMaps3DTilesProps) {
  const { camera, scene } = useThree()
  const tilesRef = useRef<THREE.Group>(new THREE.Group())
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    scene.add(tilesRef.current)
    
    // Load 3D tiles
    const loadTiles = async () => {
      try {
        // For now, we'll use a placeholder approach
        // In production, you would integrate with Google's Map Tiles API
        // const tilesetUrl = `https://tile.googleapis.com/v1/3dtiles/root.json?key=${apiKey}`
        
        // Create placeholder geometry
        const geometry = new THREE.BoxGeometry(100, 50, 100)
        const material = new THREE.MeshStandardMaterial({ color: 0x808080 })
        const mesh = new THREE.Mesh(geometry, material)
        
        tilesRef.current.add(mesh)
        
        setIsLoading(false)
        onLoad?.()
      } catch (error) {
        console.error('Error loading 3D tiles:', error)
        setIsLoading(false)
      }
    }
    
    loadTiles()
    
    return () => {
      scene.remove(tilesRef.current)
      // Clean up tiles
      tilesRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
    }
  }, [apiKey, scene, onLoad])
  
  // Update camera position based on center, zoom, tilt, and heading
  useEffect(() => {
    const distance = 1000 / Math.pow(2, zoom - 15)
    const phi = THREE.MathUtils.degToRad(90 - tilt)
    const theta = THREE.MathUtils.degToRad(heading)
    
    camera.position.x = distance * Math.sin(phi) * Math.cos(theta)
    camera.position.y = distance * Math.cos(phi)
    camera.position.z = distance * Math.sin(phi) * Math.sin(theta)
    
    camera.lookAt(0, 0, 0)
  }, [camera, center, zoom, tilt, heading])
  
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <primitive object={tilesRef.current} />
      {isLoading && (
        <mesh>
          <planeGeometry args={[200, 200]} />
          <meshBasicMaterial color={0xcccccc} />
        </mesh>
      )}
    </>
  )
}