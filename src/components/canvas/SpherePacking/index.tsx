'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { 
  InstancedMesh, 
  Matrix4, 
  Vector3, 
  Color, 
  MeshPhysicalMaterial,
  SphereGeometry,
  Object3D,
  MathUtils
} from 'three'
import { ViewportScrollScene } from '@14islands/r3f-scroll-rig'
import { Environment, Float } from '@react-three/drei'
import { useScrollbar } from '@14islands/r3f-scroll-rig'

interface Sphere {
  position: Vector3
  velocity: Vector3
  radius: number
  color: Color
  targetColor: Color
  mass: number
}

interface SpherePackingProps {
  count?: number
  minSize?: number
  maxSize?: number
  colors?: string[]
  attraction?: number
  friction?: number
  followCursor?: boolean
  background?: {
    backgroundType?: 'color' | 'image' | 'transparent'
    backgroundColor?: string
    backgroundImage?: {
      url: string
      alt?: string
    }
  }
}

function SpherePackingScene({
  count = 200,
  minSize = 0.1,
  maxSize = 0.5,
  colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'],
  attraction = 0.01,
  friction = 0.98,
  followCursor = true,
}: Omit<SpherePackingProps, 'background'>) {
  const meshRef = useRef<InstancedMesh>(null)
  const { size, camera } = useThree()
  const dummy = useMemo(() => new Object3D(), [])
  const { scroll } = useScrollbar()
  
  // Mouse position in 3D space
  const mousePos = useRef(new Vector3())
  const [isPaused, setIsPaused] = useState(false)
  
  // Initialize spheres
  const spheres = useMemo(() => {
    const sphereArray: Sphere[] = []
    const colorObjects = colors.map(c => new Color(c))
    
    for (let i = 0; i < count; i++) {
      const radius = MathUtils.randFloat(minSize, maxSize)
      sphereArray.push({
        position: new Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        ),
        velocity: new Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ),
        radius,
        color: colorObjects[Math.floor(Math.random() * colorObjects.length)].clone(),
        targetColor: colorObjects[Math.floor(Math.random() * colorObjects.length)].clone(),
        mass: radius * radius * radius,
      })
    }
    
    return sphereArray
  }, [count, minSize, maxSize, colors])
  
  // Material
  const material = useMemo(() => {
    return new MeshPhysicalMaterial({
      roughness: 0.4,
      metalness: 0.1,
      clearcoat: 0.3,
      clearcoatRoughness: 0.2,
      transmission: 0.5,
      thickness: 0.5,
      envMapIntensity: 1,
    })
  }, [])
  
  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      mousePos.current.set(x * 5, y * 5, 0)
    }
    
    if (followCursor) {
      window.addEventListener('mousemove', handleMouseMove)
      return () => window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [followCursor])
  
  // Physics simulation
  const updatePhysics = (delta: number) => {
    const deltaTime = Math.min(delta * 60, 2) // Cap delta time
    
    for (let i = 0; i < spheres.length; i++) {
      const sphere = spheres[i]
      
      // Attraction to center or mouse
      const target = followCursor ? mousePos.current : new Vector3(0, 0, 0)
      const direction = target.clone().sub(sphere.position)
      const distance = direction.length()
      
      if (distance > 0.1) {
        direction.normalize()
        const force = direction.multiplyScalar(attraction * deltaTime)
        sphere.velocity.add(force)
      }
      
      // Sphere-to-sphere collision
      for (let j = i + 1; j < spheres.length; j++) {
        const other = spheres[j]
        const diff = sphere.position.clone().sub(other.position)
        const dist = diff.length()
        const minDist = sphere.radius + other.radius
        
        if (dist < minDist && dist > 0) {
          diff.normalize()
          const overlap = minDist - dist
          const force = diff.multiplyScalar(overlap * 0.5)
          
          sphere.position.add(force)
          other.position.sub(force)
          
          // Bounce
          const relativeVelocity = sphere.velocity.clone().sub(other.velocity)
          const velocityAlongNormal = relativeVelocity.dot(diff)
          
          if (velocityAlongNormal > 0) {
            const restitution = 0.8
            const impulse = 2 * velocityAlongNormal / (sphere.mass + other.mass)
            const impulseVector = diff.multiplyScalar(impulse * restitution)
            
            sphere.velocity.sub(impulseVector.clone().multiplyScalar(other.mass))
            other.velocity.add(impulseVector.clone().multiplyScalar(sphere.mass))
          }
        }
      }
      
      // Apply velocity
      sphere.velocity.multiplyScalar(friction)
      sphere.position.add(sphere.velocity.clone().multiplyScalar(deltaTime))
      
      // Boundary collision
      const boundary = 5
      if (Math.abs(sphere.position.x) > boundary - sphere.radius) {
        sphere.position.x = Math.sign(sphere.position.x) * (boundary - sphere.radius)
        sphere.velocity.x *= -0.8
      }
      if (Math.abs(sphere.position.y) > boundary - sphere.radius) {
        sphere.position.y = Math.sign(sphere.position.y) * (boundary - sphere.radius)
        sphere.velocity.y *= -0.8
      }
      if (Math.abs(sphere.position.z) > boundary - sphere.radius) {
        sphere.position.z = Math.sign(sphere.position.z) * (boundary - sphere.radius)
        sphere.velocity.z *= -0.8
      }
      
      // Color interpolation
      sphere.color.lerp(sphere.targetColor, 0.05)
    }
  }
  
  // Update instanced mesh
  const updateInstances = () => {
    if (!meshRef.current) return
    
    const matrix = new Matrix4()
    for (let i = 0; i < spheres.length; i++) {
      const sphere = spheres[i]
      
      matrix.makeScale(sphere.radius, sphere.radius, sphere.radius)
      matrix.setPosition(sphere.position)
      meshRef.current.setMatrixAt(i, matrix)
      meshRef.current.setColorAt(i, sphere.color)
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  }
  
  // Animation loop
  useFrame((state, delta) => {
    if (!isPaused) {
      updatePhysics(delta)
      updateInstances()
    }
  })
  
  // Click handler
  const handleClick = () => {
    // Randomize colors
    const colorObjects = colors.map(c => new Color(c))
    spheres.forEach(sphere => {
      sphere.targetColor = colorObjects[Math.floor(Math.random() * colorObjects.length)].clone()
    })
  }
  
  return (
    <>
      <Environment preset="apartment" />
      
      <instancedMesh 
        ref={meshRef} 
        args={[undefined, undefined, count]}
        onClick={handleClick}
        onPointerOver={() => setIsPaused(true)}
        onPointerOut={() => setIsPaused(false)}
      >
        <sphereGeometry args={[1, 32, 16]} />
        <primitive object={material} attach="material" />
      </instancedMesh>
    </>
  )
}

export function SpherePacking({ 
  background,
  ...props 
}: SpherePackingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  return (
    <div 
      ref={containerRef} 
      className="sphere-packing"
      style={{
        width: '100%',
        height: '100vh',
        position: 'relative',
        background: background?.backgroundType === 'color' 
          ? background.backgroundColor 
          : background?.backgroundType === 'image' && background.backgroundImage
          ? `url(${background.backgroundImage.url})`
          : 'transparent'
      }}
    >
      <ViewportScrollScene
        track={containerRef as React.MutableRefObject<HTMLElement>}
        hideOffscreen={false}
      >
        {() => <SpherePackingScene {...props} />}
      </ViewportScrollScene>
    </div>
  )
}