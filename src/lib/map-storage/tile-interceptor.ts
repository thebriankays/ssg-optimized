// Client-side tile interceptor for saving 3D map data
export class TileInterceptor {
  private originalLoader: any
  private tiles: Map<string, ArrayBuffer> = new Map()
  private destinationSlug: string
  private saveEndpoint = '/api/save-3d-tiles'
  private batchSize = 10
  private batchTimeout = 5000 // 5 seconds
  private pendingBatch: Array<{ url: string; data: ArrayBuffer }> = []
  private batchTimer: NodeJS.Timeout | null = null

  constructor(destinationSlug: string) {
    this.destinationSlug = destinationSlug
  }

  // Intercept Cesium 3D Tileset loading
  interceptTilesetLoader(tileset: any) {
    const originalLoadTile = tileset._loadTile

    tileset._loadTile = (tile: any) => {
      const result = originalLoadTile.call(tileset, tile)
      
      // Intercept the tile data when it loads
      if (result && result.then) {
        result.then(() => {
          if (tile.content && tile._contentResource) {
            this.saveTileData(tile._contentResource._url, tile.content)
          }
        })
      }
      
      return result
    }
  }

  // Save tile data
  private async saveTileData(url: string, content: any) {
    try {
      // Extract tile data
      let data: ArrayBuffer | null = null
      
      if (content._model && content._model._loader && content._model._loader._gltf) {
        // GLTF model data
        const gltf = content._model._loader._gltf
        data = gltf.buffers?.[0]?.data || gltf
      } else if (content._arrayBuffer) {
        // Direct array buffer
        data = content._arrayBuffer
      }
      
      if (data) {
        this.pendingBatch.push({ url, data })
        this.scheduleBatchSave()
      }
    } catch (error) {
      console.error('Error extracting tile data:', error)
    }
  }

  // Schedule batch save
  private scheduleBatchSave() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
    }

    if (this.pendingBatch.length >= this.batchSize) {
      this.executeBatchSave()
    } else {
      this.batchTimer = setTimeout(() => {
        this.executeBatchSave()
      }, this.batchTimeout)
    }
  }

  // Execute batch save
  private async executeBatchSave() {
    if (this.pendingBatch.length === 0) return

    const batch = [...this.pendingBatch]
    this.pendingBatch = []

    try {
      // Convert ArrayBuffers to base64 for transmission
      const tiles = batch.map(({ url, data }) => ({
        url,
        data: this.arrayBufferToBase64(data),
        size: data.byteLength,
      }))

      // Send to server
      const response = await fetch(this.saveEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinationSlug: this.destinationSlug,
          tiles,
        }),
      })

      if (!response.ok) {
        console.error('Failed to save tiles:', response.statusText)
      }
    } catch (error) {
      console.error('Error saving tiles:', error)
    }
  }

  // Convert ArrayBuffer to base64
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      const byte = bytes[i]
      if (byte !== undefined) {
        binary += String.fromCharCode(byte)
      }
    }
    return btoa(binary)
  }

  // Save POI data
  async savePOIData(places: google.maps.places.PlaceResult[]) {
    try {
      const response = await fetch(`${this.saveEndpoint}/poi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinationSlug: this.destinationSlug,
          places: places.map(place => ({
            place_id: place.place_id,
            name: place.name,
            vicinity: place.vicinity,
            rating: place.rating,
            types: place.types,
            geometry: {
              location: {
                lat: place.geometry?.location?.lat(),
                lng: place.geometry?.location?.lng(),
              },
            },
          })),
        }),
      })

      if (!response.ok) {
        console.error('Failed to save POI data:', response.statusText)
      }
    } catch (error) {
      console.error('Error saving POI data:', error)
    }
  }

  // Finish and save manifest
  async finish() {
    // Save any remaining tiles
    if (this.pendingBatch.length > 0) {
      await this.executeBatchSave()
    }

    // Notify server that we're done
    try {
      await fetch(`${this.saveEndpoint}/finish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destinationSlug: this.destinationSlug,
          tileCount: this.tiles.size,
        }),
      })
    } catch (error) {
      console.error('Error finishing save:', error)
    }
  }
}
