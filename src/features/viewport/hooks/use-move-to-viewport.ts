import { useCallback } from 'react'
import { useMapPort } from '#/lib/map'
import { useSaveViewport } from '../api/save-viewport'
import type { Viewport } from '#/lib/map'

/**
 * 明示的な移動操作。ADR 0001 の例外で、キャッシュの値を地図へ反映する数少ない経路。
 * 先にキャッシュ・保存先を更新してから地図を動かす。
 */
export function useMoveToViewport(mapId: string) {
  const port = useMapPort()
  const { mutate } = useSaveViewport(mapId)
  return useCallback(
    (viewport: Viewport) => {
      mutate(viewport)
      port?.setViewport(viewport)
    },
    [mutate, port],
  )
}
