// types/three-globe.d.ts

declare module 'three-globe' {
  import { Group, Color, Material, Object3D, Vector2, Vector3 } from 'three'

  //
  // THREE-GLOBE: Unofficial extended type declarations.
  // Reference: https://github.com/vasturiano/three-globe
  //

  // Basic object definitions used in the library:
  export interface ArcData {
    startLat?: number
    startLng?: number
    endLat?: number
    endLng?: number
    color?: string | [string, string]
    altitude?: number
    dashLength?: number
    dashGap?: number
    dashInitialGap?: number
    dashAnimateTime?: number
    stroke?: number
    label?: string
    [key: string]: any // allow additional user fields
  }

  export interface PolygonData {
    geometry?: {
      type: string // 'Polygon' | 'MultiPolygon'
      coordinates: any
    }
    capColor?: string
    sideColor?: string
    strokeColor?: string
    altitude?: number
    label?: string
    [key: string]: any
  }

  export interface PathData {
    // For line segments connecting multiple lat/lng points
    pathPoints?: any[] // each point can have lat/lng/alt
    label?: string
    [key: string]: any
  }

  export interface PointData {
    lat?: number
    lng?: number
    altitude?: number
    radius?: number
    color?: string
    label?: string
    [key: string]: any
  }

  export interface HexBinPointData {
    lat?: number
    lng?: number
    weight?: number
    [key: string]: any
  }

  export interface HeatmapData {
    lat?: number
    lng?: number
    weight?: number
    [key: string]: any
  }

  export interface RingData {
    lat?: number
    lng?: number
    altitude?: number
    maxRadius?: number
    propagationSpeed?: number
    repeatPeriod?: number
    color?: string | ((t: number) => string)
    [key: string]: any
  }

  export interface HTMLObjectData {
    lat?: number
    lng?: number
    altitude?: number
    [key: string]: any
  }

  export interface ThreeObjectData {
    lat?: number
    lng?: number
    altitude?: number
    [key: string]: any
  }

  /**
   * The default export is a Three.js Group subclass with numerous data layers.
   */
  export default class ThreeGlobe extends Group {
    constructor()

    // GLOBE LAYER
    globeImageUrl(url?: string): this | string
    bumpImageUrl(url?: string): this | string
    displacementMapUrl(url?: string): this | string
    showGlobe(isVisible?: boolean): this | boolean
    showGraticules(isVisible?: boolean): this | boolean
    showAtmosphere(isVisible?: boolean): this | boolean
    atmosphereColor(color?: string): this | string
    atmosphereAltitude(alt?: number): this | number
    globeMaterial(material?: Material): this | Material

    // POINTS LAYER
    pointsData(data?: PointData[]): this | PointData[]
    pointLat(lat?: number | ((d: PointData) => number)): this | ((d: PointData) => number)
    pointLng(lng?: number | ((d: PointData) => number)): this | ((d: PointData) => number)
    pointColor(color?: string | ((d: PointData) => string)): this | ((d: PointData) => string)
    pointAltitude(alt?: number | ((d: PointData) => number)): this | ((d: PointData) => number)
    pointRadius(rad?: number | ((d: PointData) => number)): this | ((d: PointData) => number)
    pointResolution(res?: number): this | number
    pointsMerge(enable?: boolean): this | boolean
    pointsTransitionDuration(ms?: number): this | number

    // ARCS LAYER
    arcsData(data?: ArcData[]): this | ArcData[]
    arcLabel(label?: string | ((d: ArcData) => string)): this | ((d: ArcData) => string)
    arcStartLat(lat?: number | ((d: ArcData) => number)): this | ((d: ArcData) => number)
    arcStartLng(lng?: number | ((d: ArcData) => number)): this | ((d: ArcData) => number)
    arcEndLat(lat?: number | ((d: ArcData) => number)): this | ((d: ArcData) => number)
    arcEndLng(lng?: number | ((d: ArcData) => number)): this | ((d: ArcData) => number)
    arcColor(
      color?: string | [string, string] | ((d: ArcData) => string | [string, string]),
    ): this | ((d: ArcData) => string | [string, string])
    arcAltitude(alt?: number | ((d: ArcData) => number)): this | ((d: ArcData) => number)
    arcStroke(stroke?: number | ((d: ArcData) => number)): this | ((d: ArcData) => number)
    arcCurveResolution(res?: number): this | number
    arcCircularResolution(res?: number): this | number
    arcDashLength(len?: number | ((d: ArcData) => number)): this | ((d: ArcData) => number)
    arcDashGap(gap?: number | ((d: ArcData) => number)): this | ((d: ArcData) => number)
    arcDashInitialGap(gap?: number | ((d: ArcData) => number)): this | ((d: ArcData) => number)
    arcDashAnimateTime(time?: number | ((d: ArcData) => number)): this | ((d: ArcData) => number)
    arcsTransitionDuration(ms?: number): this | number
    arcsMerge(enable?: boolean): this | boolean

