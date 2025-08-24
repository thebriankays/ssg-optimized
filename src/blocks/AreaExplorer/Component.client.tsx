'use client'

import dynamic from 'next/dynamic'

const AreaExplorer = dynamic(
  () => import('@/components/AreaExplorer/AreaExplorer').then(mod => mod.AreaExplorer),
  { 
    ssr: false,
    loading: () => (
      <div className="area-explorer-loading">
        <div className="loading-spinner">Loading 3D Area Explorer...</div>
      </div>
    )
  }
)

export function AreaExplorerClient({
  config,
  apiKey,
  mapId,
}: {
  config: any
  apiKey: string
  mapId: string
}) {
  return (
    <AreaExplorer
      config={config}
      apiKey={apiKey}
      mapId={mapId}
      className="area-explorer-wrapper"
    />
  )
}
