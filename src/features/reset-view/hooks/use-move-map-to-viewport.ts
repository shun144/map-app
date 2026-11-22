import { useCallback } from 'react'
import { useMapController } from '#/lib/map/map-provider'
import type { Viewport } from '#/lib/map/types'

/**
 * ADR 0001 の例外として、アプリ側から地図を動かす。
 * 動かすだけで保存はしない。どの表示状態を残すかは利用者が保存ボタンで決めるため（ADR 0003）。
 */
export function useMoveMapToViewport() {
  const mapController = useMapController()
  return useCallback(
    (viewport: Viewport) => mapController?.setViewport(viewport),
    [mapController],
  )
}
