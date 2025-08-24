'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useScrollRig } from '@14islands/r3f-scroll-rig'

// Try to use scroll rig if available
function useOptionalScrollRig() {
  try {
    return useScrollRig()
  } catch {
    return null
  }
}

const DEFAULT_GRADIENT_COLORS: [string, string, string, string] = [
  '#dca8d8', // light purple
  '#a3d3f9', // light blue
  '#fcd6d6', // light pink
  '#eae2ff', // light lavender
]

// Convert hex to normalized RGB
function normalizeColor(hexCode: string): THREE.Vector3 {
  const hex = hexCode.replace('#', '')
  const num = parseInt(hex, 16)
  return new THREE.Vector3(
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (255 & num) / 255,
  )
}

// The actual Whatamesh vertex shader from the source
const vertexShader = /* glsl */ `
precision highp float;

// Uniforms
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_shadow_power;
uniform float u_darken_top;
uniform vec4 u_active_colors;
uniform vec3 u_baseColor;
uniform float u_vertDeform_incline;
uniform float u_vertDeform_offsetTop;
uniform float u_vertDeform_offsetBottom;
uniform vec2 u_vertDeform_noiseFreq;
uniform float u_vertDeform_noiseAmp;
uniform float u_vertDeform_noiseSpeed;
uniform float u_vertDeform_noiseFlow;
uniform float u_vertDeform_noiseSeed;
uniform vec2 u_global_noiseFreq;
uniform float u_global_noiseSpeed;

// Wave layer uniforms
uniform vec3 u_waveLayer0_color;
uniform vec2 u_waveLayer0_noiseFreq;
uniform float u_waveLayer0_noiseSpeed;
uniform float u_waveLayer0_noiseFlow;
uniform float u_waveLayer0_noiseSeed;
uniform float u_waveLayer0_noiseFloor;
uniform float u_waveLayer0_noiseCeil;

uniform vec3 u_waveLayer1_color;
uniform vec2 u_waveLayer1_noiseFreq;
uniform float u_waveLayer1_noiseSpeed;
uniform float u_waveLayer1_noiseFlow;
uniform float u_waveLayer1_noiseSeed;
uniform float u_waveLayer1_noiseFloor;
uniform float u_waveLayer1_noiseCeil;

uniform vec3 u_waveLayer2_color;
uniform vec2 u_waveLayer2_noiseFreq;
uniform float u_waveLayer2_noiseSpeed;
uniform float u_waveLayer2_noiseFlow;
uniform float u_waveLayer2_noiseSeed;
uniform float u_waveLayer2_noiseFloor;
uniform float u_waveLayer2_noiseCeil;

// Varyings
varying vec3 v_color;
varying vec2 vUv;

// Simplex noise
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0);
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 =   v - i + dot(i, C.xxx);

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
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3)));
}

// Blend functions
vec3 blendNormal(vec3 base, vec3 blend, float opacity) {
  return (blend * opacity + base * (1.0 - opacity));
}

void main() {
  vUv = uv;
  
  float time = u_time * u_global_noiseSpeed;
  
  vec2 uvNorm = uv * 2.0 - 1.0;
  vec2 noiseCoord = u_resolution * uvNorm * u_global_noiseFreq;
  vec2 st = 1. - uvNorm.xy;

  // Tilting the plane
  float tilt = u_resolution.y / 2.0 * uvNorm.y;
  float incline = u_resolution.x * uvNorm.x / 2.0 * u_vertDeform_incline;
  float offset = u_resolution.x / 2.0 * u_vertDeform_incline * mix(u_vertDeform_offsetBottom, u_vertDeform_offsetTop, uv.y);

  // Vertex noise
  float noise = snoise(vec3(
    noiseCoord.x * u_vertDeform_noiseFreq.x + time * u_vertDeform_noiseFlow,
    noiseCoord.y * u_vertDeform_noiseFreq.y,
    time * u_vertDeform_noiseSpeed + u_vertDeform_noiseSeed
  )) * u_vertDeform_noiseAmp;

  // Fade noise to zero at edges
  noise *= 1.0 - pow(abs(uvNorm.y), 2.0);
  noise = max(0.0, noise);

  vec3 pos = vec3(
    position.x,
    position.y + tilt + incline + noise - offset,
    position.z
  );

  // Vertex color
  v_color = u_baseColor;
  
  // Wave layer 0
  if (u_active_colors[1] == 1.) {
    float layerNoise = smoothstep(
      u_waveLayer0_noiseFloor,
      u_waveLayer0_noiseCeil,
      snoise(vec3(
        noiseCoord.x * u_waveLayer0_noiseFreq.x + time * u_waveLayer0_noiseFlow,
        noiseCoord.y * u_waveLayer0_noiseFreq.y,
        time * u_waveLayer0_noiseSpeed + u_waveLayer0_noiseSeed
      )) / 2.0 + 0.5
    );
    v_color = blendNormal(v_color, u_waveLayer0_color, pow(layerNoise, 4.));
  }
  
  // Wave layer 1
  if (u_active_colors[2] == 1.) {
    float layerNoise = smoothstep(
      u_waveLayer1_noiseFloor,
      u_waveLayer1_noiseCeil,
      snoise(vec3(
        noiseCoord.x * u_waveLayer1_noiseFreq.x + time * u_waveLayer1_noiseFlow,
        noiseCoord.y * u_waveLayer1_noiseFreq.y,
        time * u_waveLayer1_noiseSpeed + u_waveLayer1_noiseSeed
      )) / 2.0 + 0.5
    );
    v_color = blendNormal(v_color, u_waveLayer1_color, pow(layerNoise, 4.));
  }
  
  // Wave layer 2
  if (u_active_colors[3] == 1.) {
    float layerNoise = smoothstep(
      u_waveLayer2_noiseFloor,
      u_waveLayer2_noiseCeil,
      snoise(vec3(
        noiseCoord.x * u_waveLayer2_noiseFreq.x + time * u_waveLayer2_noiseFlow,
        noiseCoord.y * u_waveLayer2_noiseFreq.y,
        time * u_waveLayer2_noiseSpeed + u_waveLayer2_noiseSeed
      )) / 2.0 + 0.5
    );
    v_color = blendNormal(v_color, u_waveLayer2_color, pow(layerNoise, 4.));
  }

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

// The actual Whatamesh fragment shader from the source
const fragmentShader = /* glsl */ `
precision highp float;

