import type {
  BaseLayerDefinition,
  MapFeature,
  OverlayerAppearance,
  OverlayerDefinition,
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

  setBaseLayer: (baseLayer: BaseLayerDefinition) => void

  addOverlayer: (
    overlayerDefinition: OverlayerDefinition,
    overlayerAppearance: OverlayerAppearance,
  ) => void
  removeOverlayer: (overlayerId: string) => void
  updateOverlayerAppearance: (
    overlayerId: string,
    overlayerAppearance: OverlayerAppearance,
  ) => void
  /** 重なり順を指定する。配列の先頭が最下層 */
  setOverlayerOrder: (overlayerIds: ReadonlyArray<string>) => void

  /** 地物のクリック。何もない場所をクリックしたときは null */
  subscribeToFeatureClick: (
    listener: (feature: MapFeature | null) => void,
  ) => Unsubscribe

  destroy: () => void
}

/** Provider を置く時点では地図を描く DOM がまだないため、完成品ではなく「作り方」を渡す */
export type MapFactory = (
  container: HTMLElement,
  options: { initialViewport: Viewport },
) => MapController
