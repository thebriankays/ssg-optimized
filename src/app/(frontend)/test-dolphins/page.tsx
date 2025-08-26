import { Dolphins } from '@/components/canvas/Dolphins'

export default function TestDolphinsPage() {
  return (
    <div className="min-h-screen">
      <h1 className="text-4xl font-bold text-center py-8">Dolphin Scene Test</h1>
      <Dolphins
        dolphinCount={3}
        showBubbles={true}
        showSky={true}
        animationSpeed={1}
        waterColor="#001e0f"
        skyColor="#87CEEB"
        className="test-dolphins"
      />
    </div>
  )
}