uniform vec2 u_resolution;
uniform float u_darken_top;
uniform float u_shadow_power;

varying vec3 v_color;
varying vec2 vUv;

void main() {
  vec3 color = v_color;
  
  if (u_darken_top == 1.0) {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    color.g -= pow(st.y + sin(-12.0) * st.x, u_shadow_power) * 0.4;
  }
  
  gl_FragColor = vec4(color, 1.0);
}
`

interface WhatameshSimpleProps {
  colors?: string[]
}

export function WhatameshSimple({
  colors = DEFAULT_GRADIENT_COLORS,
}: WhatameshSimpleProps) {
  console.log('WhatameshSimple rendering with colors:', colors)
  
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { viewport, size, gl, scene, camera } = useThree()
  const scrollRig = useOptionalScrollRig()
  const requestRender = scrollRig?.requestRender
  
  // Log shader compilation
  useEffect(() => {
    if (materialRef.current) {
      const material = materialRef.current
      console.log('Shader material created:', material)
      console.log('Shader compiled:', material.program)
      if (material.program) {
        const gl = material.program.gl
        const vertexLog = gl.getShaderInfoLog(material.program.vertexShader)
        const fragmentLog = gl.getShaderInfoLog(material.program.fragmentShader)
        if (vertexLog) console.error('Vertex shader error:', vertexLog)
        if (fragmentLog) console.error('Fragment shader error:', fragmentLog)
      }
    }
  }, [])
  
  // Configuration from original
  const amp = 320
  const seed = 5
  const freqX = 0.00014
  const freqY = 0.00029
  
  // Force render on mount
  useEffect(() => {
    if (requestRender) {
      requestRender()
    }
    if (scene && camera) {
      gl.render(scene, camera)
    }
  }, [gl, scene, camera, requestRender])
  
  const uniforms = useMemo(() => {
    const colorVecs = colors.map(hex => normalizeColor(hex))
    
    return {
      u_time: { value: 1253106 }, // Start with the same value as original
      u_resolution: { value: new THREE.Vector2(size.width, size.height) },
      u_shadow_power: { value: size.width < 600 ? 5 : 6 },
      u_darken_top: { value: 1.0 },
      u_active_colors: { value: new THREE.Vector4(1, 1, 1, 1) },
      
      // Base color
      u_baseColor: { value: colorVecs[0] },
      
      // Global uniforms
      u_global_noiseFreq: { value: new THREE.Vector2(freqX, freqY) },
      u_global_noiseSpeed: { value: 0.000005 },
      
      // Vertex deform uniforms  
      u_vertDeform_incline: { value: Math.sin(0) / Math.cos(0) },
      u_vertDeform_offsetTop: { value: -0.5 },
      u_vertDeform_offsetBottom: { value: -0.5 },
      u_vertDeform_noiseFreq: { value: new THREE.Vector2(3, 4) },
      u_vertDeform_noiseAmp: { value: amp },
      u_vertDeform_noiseSpeed: { value: 10 },
      u_vertDeform_noiseFlow: { value: 3 },
      u_vertDeform_noiseSeed: { value: seed },
      
      // Wave layers
      u_waveLayer0_color: { value: colorVecs[1] },
      u_waveLayer0_noiseFreq: { value: new THREE.Vector2(2, 3) },
      u_waveLayer0_noiseSpeed: { value: 11 },
      u_waveLayer0_noiseFlow: { value: 6.5 },
      u_waveLayer0_noiseSeed: { value: seed + 10 },
      u_waveLayer0_noiseFloor: { value: 0.1 },
      u_waveLayer0_noiseCeil: { value: 0.63 },
      
      u_waveLayer1_color: { value: colorVecs[2] },
      u_waveLayer1_noiseFreq: { value: new THREE.Vector2(2.333, 3.333) },
      u_waveLayer1_noiseSpeed: { value: 11.3 },
      u_waveLayer1_noiseFlow: { value: 6.8 },
      u_waveLayer1_noiseSeed: { value: seed + 20 },
      u_waveLayer1_noiseFloor: { value: 0.1 },
      u_waveLayer1_noiseCeil: { value: 0.7 },
      
      u_waveLayer2_color: { value: colorVecs[3] },
      u_waveLayer2_noiseFreq: { value: new THREE.Vector2(2.666, 3.666) },
      u_waveLayer2_noiseSpeed: { value: 11.6 },
      u_waveLayer2_noiseFlow: { value: 7.1 },
      u_waveLayer2_noiseSeed: { value: seed + 30 },
      u_waveLayer2_noiseFloor: { value: 0.1 },
      u_waveLayer2_noiseCeil: { value: 0.77 },
    }
  }, [colors, size, seed])
  
  // Update resolution on resize
  useEffect(() => {
    uniforms.u_resolution.value.set(size.width, size.height)
    uniforms.u_shadow_power.value = size.width < 600 ? 5 : 6
  }, [size, uniforms])
  
  // Animation loop - mimics the original's timing
  useFrame((state) => {
    if (!meshRef.current) return
    
    // Update time continuously
    const currentTime = state.clock.getElapsedTime()
    uniforms.u_time.value = 1253106 + currentTime * 1000
    
    // Force render on every frame
    if (requestRender) {
      requestRender()
    }
  })
  
  // Use higher density for better wave visibility
  const xSegCount = Math.max(100, Math.ceil(size.width * 0.06))
  const ySegCount = Math.max(100, Math.ceil(size.height * 0.16))
  
  return (
    <mesh
      ref={meshRef}
      position={[0, 0, -10]}
      frustumCulled={false}
      renderOrder={-1000}
    >
      <planeGeometry args={[viewport.width, viewport.height, xSegCount, ySegCount]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
        transparent={true}
      />
    </mesh>
  )
}
