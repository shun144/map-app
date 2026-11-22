import { useCallback } from 'react'
import { useMapController } from '#/lib/map/map-provider'
import type { Viewport } from '#/lib/map/types'

/**
 * ADR 0001 の例外として、アプリ側から地図を動かす。
 * キャッシュは書き換えない。キャッシュのビューポートは「保存した値」を表すので、
 * 保存ボタンを押すまでは動かした先を反映しない。
 */
export function useMoveToViewport() {
  const mapController = useMapController()
  return useCallback(
    (viewport: Viewport) => mapController?.setViewport(viewport),
    [mapController],
  )
}
