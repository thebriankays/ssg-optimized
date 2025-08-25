'use client'

import { Dolphins } from '@/components/canvas/Dolphins'

export default function TestDolphinsPage() {
  return (
    <div style={{ minHeight: '200vh', paddingTop: '50vh' }}>
      <h1>Scroll down to see dolphins</h1>
      <div style={{ height: '50vh' }} />
      
      <Dolphins
        dolphinCount={3}
        showBubbles={true}
        autoCamera={true}
        showSky={true}
        waterColor="#001e0f"
        skyColor="#87CEEB"
        animationSpeed={1}
        className="test-dolphins"
      />
    </div>
  )
}