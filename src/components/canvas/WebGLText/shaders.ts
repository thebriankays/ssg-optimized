export const textVertexShader = /* glsl */ `
uniform float uProgress;
uniform float uHeight;
uniform float uTime;
uniform float uWaveIntensity;
uniform float uWaveFrequency;

varying vec2 vUv;
varying float vProgress;

void main() {
    vUv = uv;
    vProgress = uProgress;
    
    vec3 transformedPosition = position;
    
    // Vertical reveal animation
    transformedPosition.y -= uHeight * (1.0 - uProgress);
    
    // Wave distortion
    float wave = sin(position.x * uWaveFrequency + uTime) * uWaveIntensity;
    transformedPosition.y += wave * uProgress;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformedPosition, 1.0);
}
`

export const textFragmentShader = /* glsl */ `
uniform float uProgress;
uniform vec3 uColor;
uniform float uOpacity;
uniform float uGlow;
uniform float uTime;

varying vec2 vUv;
varying float vProgress;

void main() {
    // Calculate the reveal threshold (bottom to top reveal)
    float reveal = 1.0 - vUv.y;
    
    // Discard fragments above the reveal threshold based on progress
    if (reveal > uProgress) discard;
    
    // Add glow effect at the reveal edge
    float edgeDistance = abs(reveal - uProgress);
    float glowIntensity = smoothstep(0.1, 0.0, edgeDistance) * uGlow;
    
    // Apply the color with glow
    vec3 finalColor = uColor + vec3(glowIntensity);
    
    // Fade in opacity
    float opacity = uOpacity * uProgress;
    
    gl_FragColor = vec4(finalColor, opacity);
}
`

export const postProcessingVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const postProcessingFragmentShader = /* glsl */ `
uniform sampler2D tDiffuse;
uniform float uVelocity;
uniform float uTime;
uniform float uDistortion;
uniform float uRGBShift;

varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    
    // Wave distortion based on velocity
    float waveAmplitude = uVelocity * uDistortion * 0.001;
    float waveFrequency = 4.0 + uVelocity * 0.01;
    
    // Apply wave distortion to UV coordinates
    vec2 waveUv = uv;
    waveUv.x += sin(uv.y * waveFrequency + uTime) * waveAmplitude;
    waveUv.y += sin(uv.x * waveFrequency * 5.0 + uTime * 0.8) * waveAmplitude;
    
    // RGB channel shift for chromatic aberration
    float shift = uVelocity * uRGBShift * 0.0005;
    float r = texture2D(tDiffuse, vec2(waveUv.x - shift, waveUv.y)).r;
    float g = texture2D(tDiffuse, waveUv).g;
    float b = texture2D(tDiffuse, vec2(waveUv.x + shift, waveUv.y)).b;
    
    gl_FragColor = vec4(r, g, b, 1.0);
}
`