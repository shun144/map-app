import type {
  BasemapDefinition,
  MapFeature,
  OverlayAppearance,
  OverlayDefinition,
  Viewport,
} from './types'

export type Unsubscribe = () => void

/**
 * features が地図ライブラリに依存しないよう、地図への操作はこのインターフェース越しに限る（ADR 0002）。
 * 足りない操作は、生インスタンスを露出させずにここへメソッドを追加する。
 */
export interface MapController {
  /** 操作中を含む現在のビューポート */
  getViewport: () => Viewport
  setViewport: (viewport: Viewport) => void

  setBasemap: (basemap: BasemapDefinition) => void

  addOverlay: (
    definition: OverlayDefinition,
    appearance: OverlayAppearance,
  ) => void
  removeOverlay: (overlayId: string) => void
  updateOverlay: (overlayId: string, appearance: OverlayAppearance) => void
  /** 重なり順を指定する。配列の先頭が最下層 */
  setOverlayOrder: (overlayIds: ReadonlyArray<string>) => void

  /** 地物のクリック。何もない場所をクリックしたときは null */
  onFeatureClick: (
    listener: (feature: MapFeature | null) => void,
  ) => Unsubscribe

  destroy: () => void
}

/** Provider を置く時点では地図を描く DOM がまだないため、完成品ではなく「作り方」を渡す */
export type MapFactory = (
  container: HTMLElement,
  options: { initialViewport: Viewport },
) => MapController
