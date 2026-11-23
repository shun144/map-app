/** MapLibre の型を features に漏らさないよう、MapController の引数・戻り値はここの型だけで表す（ADR 0002） */

import type { LngLat } from '#/value-objects/lng-lat'

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
  /** GeoJSON の取得先 URL。null のときは、描く点を MapController.setOverlayerPoints で渡す */
  dataUrl: string | null
  geometryKind: GeometryKind
  color: string
}

/** dataUrl が null のオーバーレイヤーに描く点。properties はクリックしたときに MapFeature.properties で返る */
export type MapPoint = {
  lngLat: LngLat
  properties: Record<string, unknown>
}

export type MapRightClick = {
  lngLat: LngLat
  /** 地図の左上を原点とした、右クリックした位置のピクセル座標 */
  pointInMap: { x: number; y: number }
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
