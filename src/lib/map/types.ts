/**
 * 地図ライブラリに依存しない描画用の型。
 * MapPort の引数・戻り値はすべてここで定義した型だけを使う（ADR 0002）。
 */

export type LngLat = {
  lng: number
  lat: number
}

/** 表示位置（中心座標）と表示縮尺（ズームレベル）の組 */
export type Viewport = {
  center: LngLat
  zoom: number
}

export type BasemapDefinition = {
  id: string
  label: string
  /** XYZ タイル URL テンプレート（{z}/{x}/{y}） */
  tileUrl: string
  attribution: string
  maxZoom: number
}

export type GeometryKind = 'point' | 'line' | 'polygon'

export type OverlayDefinition = {
  id: string
  label: string
  /** GeoJSON の取得先 URL */
  dataUrl: string
  geometryKind: GeometryKind
  color: string
}

/** オーバーレイの描画に必要な、利用者が変えられる値 */
export type OverlayAppearance = {
  visible: boolean
  /** 0〜1 */
  opacity: number
}

/** クリックされた地物 */
export type MapFeature = {
  overlayId: string
  overlayLabel: string
  properties: Record<string, unknown>
}
