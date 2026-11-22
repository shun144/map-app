import { useEffect } from 'react'
import { useMapController } from '#/lib/map/map-provider'
import { useSaveViewport } from '../api/save-viewport'
import type { Viewport } from '#/lib/map/types'

export const VIEWPORT_SAVE_DEBOUNCE_MS = 300

/**
 * 移動のたびに保存すると連続ズームで何十回も書き込むため、最後の移動から 300ms 待って1回だけ保存する。
 * キャッシュ → 地図の購読を作らないのは、自分が書いた値で地図を動かすループになるため（ADR 0001）。
 */
export function useViewportSync(mapId: string) {
  const mapController = useMapController()
  // useMutation の mutate は参照が安定しているので依存配列に入れても張り直しは起きない
  const { mutate } = useSaveViewport(mapId)

  useEffect(() => {
    if (!mapController) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const unsubscribe = mapController.onViewportChange((viewport: Viewport) => {
      clearTimeout(timer)
      timer = setTimeout(() => mutate(viewport), VIEWPORT_SAVE_DEBOUNCE_MS)
    })
    return () => {
      clearTimeout(timer)
      unsubscribe()
    }
  }, [mapController, mutate])
}