    // POLYGONS LAYER
    polygonsData(data?: PolygonData[]): this | PolygonData[]
    polygonGeoJsonGeometry(
      geo?: ((d: PolygonData) => object) | string,
    ): this | ((d: PolygonData) => object)
    polygonCapColor(
      color?: string | ((d: PolygonData) => string),
    ): this | ((d: PolygonData) => string)
    polygonSideColor(
      color?: string | ((d: PolygonData) => string),
    ): this | ((d: PolygonData) => string)
    polygonStrokeColor(
      color?: string | ((d: PolygonData) => string),
    ): this | ((d: PolygonData) => string)
    polygonAltitude(
      alt?: number | ((d: PolygonData) => number),
    ): this | ((d: PolygonData) => number)
    polygonCapMaterial(
      mat?: Material | ((d: PolygonData) => Material),
    ): this | ((d: PolygonData) => Material)
    polygonSideMaterial(
      mat?: Material | ((d: PolygonData) => Material),
    ): this | ((d: PolygonData) => Material)
    polygonsTransitionDuration(ms?: number): this | number

    // PATHS LAYER
    pathsData(data?: PathData[]): this | PathData[]
    pathLabel(label?: string | ((d: PathData) => string)): this | ((d: PathData) => string)
    pathPoints(points?: string | ((d: PathData) => any[])): this | ((d: PathData) => any[])
    pathPointLat(lat?: number | ((p: any) => number)): this | ((p: any) => number)
    pathPointLng(lng?: number | ((p: any) => number)): this | ((p: any) => number)
    pathPointAlt(alt?: number | ((p: any) => number)): this | ((p: any) => number)
    pathResolution(res?: number): this | number
    pathColor(
      color?: string | [string, string] | ((d: PathData) => string | [string, string]),
    ): this | ((d: PathData) => string | [string, string])
    pathStroke(stroke?: number | ((d: PathData) => number)): this | ((d: PathData) => number)
    pathDashLength(len?: number | ((d: PathData) => number)): this | ((d: PathData) => number)
    pathDashGap(gap?: number | ((d: PathData) => number)): this | ((d: PathData) => number)
    pathDashInitialGap(gap?: number | ((d: PathData) => number)): this | ((d: PathData) => number)
    pathDashAnimateTime(time?: number | ((d: PathData) => number)): this | ((d: PathData) => number)
    pathTransitionDuration(ms?: number): this | number

    // HEATMAP LAYER
    heatmapsData(data?: HeatmapData[]): this | HeatmapData[]

    // HEX BIN LAYER
    hexBinPointsData(data?: HexBinPointData[]): this | HexBinPointData[]
    hexBinPointWeight(
      w?: number | ((d: HexBinPointData) => number),
    ): this | ((d: HexBinPointData) => number)
    hexBinResolution(res?: number): this | number
    hexMargin(margin?: number | ((d: any) => number)): this | ((d: any) => number)
    hexTopColor(col?: (d: any) => string): this | ((d: any) => string)
    hexSideColor(col?: (d: any) => string): this | ((d: any) => string)
    hexAltitude(alt?: (d: any) => number): this | ((d: any) => number)
    hexBinMerge(enable?: boolean): this | boolean
    hexTransitionDuration(ms?: number): this | number

    // HEX POLYGONS LAYER
    hexPolygonsData(data?: PolygonData[]): this | PolygonData[]
    hexPolygonResolution(
      res?: number | ((d: PolygonData) => number),
    ): this | ((d: PolygonData) => number)
    hexPolygonMargin(
      margin?: number | ((d: PolygonData) => number),
    ): this | ((d: PolygonData) => number)
    hexPolygonUseDots(
      use?: boolean | ((d: PolygonData) => boolean),
    ): this | ((d: PolygonData) => boolean)
    hexPolygonColor(col?: (d: PolygonData) => string): this | ((d: PolygonData) => string)
    hexPolygonAltitude(
      alt?: number | ((d: PolygonData) => number),
    ): this | ((d: PolygonData) => number)

