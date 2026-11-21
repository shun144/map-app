import type { OverlayAppearance } from '#/lib/map'

/** オーバーレイ表示設定：利用者がオーバーレイごとに変えられる値 */
export type OverlaySetting = { overlayId: string } & OverlayAppearance

/** 地図1枚ぶんのレイヤー構成。overlays は配列の先頭が最下層 */
export type LayerState = {
  basemapId: string
  overlays: Array<OverlaySetting>
}
