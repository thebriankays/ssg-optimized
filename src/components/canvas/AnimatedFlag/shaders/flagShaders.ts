export const flagVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  uniform float uTime;
  uniform float uWindStrength;
  uniform vec3 uWindDirection;
  uniform float uFlagWidth;
  uniform float uFlagHeight;
  
  // Simple noise function
  float noise(vec3 p) {
    return sin(p.x) * sin(p.y) * sin(p.z);
  }
  
  // Wave function for flag animation
  float wave(vec2 uv, float time, float strength) {
    float wave1 = sin(uv.x * 8.0 + time * 2.0) * 0.1;
    float wave2 = sin(uv.x * 12.0 + time * 3.0) * 0.05;
    float wave3 = sin(uv.y * 6.0 + time * 1.5) * 0.03;
    
    // Distance from pole affects wave strength
    float distanceFromPole = uv.x;
    float waveStrength = distanceFromPole * distanceFromPole * strength;
    
    return (wave1 + wave2 + wave3) * waveStrength;
  }
  
  void main() {
    vUv = uv;
    
    vec3 pos = position;
    
    // Calculate wave displacement
    float waveDisplacement = wave(uv, uTime, uWindStrength);
    
    // Apply wind direction
    pos += normalize(uWindDirection) * waveDisplacement;
    
    // Add vertical wave motion
    pos.y += sin(uv.x * 6.0 + uTime * 2.0) * 0.02 * uWindStrength * uv.x;
    
    // Calculate normal for lighting
    vec3 tangent = normalize(vec3(1.0, 0.0, waveDisplacement * 10.0));
    vec3 bitangent = normalize(vec3(0.0, 1.0, 0.0));
    vNormal = normalize(cross(tangent, bitangent));
    
    vPosition = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

export const flagFragmentShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  uniform sampler2D uFlagTexture;
  uniform float uTime;
  uniform vec3 uFlagColor;
  uniform float uOpacity;
  
  void main() {
    vec4 textureColor = texture2D(uFlagTexture, vUv);
    
    // Apply flag color tint
    vec3 finalColor = textureColor.rgb * uFlagColor;
    
    // Add lighting based on normal
    vec3 lightDirection = normalize(vec3(1.0, 1.0, 1.0));
    float NdotL = max(dot(normalize(vNormal), lightDirection), 0.0);
    finalColor *= 0.7 + 0.3 * NdotL;
    
    // Add subtle wave shimmer
    float shimmer = sin(vUv.x * 20.0 + uTime * 5.0) * 0.05 + 0.95;
    finalColor *= shimmer;
    
    gl_FragColor = vec4(finalColor, textureColor.a * uOpacity);
  }
`