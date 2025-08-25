'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useAppStore } from '@/lib/stores/app-store'

interface GlassOverlayProps {
  enabled?: boolean
  intensity?: number
  speed?: number
  distortion?: number
  frequency?: number
  amplitude?: number
  brightness?: number
  contrast?: number
  followMouse?: boolean
}

// Fullscreen quad overlay - works without post-processing
export function GlassOverlayMesh({
  enabled = true,
  intensity = 0.5,
  speed = 0.3,
  distortion = 1.5,
  frequency = 2.5,
  amplitude = 0.02,
  brightness = 1.05,
  contrast = 1.05,
  followMouse = true,
}: GlassOverlayProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const materialRef = useRef<THREE.ShaderMaterial>(null!)
  const { viewport, mouse, camera } = useThree()
  const webglEnabled = useAppStore((state) => state.webglEnabled)
  
  // Mouse tracking
  const mousePosition = useRef(new THREE.Vector2(0, 0))
  const targetMousePosition = useRef(new THREE.Vector2(0, 0))
  
  useEffect(() => {
    if (materialRef.current) {
      // Set initial uniform values
      materialRef.current.uniforms.speed.value = speed
      materialRef.current.uniforms.distortion.value = distortion * intensity
      materialRef.current.uniforms.frequency.value = frequency
      materialRef.current.uniforms.amplitude.value = amplitude * intensity
      materialRef.current.uniforms.brightness.value = brightness
      materialRef.current.uniforms.contrast.value = contrast
    }
  }, [speed, distortion, intensity, frequency, amplitude, brightness, contrast])
  
  useFrame((state, delta) => {
    if (!materialRef.current || !enabled || !webglEnabled) return
    
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
    
    // Keep mesh in front of camera
    if (meshRef.current) {
      meshRef.current.position.z = -5
      meshRef.current.scale.set(viewport.width, viewport.height, 1)
    }
  })
  
  if (!enabled || !webglEnabled) return null
  
  return (
    <mesh 
      ref={meshRef}
      renderOrder={1000} // Render on top
    >
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float time;
          uniform float speed;
          uniform float distortion;
          uniform float brightness;
          uniform float contrast;
          uniform float frequency;
          uniform float amplitude;
          uniform vec2 mouseFactor;
          
          varying vec2 vUv;
          
          // Simplex noise function
          vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
          vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
          
          float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy));
            vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod289(i);
            vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m;
            m = m*m;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
          }
          
          void main() {
            vec2 uv = vUv;
            
            // Liquid wave distortion
            float wave1 = sin(uv.y * frequency + time) * amplitude;
            float wave2 = sin(uv.x * frequency * 1.3 + time * 0.8) * amplitude * 0.7;
            
            // Organic noise distortion
            float noise = snoise(vec2(uv.x * 3.0 + time * 0.5, uv.y * 3.0 + time * 0.3));
            
            // Mouse influence
            vec2 mouseOffset = (mouseFactor - 0.5) * 0.2;
            float mouseDistance = length(uv - 0.5 - mouseOffset * 0.5);
            float mouseInfluence = smoothstep(0.5, 0.0, mouseDistance);
            
            // Apply distortion
            uv.x += (wave1 + noise * 0.02) * distortion * 0.01 + mouseInfluence * mouseOffset.x * 0.05;
            uv.y += (wave2 + noise * 0.02) * distortion * 0.01 + mouseInfluence * mouseOffset.y * 0.05;
            
            // Radial distortion for liquid effect
            vec2 center = vec2(0.5);
            vec2 toCenter = center - uv;
            float radialDistortion = length(toCenter) * 0.05;
            uv += toCenter * radialDistortion * distortion * 0.01;
            
            // Glass color with subtle tint
            vec3 glassColor = vec3(
              0.95 + sin(time * 0.7) * 0.05,
              0.97,
              1.0 - sin(time * 0.5) * 0.03
            );
            
            // Fresnel-like edge effect
            float edge = 1.0 - smoothstep(0.3, 0.5, length(vUv - 0.5));
            
            // Chromatic aberration on edges
            float aberration = edge * 0.01 * distortion;
            glassColor.r *= 1.0 + aberration;
            glassColor.b *= 1.0 - aberration;
            
            // Apply brightness and contrast
            glassColor = (glassColor - 0.5) * contrast + 0.5;
            glassColor *= brightness;
            
            // Alpha based on distortion and edge
            float alpha = (0.02 + edge * 0.03) * intensity;
            
            gl_FragColor = vec4(glassColor, alpha);
          }
        `}
        uniforms={{
          time: { value: 0 },
          speed: { value: speed },
          distortion: { value: distortion * intensity },
          brightness: { value: brightness },
          contrast: { value: contrast },
          frequency: { value: frequency },
          amplitude: { value: amplitude * intensity },
          mouseFactor: { value: new THREE.Vector2(0, 0) },
        }}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  )
}
