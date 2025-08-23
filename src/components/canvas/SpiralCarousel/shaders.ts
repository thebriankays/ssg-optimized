export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying float vProgress;
  
  uniform float uProgress;
  uniform float uActive;
  uniform float uTime;
  uniform float uZoomScale;
  uniform float uWaveMultiplier;
  
  // Swirl distortion function
  vec2 swirl(vec2 uv, float radius, float angle, vec2 center) {
    vec2 tc = uv - center;
    float dist = length(tc);
    
    if (dist < radius) {
      float percent = (radius - dist) / radius;
      float theta = percent * percent * angle;
      float s = sin(theta);
      float c = cos(theta);
      tc = vec2(dot(tc, vec2(c, -s)), dot(tc, vec2(s, c)));
    }
    
    return tc + center;
  }
  
  void main() {
    vUv = uv;
    vProgress = uProgress;
    
    vec3 pos = position;
    
    // Apply swirl effect based on active state
    if (uActive > 0.5) {
      vec2 swirlUv = swirl(uv, 0.8, uActive * 2.0 * sin(uTime * 2.0), vec2(0.5));
      
      // Apply wave distortion
      float wave = cos(swirlUv.x * 10.0 + uTime) * cos(swirlUv.y * 10.0 + uTime) * 0.02;
      pos.z += wave * uWaveMultiplier * uActive;
    }
    
    // Scale based on progress and zoom
    pos *= 1.0 + uProgress * 0.1 + uZoomScale;
    
    vPosition = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

export const fragmentShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying float vProgress;
  
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uActive;
  uniform float uBrightness;
  uniform float uOpacity;
  uniform vec2 uTextureSize;
  uniform vec2 uPlaneSize;
  
  // Calculate proper UV coordinates for texture coverage
  vec2 getCoverUv(vec2 uv, vec2 textureSize, vec2 planeSize) {
    vec2 ratio = vec2(
      min(planeSize.x / textureSize.x, planeSize.y / textureSize.y),
      max(planeSize.x / textureSize.x, planeSize.y / textureSize.y)
    );
    
    vec2 newUv = uv * ratio.x / ratio.y;
    newUv += (1.0 - ratio.x / ratio.y) * 0.5;
    
    return newUv;
  }
  
  void main() {
    vec2 uv = getCoverUv(vUv, uTextureSize, uPlaneSize);
    
    // Add slight distortion for active items
    if (uActive > 0.5) {
      float distortion = sin(uv.x * 10.0 + uTime) * sin(uv.y * 10.0 + uTime) * 0.01;
      uv += distortion * uActive;
    }
    
    vec4 color = texture2D(uTexture, uv);
    
    // Apply brightness and opacity
    color.rgb *= uBrightness;
    color.a *= uOpacity;
    
    // Add glow effect for active items
    if (uActive > 0.5) {
      float glow = smoothstep(0.0, 0.3, 1.0 - length(vUv - 0.5)) * uActive * 0.3;
      color.rgb += glow;
    }
    
    gl_FragColor = color;
  }
`