'use client'

import { WebGLTextWrapper } from './WebGLTextWrapper'

// Example usage of WebGL Text with all features
export function WebGLTextExample() {
  return (
    <div className="webgl-text-examples">
      {/* Basic text */}
      <WebGLTextWrapper
        text="Hello World"
        fontSize={2}
        color="#ffffff"
        className="basic-text"
      />

      {/* Text with reveal animation */}
      <WebGLTextWrapper
        text="Reveal Animation"
        fontSize={3}
        color="#00ff00"
        animation={{
          type: 'reveal',
          duration: 2000,
          delay: 500,
        }}
        useShader={true}
        className="reveal-text"
      />

      {/* Text with wave animation */}
      <WebGLTextWrapper
        text="Wave Effect"
        fontSize={2.5}
        color="#ff00ff"
        animation={{
          type: 'wave',
        }}
        useShader={true}
        className="wave-text"
      />

      {/* Text with glow animation */}
      <WebGLTextWrapper
        text="Glowing Text"
        fontSize={2.5}
        color="#ffff00"
        animation={{
          type: 'glow',
          loop: true,
        }}
        useShader={true}
        className="glow-text"
      />

      {/* Text with post-processing effects */}
      <WebGLTextWrapper
        text="Distorted on Scroll"
        fontSize={4}
        color="#00ffff"
        enablePostProcessing={true}
        className="distorted-text"
        style={{ height: '400px' }}
      />

      {/* Text with outline */}
      <WebGLTextWrapper
        text="Outlined Text"
        fontSize={3}
        color="#ffffff"
        outlineWidth={0.1}
        outlineColor="#ff0000"
        className="outlined-text"
      />

      {/* Text with typewriter effect */}
      <WebGLTextWrapper
        text="This text appears letter by letter..."
        fontSize={2}
        color="#ffffff"
        animation={{
          type: 'typewriter',
          duration: 3000,
        }}
        className="typewriter-text"
      />

      {/* Metallic text */}
      <WebGLTextWrapper
        text="Metallic"
        fontSize={3}
        color="#888888"
        material="physical"
        metalness={1}
        roughness={0.2}
        emissive="#ffffff"
        emissiveIntensity={0.2}
        className="metallic-text"
      />
    </div>
  )
}