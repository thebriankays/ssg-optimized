'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useCanvasStore } from '@/lib/stores/canvas-store'
// Import shaders as strings
const vertexShader = /* glsl */ `
precision highp float;

// Three.js built-in attributes are automatically available
// attribute vec3 position; // Provided by Three.js
// attribute vec3 normal;   // Provided by Three.js  
// attribute vec2 uv;       // Provided by Three.js

// Uniforms
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat3 normalMatrix;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_ratio;
uniform float u_pointSize;

uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform vec3 u_color4;
uniform vec4 u_active_colors;
uniform vec3 u_baseColor;
uniform float u_shadow_power;
uniform float u_darken_top;

// Wave layer uniforms (GLSL ES doesn't support struct arrays well)
uniform float u_waveLayer0_z;
uniform vec2 u_waveLayer0_freq;
uniform float u_waveLayer0_amp;
uniform float u_waveLayer0_speed;
uniform float u_waveLayer0_seed;

uniform float u_waveLayer1_z;
uniform vec2 u_waveLayer1_freq;
uniform float u_waveLayer1_amp;
uniform float u_waveLayer1_speed;
uniform float u_waveLayer1_seed;

uniform float u_waveLayer2_z;
uniform vec2 u_waveLayer2_freq;
uniform float u_waveLayer2_amp;
uniform float u_waveLayer2_speed;
uniform float u_waveLayer2_seed;

// Varyings
varying vec3 v_color;
varying vec3 v_position;
varying vec3 v_normal;
varying vec2 v_uv;
varying float v_distortion;

// Simplex noise functions
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// Main vertex shader
void main() {
  v_uv = uv;
  v_position = position;
  
  // Create base position
  vec3 pos = position;
  
  // Time offset for animation
  float time = u_time * 0.0001;
  
  // Calculate world position for noise
  vec2 noiseCoord = vec2(pos.x * u_ratio, pos.y);
  
  // Apply multiple wave layers
  float totalNoise = 0.0;
  float totalWeight = 0.0;
  
  // Layer 0
  vec3 noisePos0 = vec3(
    noiseCoord.x * u_waveLayer0_freq.x + time * u_waveLayer0_speed,
    noiseCoord.y * u_waveLayer0_freq.y,
    u_waveLayer0_seed
  );
  float noise0 = snoise(noisePos0);
  totalNoise += noise0 * u_waveLayer0_amp * u_waveLayer0_z;
  totalWeight += u_waveLayer0_z;
  
  // Layer 1
  vec3 noisePos1 = vec3(
    noiseCoord.x * u_waveLayer1_freq.x + time * u_waveLayer1_speed,
    noiseCoord.y * u_waveLayer1_freq.y,
    u_waveLayer1_seed
  );
  float noise1 = snoise(noisePos1);
  totalNoise += noise1 * u_waveLayer1_amp * u_waveLayer1_z;
  totalWeight += u_waveLayer1_z;
  
  // Layer 2
  vec3 noisePos2 = vec3(
    noiseCoord.x * u_waveLayer2_freq.x + time * u_waveLayer2_speed,
    noiseCoord.y * u_waveLayer2_freq.y,
    u_waveLayer2_seed
  );
  float noise2 = snoise(noisePos2);
  totalNoise += noise2 * u_waveLayer2_amp * u_waveLayer2_z;
  totalWeight += u_waveLayer2_z;
  
  // Normalize and apply distortion
  float distortion = totalNoise / totalWeight;
  pos.z += distortion * 0.001;
  v_distortion = distortion;
  
  // Calculate normal (approximate)
  vec3 normal = normalize(vec3(0.0, 0.0, 1.0) + vec3(distortion * 0.001, distortion * 0.001, 0.0));
  v_normal = normalMatrix * normal;
  
  // Color mixing based on position and noise
  vec3 color = u_baseColor;
  
  float colorMix1 = smoothstep(-1.0, 1.0, sin(pos.x * 0.1 + distortion * 0.01));
  float colorMix2 = smoothstep(-1.0, 1.0, cos(pos.y * 0.1 + distortion * 0.01));
  float colorMix3 = smoothstep(-1.0, 1.0, sin((pos.x + pos.y) * 0.05 + time));
  float colorMix4 = smoothstep(-1.0, 1.0, noise0);
  
  if (u_active_colors.x > 0.5) color = mix(color, u_color1, colorMix1 * u_active_colors.x);
  if (u_active_colors.y > 0.5) color = mix(color, u_color2, colorMix2 * u_active_colors.y);
  if (u_active_colors.z > 0.5) color = mix(color, u_color3, colorMix3 * u_active_colors.z);
  if (u_active_colors.w > 0.5) color = mix(color, u_color4, colorMix4 * u_active_colors.w);
  
  // Apply vertical gradient
  float verticalGradient = smoothstep(-1.0, 1.0, pos.y);
  color = mix(color * 0.8, color, verticalGradient);
  
  v_color = color;
  
  // Calculate final position
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = u_pointSize;
}
`

const fragmentShader = /* glsl */ `
precision highp float;

// Uniforms
uniform float u_darken_top;
uniform float u_shadow_power;
uniform vec2 u_resolution;

// Varyings
varying vec3 v_color;
varying vec3 v_position;
varying vec3 v_normal;
varying vec2 v_uv;
varying float v_distortion;

void main() {
  vec3 color = v_color;
  
  // Apply top darkening effect
  if (u_darken_top > 0.5) {
    float shadowCoord = clamp((v_position.y + 1.0) * 0.5, 0.0, 1.0);
    float shadow = pow(shadowCoord, u_shadow_power);
    color = mix(color * 0.3, color, shadow);
  }
  
  // Add subtle noise texture
  float noise = fract(sin(dot(v_uv * 100.0, vec2(12.9898, 78.233))) * 43758.5453);
  color += (noise - 0.5) * 0.02;
  
  // Add subtle lighting based on distortion
  float lightness = v_distortion * 0.0001;
  color += vec3(lightness);
  
  // Ensure color stays in valid range
  color = clamp(color, 0.0, 1.0);
  
  // Output with full opacity
  gl_FragColor = vec4(color, 1.0);
}
`

