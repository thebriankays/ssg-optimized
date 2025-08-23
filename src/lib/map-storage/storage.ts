// Storage manager for 3D map data
import fs from 'fs/promises'
import path from 'path'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export class Map3DStorage {
  private storageDir = path.join(process.cwd(), 'public', '3d-maps')
  
  async ensureStorageDir(destinationSlug: string) {
    const destDir = path.join(this.storageDir, destinationSlug)
    await fs.mkdir(destDir, { recursive: true })
    return destDir
  }

  // Save tile data
  async saveTile(destinationSlug: string, tileId: string, data: Buffer) {
    const destDir = await this.ensureStorageDir(destinationSlug)
    const tilePath = path.join(destDir, 'tiles', `${tileId}.b3dm`)
    await fs.mkdir(path.dirname(tilePath), { recursive: true })
    await fs.writeFile(tilePath, data)
    return tilePath
  }

  // Save POI data
  async savePOIData(destinationSlug: string, poiData: any) {
    const destDir = await this.ensureStorageDir(destinationSlug)
    const poiPath = path.join(destDir, 'poi.json')
    await fs.writeFile(poiPath, JSON.stringify(poiData, null, 2))
    return poiPath
  }

  // Save tileset manifest
  async saveTilesetManifest(destinationSlug: string, manifest: any) {
    const destDir = await this.ensureStorageDir(destinationSlug)
    const manifestPath = path.join(destDir, 'tileset.json')
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
    return manifestPath
  }

  // Check if destination data exists
  async hasData(destinationSlug: string): Promise<boolean> {
    try {
      const destDir = path.join(this.storageDir, destinationSlug)
      const manifestPath = path.join(destDir, 'tileset.json')
      await fs.access(manifestPath)
      return true
    } catch {
      return false
    }
  }

  // Get local URL for saved data
  getLocalTilesetUrl(destinationSlug: string): string {
    return `/3d-maps/${destinationSlug}/tileset.json`
  }

  // Update destination record with 3D data status
  async updateDestinationRecord(destinationId: string, has3DData: boolean) {
    const payload = await getPayload({ config: configPromise })
    
    // Note: We now use automatic POI caching instead of manual 3D data storage
    // This method is kept for backwards compatibility but doesn't update any fields
    // POI data is cached automatically via the cachePOIData hook
    console.log(`Map storage status for destination ${destinationId}: ${has3DData ? 'available' : 'not available'}`)
  }
}

export const map3DStorage = new Map3DStorage()
