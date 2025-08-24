'use client'

import dynamic from 'next/dynamic'

const Storytelling = dynamic(
  () => import('@/components/Storytelling/Storytelling').then(mod => mod.Storytelling),
  { 
    ssr: false,
    loading: () => (
      <div className="storytelling-loading">
        <div className="loading-spinner">Loading 3D Storytelling...</div>
      </div>
    )
  }
)

export function StorytellingClient({
  config,
  apiKey,
  mapId,
}: {
  config: any
  apiKey: string
  mapId: string
}) {
  return (
    <Storytelling
      config={config}
      apiKey={apiKey}
      mapId={mapId}
      className="storytelling-wrapper"
    />
  )
}
