'use client'

import { Canvas } from '@react-three/fiber'
import { WhatameshSimple } from '@/components/canvas/Background/WhatameshSimple'

export default function TestDirect() {
  return (
    <div className="fixed inset-0">
      {/* CSS gradient background as fallback */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, #dca8d8 0%, #a3d3f9 25%, #fcd6d6 50%, #eae2ff 75%, #dca8d8 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite',
        }}
      />
      
      {/* Direct Canvas without scroll-rig */}
      <Canvas
        className="absolute inset-0 z-10"
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ 
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: true
        }}
        onCreated={(state) => {
          // Set clear color to transparent
          state.gl.setClearColor(0x000000, 0)
          console.log('Direct canvas created')
        }}
      >
        <WhatameshSimple />
        <ambientLight intensity={0.5} />
      </Canvas>
      
      {/* Content overlay */}
      <div className="absolute inset-0 z-20 p-8 pointer-events-none">
        <div className="pointer-events-auto inline-block">
          <div className="bg-white/80 backdrop-blur p-6 rounded-lg">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Direct Canvas Test
            </h1>
            <p className="text-gray-700">
              This tests the Whatamesh background without the scroll-rig system.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              If you see the animated gradient here but not on the main site,
              the issue is with the scroll-rig integration.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