    // TILES LAYER
    tilesData(data?: any[]): this | any[]
    tileLabel(label?: string | ((d: any) => string)): this | ((d: any) => string)
    tileLat(lat?: number | ((d: any) => number)): this | ((d: any) => number)
    tileLng(lng?: number | ((d: any) => number)): this | ((d: any) => number)
    tileAltitude(alt?: number | ((d: any) => number)): this | ((d: any) => number)
    tileWidth(width?: number | ((d: any) => number)): this | ((d: any) => number)
    tileHeight(height?: number | ((d: any) => number)): this | ((d: any) => number)
    tileUseGlobeProjection(use?: boolean | ((d: any) => boolean)): this | ((d: any) => boolean)
    tileMaterial(mat?: Material | ((d: any) => Material)): this | ((d: any) => Material)
    tileCurvatureResolution(res?: number | ((d: any) => number)): this | ((d: any) => number)

    // RINGS LAYER
    ringsData(data?: RingData[]): this | RingData[]
    ringLat(lat?: number | ((d: RingData) => number)): this | ((d: RingData) => number)
    ringLng(lng?: number | ((d: RingData) => number)): this | ((d: RingData) => number)
    ringAltitude(alt?: number | ((d: RingData) => number)): this | ((d: RingData) => number)
    ringColor(
      col?: string | [string, string] | ((d: RingData) => string | [string, string]),
    ): this | ((d: RingData) => string | [string, string])
    ringResolution(res?: number): this | number
    ringMaxRadius(r?: number | ((d: RingData) => number)): this | ((d: RingData) => number)
    ringPropagationSpeed(spd?: number | ((d: RingData) => number)): this | ((d: RingData) => number)
    ringRepeatPeriod(ms?: number | ((d: RingData) => number)): this | ((d: RingData) => number)

    // LABELS LAYER
    labelsData(data?: any[]): this | any[]
    labelLat(lat?: number | ((d: any) => number)): this | ((d: any) => number)
    labelLng(lng?: number | ((d: any) => number)): this | ((d: any) => number)
    labelAltitude(alt?: number | ((d: any) => number)): this | ((d: any) => number)
    labelText(txt?: string | ((d: any) => string)): this | ((d: any) => string)
    labelColor(col?: string | ((d: any) => string)): this | ((d: any) => string)
    labelSize(size?: number | ((d: any) => number)): this | ((d: any) => number)
    labelIncludeDot(include?: boolean | ((d: any) => boolean)): this | ((d: any) => boolean)
    labelDotRadius(r?: number | ((d: any) => number)): this | ((d: any) => number)

    // HTML ELEMENTS LAYER
    htmlElementsData(data?: HTMLObjectData[]): this | HTMLObjectData[]
    htmlLat(lat?: number | ((d: HTMLObjectData) => number)): this | ((d: HTMLObjectData) => number)
    htmlLng(lng?: number | ((d: HTMLObjectData) => number)): this | ((d: HTMLObjectData) => number)
    htmlAltitude(
      alt?: number | ((d: HTMLObjectData) => number),
    ): this | ((d: HTMLObjectData) => number)
    htmlElement(
      el?: string | ((d: HTMLObjectData) => HTMLElement),
    ): this | ((d: HTMLObjectData) => HTMLElement)

    // 3D OBJECTS LAYER
    objectsData(data?: ThreeObjectData[]): this | ThreeObjectData[]
    objectLat(
      lat?: number | ((d: ThreeObjectData) => number),
    ): this | ((d: ThreeObjectData) => number)
    objectLng(
      lng?: number | ((d: ThreeObjectData) => number),
    ): this | ((d: ThreeObjectData) => number)
    objectAltitude(
      alt?: number | ((d: ThreeObjectData) => number),
    ): this | ((d: ThreeObjectData) => number)
    objectRotation(
      rot?: { x?: number; y?: number; z?: number } | ((d: ThreeObjectData) => any),
    ): this
    objectFacesSurface(
      face?: boolean | ((d: ThreeObjectData) => boolean),
    ): this | ((d: ThreeObjectData) => boolean)
    objectThreeObject(
      obj?: Object3D | ((d: ThreeObjectData) => Object3D),
    ): this | ((d: ThreeObjectData) => Object3D)

    // CUSTOM LAYER
    customLayerData(data?: any[]): this | any[]
    customThreeObject(fn?: (d: any) => Object3D): this | ((d: any) => Object3D)

    // INTERACTION
    onClick(
      callback?: (layer: string | undefined, data: object | undefined, event: MouseEvent) => void,
    ): this
    onHover(callback?: (layer: string | undefined, data: object | undefined) => void): this

    // RENDER CONTROL
    rendererSize(size?: { width: number; height: number }): this | { width: number; height: number }
    pauseAnimation(): this
    resumeAnimation(): this

    // UTILITY
    getGlobeRadius(): number
    getCoords(lat: number, lng: number, alt?: number): { x: number; y: number; z: number }
    toGeoCoords(coords: { x: number; y: number; z: number }): {
      lat: number
      lng: number
      altitude: number
    }

    // Possibly more methods (some are not documented). Expand as needed.
  }
}
