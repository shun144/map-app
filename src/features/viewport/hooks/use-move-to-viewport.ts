import { useCallback } from 'react'
import { useMapController } from '#/lib/map/map-provider'
import { useSaveViewport } from '../api/save-viewport'
import type { Viewport } from '#/lib/map/types'

/**
 * ADR 0001 の例外として、キャッシュの値を地図へ反映する。
 * 利用者が明示的に頼んだ移動なので、操作中の地図の値を上書きしてしまう心配がない。
 */
export function useMoveToViewport(mapId: string) {
  const mapController = useMapController()
  const { mutate } = useSaveViewport(mapId)
  return useCallback(
    (viewport: Viewport) => {
      mutate(viewport)
      mapController?.setViewport(viewport)
    },
    [mutate, mapController],
  )
}