interface WhatameshProps {
  colors?: string[]
  amplitude?: number
  speed?: number
  density?: [number, number]
  darkenTop?: boolean
  seed?: number
}

export function Whatamesh({
  colors = ['#c3e4ff', '#6ec3f4', '#eae2ff', '#b9beff'],
  amplitude = 320,
  speed = 1,
  density = [0.06, 0.16],
  darkenTop = true,
  seed = 5,
}: WhatameshProps) {
  console.log('Whatamesh component rendering with props:', {
    colors,
    amplitude,
    speed,
    density,
    darkenTop,
    seed
  })
  
  const meshRef = useRef<THREE.Mesh>(null)
  const { size } = useThree()
  const quality = useCanvasStore((state) => state.quality) || 'medium'
  
  // Adjust density based on quality
  const meshDensity = useMemo(() => {
    const qualityMultiplier = {
      low: 0.5,
      medium: 0.75,
      high: 1,
      ultra: 1.25,
    }[quality] || 0.75
    
    const safeWidth = size?.width || 1920
    const safeHeight = size?.height || 1080
    
    const width = Math.round(safeWidth * density[0] * qualityMultiplier)
    const height = Math.round(safeHeight * density[1] * qualityMultiplier)
    
    return [Math.max(16, width || 16), Math.max(16, height || 16)]
  }, [size, density, quality])
  
  const uniforms = useMemo(() => {
    // Convert hex colors to Three.js Color instances
    const colorArray = colors.map(hex => new THREE.Color(hex))
    
    const safeWidth = size?.width || 1920
    const safeHeight = size?.height || 1080
    
    return {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(safeWidth, safeHeight) },
      u_ratio: { value: safeWidth / safeHeight },
      u_pointSize: { value: 1 },
      
      // Colors
      u_color1: { value: colorArray[0] || new THREE.Color('#c3e4ff') },
      u_color2: { value: colorArray[1] || new THREE.Color('#6ec3f4') },
      u_color3: { value: colorArray[2] || new THREE.Color('#eae2ff') },
      u_color4: { value: colorArray[3] || new THREE.Color('#b9beff') },
      u_active_colors: { value: new Float32Array([1, 1, 1, 1]) },
      
      // Animation parameters
      u_baseColor: { value: new THREE.Color(0.11, 0.11, 0.11) },
      
      // Wave layer 0
      u_waveLayer0_z: { value: 0.3 },
      u_waveLayer0_freq: { value: new THREE.Vector2(0.00014 * seed, 0.00029 * seed) },
      u_waveLayer0_amp: { value: amplitude },
      u_waveLayer0_speed: { value: 0.0005 * speed },
      u_waveLayer0_seed: { value: seed + 0.5 },
      
      // Wave layer 1
      u_waveLayer1_z: { value: 0.1 },
      u_waveLayer1_freq: { value: new THREE.Vector2(0.00013 * seed, 0.000281 * seed) },
      u_waveLayer1_amp: { value: amplitude * 0.8 },
      u_waveLayer1_speed: { value: 0.0003 * speed },
      u_waveLayer1_seed: { value: seed + 0.8 },
      
      // Wave layer 2
      u_waveLayer2_z: { value: 0.2 },
      u_waveLayer2_freq: { value: new THREE.Vector2(0.00015 * seed, 0.000287 * seed) },
      u_waveLayer2_amp: { value: amplitude * 0.6 },
      u_waveLayer2_speed: { value: 0.0004 * speed },
      u_waveLayer2_seed: { value: seed + 1.2 },
      
      // Effects
      u_darken_top: { value: darkenTop ? 1.0 : 0.0 },
      u_shadow_power: { value: safeWidth < 600 ? 5.0 : 6.0 },
    }
  }, [colors, amplitude, speed, seed, darkenTop, size])
  
  // Animation loop
  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    // Update time
    uniforms.u_time.value += delta * 1000 * speed
    
    // Update resolution if size changes
    if (uniforms.u_resolution.value.x !== size.width || uniforms.u_resolution.value.y !== size.height) {
      uniforms.u_resolution.value.set(size.width, size.height)
      uniforms.u_ratio.value = size.width / size.height
      uniforms.u_shadow_power.value = size.width < 600 ? 5.0 : 6.0
    }
  })
  
  // Calculate the proper scale to fill the viewport
  const safeWidth = size?.width || 1920
  const safeHeight = size?.height || 1080
  const aspect = safeWidth / safeHeight
  const distance = 5 // Camera distance
  const vFov = 45 * (Math.PI / 180) // Convert FOV to radians
  const planeHeight = 2 * Math.tan(vFov / 2) * distance
  const planeWidth = planeHeight * aspect
  
  return (
    <mesh
      ref={(mesh) => {
        meshRef.current = mesh
        if (mesh) {
          console.log('Whatamesh mesh created and added to scene:', mesh)
        }
      }}
      position={[0, 0, -2]}
      renderOrder={-1000}
    >
      <planeGeometry
        args={[planeWidth * 1.2, planeHeight * 1.2, meshDensity[0], meshDensity[1]]}
      />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        vertexColors
        transparent={false}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}