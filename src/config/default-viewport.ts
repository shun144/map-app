import type { Viewport } from '#/lib/map/types'

/** サンプルのオーバーレイヤーが東京駅周辺にあるため、初期位置もそこにする */
export const DEFAULT_VIEWPORT: Viewport = {
  center: { lng: 139.7671, lat: 35.6812 },
  zoom: 12,
}
