import type { OverlayAppearance } from '#/lib/map/types'

export type OverlaySetting = { overlayId: string } & OverlayAppearance

/** overlays は配列の先頭が最下層 */
export type LayerState = {
  basemapId: string
  overlays: Array<OverlaySetting>
}
