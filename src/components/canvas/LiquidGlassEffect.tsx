'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import { ShaderMaterial, PlaneGeometry, Mesh, Vector2, Color } from 'three'
import { shaderMaterial } from '@react-three/drei'
import { liquidDistortionShader } from '@/lib/glass/materials'

// Create and register the custom shader material
const LiquidGlassMaterialImpl = shaderMaterial(
  liquidDistortionShader.uniforms,
  liquidDistortionShader.vertexShader,
  liquidDistortionShader.fragmentShader
)

// Extend THREE namespace to include our custom material
extend({ LiquidGlassMaterial: LiquidGlassMaterialImpl })

// Add TypeScript support for the custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      liquidGlassMaterial: any
    }
  }
}

interface LiquidGlassEffectProps {
  intensity?: number
  speed?: number
  distortion?: number
  frequency?: number
  amplitude?: number
  brightness?: number
  contrast?: number
  followMouse?: boolean
  children?: React.ReactNode
}

export function LiquidGlassEffect({
  intensity = 1,
  speed = 0.5,
  distortion = 3.0,
  frequency = 3.5,
  amplitude = 0.03,
  brightness = 1.2,
  contrast = 1.1,
  followMouse = true,
  children,
}: LiquidGlassEffectProps) {
  const meshRef = useRef<Mesh>(null!)
  const materialRef = useRef<ShaderMaterial>(null!)
  const { viewport, mouse } = useThree()
  
  // Mouse tracking
  const mousePosition = useRef(new Vector2(0, 0))
  const targetMousePosition = useRef(new Vector2(0, 0))
  
  useFrame((state, delta) => {
    if (!materialRef.current) return
    
    // Update time
    materialRef.current.uniforms.time.value += delta * speed
    
    // Smooth mouse tracking
    if (followMouse) {
      targetMousePosition.current.x = (mouse.x + 1) / 2
      targetMousePosition.current.y = (mouse.y + 1) / 2
      
      mousePosition.current.x += (targetMousePosition.current.x - mousePosition.current.x) * 0.1
      mousePosition.current.y += (targetMousePosition.current.y - mousePosition.current.y) * 0.1
      
      materialRef.current.uniforms.mouseFactor.value.set(
        mousePosition.current.x,
        mousePosition.current.y
      )
    }
  })
  
  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={liquidDistortionShader.vertexShader}
        fragmentShader={liquidDistortionShader.fragmentShader}
        uniforms={{
          ...liquidDistortionShader.uniforms,
          speed: { value: speed },
          distortion: { value: distortion * intensity },
          frequency: { value: frequency },
          amplitude: { value: amplitude * intensity },
          brightness: { value: brightness },
          contrast: { value: contrast }
        }}
        transparent={true}
        depthTest={false}
        depthWrite={false}
      />
      {children}
    </mesh>
  )
}

// Animated Glass Panel Component
interface GlassPanel3DProps {
  width?: number
  height?: number
  thickness?: number
  preset?: 'frosted' | 'clear' | 'refractive' | 'holographic' | 'liquid'
  position?: [number, number, number]
  rotation?: [number, number, number]
}

export function GlassPanel3D({
  width = 2,
  height = 3,
  thickness = 0.1,
  preset = 'frosted',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: GlassPanel3DProps) {
  const meshRef = useRef<Mesh>(null!)
  
  const glassMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new Vector2(width, height) },
        thickness: { value: thickness },
        ior: { value: 1.5 },
        chromaticAberration: { value: 0.02 },
        saturation: { value: 1.2 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        uniform float thickness;
        uniform float ior;
        uniform float chromaticAberration;
        uniform float saturation;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        
        // Fresnel effect
        float fresnel(vec3 viewDirection, vec3 normal, float ior) {
          float f0 = pow((1.0 - ior) / (1.0 + ior), 2.0);
          return f0 + (1.0 - f0) * pow(1.0 - dot(viewDirection, normal), 5.0);
        }
        
        // Noise function for organic movement
        float noise(vec2 p) {
          return sin(p.x * 10.0 + time) * cos(p.y * 10.0 + time * 0.8) * 0.5 + 0.5;
        }
        
        void main() {
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          
          // Calculate fresnel
          float fresnelFactor = fresnel(viewDirection, vNormal, ior);
          
          // Animated refraction
          vec2 refractedUv = vUv;
          refractedUv.x += sin(vUv.y * 20.0 + time * 2.0) * 0.01;
          refractedUv.y += cos(vUv.x * 20.0 + time * 1.5) * 0.01;
          
          // Glass color with chromatic aberration
          vec3 glassColor = vec3(
            noise(refractedUv + vec2(chromaticAberration, 0.0)),
            noise(refractedUv),
            noise(refractedUv - vec2(chromaticAberration, 0.0))
          );
          
          // Apply fresnel and saturation
          glassColor = mix(glassColor, vec3(1.0), fresnelFactor * 0.5);
          
          // Saturation adjustment
          vec3 gray = vec3(dot(glassColor, vec3(0.299, 0.587, 0.114)));
          glassColor = mix(gray, glassColor, saturation);
          
          // Transparency based on thickness and fresnel
          float alpha = mix(0.1, 0.9, fresnelFactor) * (1.0 - thickness * 0.1);
          
          gl_FragColor = vec4(glassColor, alpha);
        }
      `,
      transparent: true,
      side: 2, // DoubleSide
    })
  }, [width, height, thickness, preset])
  
  useFrame((state, delta) => {
    if (meshRef.current && meshRef.current.material) {
      // @ts-ignore
      meshRef.current.material.uniforms.time.value += delta
    }
  })
  
  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={rotation}
      material={glassMaterial}
    >
      <boxGeometry args={[width, height, thickness]} />
    </mesh>
  )
}