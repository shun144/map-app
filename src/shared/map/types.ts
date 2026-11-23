import type { OverlayerAppearance } from '#/lib/map/types'

/** overlayers は配列の先頭が最下層 */
export type Layers = {
  baseLayerId: string
  overlayers: Array<{
    id: string
    appearance: OverlayerAppearance
  }>
}
