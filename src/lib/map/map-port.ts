import type {
  BasemapDefinition,
  MapFeature,
  OverlayAppearance,
  OverlayDefinition,
  Viewport,
} from './types'

export type Unsubscribe = () => void

/**
 * アプリが地図に対して行える操作の全集合。
 * features はこのインターフェース越しにのみ地図を操作する（ADR 0002）。
 * 足りない操作が出たら、生インスタンスを露出させずにここへメソッドを追加する。
 */
export interface MapPort {
  /** 操作中を含む現在のビューポート */
  getViewport: () => Viewport
  /** 明示的な移動操作。moveend も発火する */
  setViewport: (viewport: Viewport) => void
  /** 移動の終了（moveend）ごとに通知する。操作中の毎フレームには通知しない */
  onViewportChange: (listener: (viewport: Viewport) => void) => Unsubscribe

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

/** 地図ライブラリの差し替え口。app 層でどの実装を使うかを決める */
export type MapFactory = (
  container: HTMLElement,
  options: { initialViewport: Viewport },
) => MapPort
