import type { Viewport } from '#/lib/map'

/** 保存データがないとき・「初期位置に戻る」で使うビューポート（東京駅） */
export const DEFAULT_VIEWPORT: Viewport = {
  center: { lng: 139.7671, lat: 35.6812 },
  zoom: 12,
}
