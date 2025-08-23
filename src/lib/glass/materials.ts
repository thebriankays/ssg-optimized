import * as THREE from 'three'

// Glass material configurations
export const GLASS_PRESETS = {
  frosted: {
    transmission: 0.95,
    thickness: 1,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1,
    metalness: 0,
    ior: 1.5,
    reflectivity: 0.5,
    chromaticAberration: 0.03,
    anisotropy: 0.1,
  },
  clear: {
    transmission: 1,
    thickness: 0.5,
    roughness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0,
    envMapIntensity: 1.5,
    metalness: 0,
    ior: 1.45,
    reflectivity: 0.9,
    chromaticAberration: 0.02,
    anisotropy: 0,
  },
  refractive: {
    transmission: 0.98,
    thickness: 2,
    roughness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 2,
    metalness: 0,
    ior: 1.8,
    reflectivity: 1,
    chromaticAberration: 0.05,
    anisotropy: 0.3,
  },
  holographic: {
    transmission: 0.9,
    thickness: 0.8,
    roughness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.2,
    envMapIntensity: 3,
    metalness: 0.1,
    ior: 1.6,
    reflectivity: 1.2,
    chromaticAberration: 0.1,
    anisotropy: 0.8,
  },
  liquid: {
    transmission: 0.92,
    thickness: 1.5,
    roughness: 0.15,
    clearcoat: 0.8,
    clearcoatRoughness: 0.3,
    envMapIntensity: 1.2,
    metalness: 0,
    ior: 1.33,
    reflectivity: 0.7,
    chromaticAberration: 0.04,
    anisotropy: 0.2,
  },
} as const

export type GlassPreset = keyof typeof GLASS_PRESETS

// Glass material factory
export function createGlassMaterial(preset: GlassPreset = 'frosted') {
  const config = GLASS_PRESETS[preset]
  
  return new THREE.MeshPhysicalMaterial({
    transmission: config.transmission,
    thickness: config.thickness,
    roughness: config.roughness,
    clearcoat: config.clearcoat,
    clearcoatRoughness: config.clearcoatRoughness,
    envMapIntensity: config.envMapIntensity,
    metalness: config.metalness,
    ior: config.ior,
    reflectivity: config.reflectivity,
    side: THREE.DoubleSide,
    transparent: true,
  })
}

// Animated glass shader material
export const animatedGlassShader = {
  uniforms: {
    time: { value: 0 },
    tDiffuse: { value: null },
    distortion: { value: 0.1 },
    chromaticAberration: { value: 0.02 },
    refraction: { value: 0.98 },
    saturation: { value: 1.2 },
    brightness: { value: 1.1 },
    flowMap: { value: null },
    flowSpeed: { value: 0.03 },
    cycleTime: { value: 10.0 },
  },
  
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: `
    uniform float time;
    uniform sampler2D tDiffuse;
    uniform sampler2D flowMap;
    uniform float distortion;
    uniform float chromaticAberration;
    uniform float refraction;
    uniform float saturation;
    uniform float brightness;
    uniform float flowSpeed;
    uniform float cycleTime;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    vec3 saturationAdjust(vec3 color, float sat) {
      vec3 gray = vec3(dot(color, vec3(0.299, 0.587, 0.114)));
      return mix(gray, color, sat);
    }
    
    vec2 flowUV(vec2 uv, vec2 flow, float offset) {
      float progress = fract(time * flowSpeed + offset);
      return uv + flow * progress;
    }
    
    void main() {
      // Flow map distortion
      vec2 flow = texture2D(flowMap, vUv).rg * 2.0 - 1.0;
      flow *= distortion;
      
      // Double cycle for seamless animation
      vec2 uv1 = flowUV(vUv, flow, 0.0);
      vec2 uv2 = flowUV(vUv, flow, 0.5);
      
      float flowLerp = abs((fract(time * flowSpeed) - 0.5) * 2.0);
      
      // Chromatic aberration
      vec2 caOffset = vNormal.xy * chromaticAberration;
      
      // Sample with chromatic aberration
      vec3 color1 = vec3(
        texture2D(tDiffuse, uv1 + caOffset * 0.01).r,
        texture2D(tDiffuse, uv1).g,
        texture2D(tDiffuse, uv1 - caOffset * 0.01).b
      );
      
      vec3 color2 = vec3(
        texture2D(tDiffuse, uv2 + caOffset * 0.01).r,
        texture2D(tDiffuse, uv2).g,
        texture2D(tDiffuse, uv2 - caOffset * 0.01).b
      );
      
      vec3 finalColor = mix(color1, color2, flowLerp);
      
      // Refraction based on normal
      float fresnel = pow(1.0 - abs(dot(normalize(vPosition), vNormal)), 2.0);
      finalColor = mix(finalColor, vec3(1.0), fresnel * refraction);
      
      // Color adjustments
      finalColor = saturationAdjust(finalColor, saturation);
      finalColor *= brightness;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
}

// Liquid distortion effect
export const liquidDistortionShader = {
  uniforms: {
    time: { value: 0 },
    tDiffuse: { value: null },
    speed: { value: 0.5 },
    distortion: { value: 3.0 },
    brightness: { value: 1.2 },
    contrast: { value: 1.1 },
    frequency: { value: 3.5 },
    amplitude: { value: 0.03 },
    mouseFactor: { value: new THREE.Vector2(0, 0) },
  },
  
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: `
    uniform float time;
    uniform sampler2D tDiffuse;
    uniform float speed;
    uniform float distortion;
    uniform float brightness;
    uniform float contrast;
    uniform float frequency;
    uniform float amplitude;
    uniform vec2 mouseFactor;
    
    varying vec2 vUv;
    
    void main() {
      vec2 uv = vUv;
      
      // Liquid wave distortion
      float wave1 = sin(uv.y * frequency + time * speed) * amplitude;
      float wave2 = sin(uv.x * frequency * 1.3 + time * speed * 0.8) * amplitude * 0.7;
      
      // Mouse influence
      vec2 mouseOffset = (mouseFactor - 0.5) * 0.1;
      float mouseDistance = length(uv - 0.5 - mouseOffset);
      float mouseInfluence = smoothstep(0.3, 0.0, mouseDistance);
      
      // Apply distortion
      uv.x += wave1 * distortion * 0.01 + mouseInfluence * mouseOffset.x * 0.1;
      uv.y += wave2 * distortion * 0.01 + mouseInfluence * mouseOffset.y * 0.1;
      
      // Radial distortion for liquid effect
      vec2 center = vec2(0.5);
      vec2 toCenter = center - uv;
      float radialDistortion = length(toCenter) * 0.1;
      uv += toCenter * radialDistortion * distortion * 0.01;
      
      vec4 color = texture2D(tDiffuse, uv);
      
      // Adjust brightness and contrast
      color.rgb = (color.rgb - 0.5) * contrast + 0.5;
      color.rgb *= brightness;
      
      gl_FragColor = color;
    }
  `,
}
