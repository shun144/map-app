import type { OverlayerAppearance } from '#/lib/map/types'

export type OverlayerSetting = {
  overlayerId: string
} & OverlayerAppearance

/** overlayers は配列の先頭が最下層 */
export type Layers = {
  baseLayerId: string
  overlayers: Array<OverlayerSetting>
}
