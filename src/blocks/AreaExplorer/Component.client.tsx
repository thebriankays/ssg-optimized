'use client'

import { AreaExplorer } from '@/components/AreaExplorer/AreaExplorer'
import type { AreaExplorerConfig, POI, Tour } from '@/components/AreaExplorer/types'

interface AreaExplorerClientProps {
  config: AreaExplorerConfig
  pois: POI[]
  tours: Tour[]
  apiKey: string
}

export function AreaExplorerClient({
  config,
  pois,
  tours,
  apiKey,
}: AreaExplorerClientProps) {
  return (
    <AreaExplorer
      config={config}
      pois={pois}
      tours={tours}
      apiKey={apiKey}
      className="area-explorer-wrapper"
    />
  )
}