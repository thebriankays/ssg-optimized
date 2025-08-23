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