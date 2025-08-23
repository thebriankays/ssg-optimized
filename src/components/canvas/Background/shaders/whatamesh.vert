precision highp float;

// Attributes
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

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

// Wave layer structure
struct WaveLayer {
  float z;
  vec2 freq;
  float amp;
  float speed;
  float seed;
};

uniform WaveLayer u_waveLayers[3];

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
  
  for (int i = 0; i < 3; i++) {
    WaveLayer layer = u_waveLayers[i];
    
    vec3 noisePos = vec3(
      noiseCoord.x * layer.freq.x + time * layer.speed,
      noiseCoord.y * layer.freq.y,
      layer.seed
    );
    
    float noise = snoise(noisePos);
    totalNoise += noise * layer.amp * layer.z;
    totalWeight += layer.z;
  }
  
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
  float colorMix4 = smoothstep(-1.0, 1.0, noise);
  
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