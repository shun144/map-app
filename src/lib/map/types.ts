/** MapLibre の型を features に漏らさないよう、MapController の引数・戻り値はここの型だけで表す（ADR 0002） */

export type LngLat = {
  lng: number
  lat: number
}

export type Viewport = {
  center: LngLat
  zoom: number
}

export type BaseLayerDefinition = {
  id: string
  label: string
  /** XYZ タイル URL テンプレート（{z}/{x}/{y}） */
  tileUrl: string
  attribution: string
  maxZoom: number
}

export type GeometryKind = 'point' | 'line' | 'polygon'

export type OverlayerDefinition = {
  id: string
  label: string
  /** GeoJSON の取得先 URL */
  dataUrl: string
  geometryKind: GeometryKind
  color: string
}

export type OverlayerAppearance = {
  visible: boolean
  /** 0〜1 */
  opacity: number
}

export type MapFeature = {
  overlayerId: string
  overlayerLabel: string
  properties: Record<string, unknown>
}
