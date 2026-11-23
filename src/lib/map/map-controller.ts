import type {
  BaseLayerDefinition,
  MapFeature,
  MapPoint,
  MapRightClick,
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
  /**
   * dataUrl が null のオーバーレイヤーに描く点を、渡した点で置き換える。
   * 点のデータと表示設定は別々のタイミングで届くので、addOverlayer より前に呼んでもよい
   */
  setOverlayerPoints: (
    overlayerId: string,
    points: ReadonlyArray<MapPoint>,
  ) => void

  /**
   * 地物のクリック。何もない場所をクリックしたときは null。
   * 購読している間だけ、地物の上でカーソルを指の形にする（クリックできることを利用者に見せるため）
   */
  subscribeToFeatureClick: (
    listener: (feature: MapFeature | null) => void,
  ) => Unsubscribe
  /** 地図の右クリック。ブラウザの右クリックメニューは出さない */
  subscribeToRightClick: (
    listener: (rightClick: MapRightClick) => void,
  ) => Unsubscribe
  /** ドラッグ・ズーム・easeTo などで地図が動き始めたとき */
  subscribeToMoveStart: (listener: () => void) => Unsubscribe

  destroy: () => void
}

/** Provider を置く時点では地図を描く DOM がまだないため、完成品ではなく「作り方」を渡す */
export type MapFactory = (
  container: HTMLElement,
  options: { initialViewport: Viewport },
) => MapController
