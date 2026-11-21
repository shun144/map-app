import { useEffect } from 'react'
import { useMapPort } from '#/lib/map'
import { useSaveViewport } from '../api/save-viewport'
import type { Viewport } from '#/lib/map'

export const VIEWPORT_SAVE_DEBOUNCE_MS = 300

/**
 * 地図 → キャッシュ・保存先の一方向同期（ADR 0001）。
 * 地図の moveend を受けて、連続した移動は最後の1回だけ保存する。
 * キャッシュ → 地図の向きの購読は意図的に作らない（ループ防止）。
 */
export function useViewportSync(mapId: string) {
  const port = useMapPort()
  // useMutation の mutate は参照が安定しているので依存配列に入れても張り直しは起きない
  const { mutate } = useSaveViewport(mapId)

  useEffect(() => {
    if (!port) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const unsubscribe = port.onViewportChange((viewport: Viewport) => {
      clearTimeout(timer)
      timer = setTimeout(() => mutate(viewport), VIEWPORT_SAVE_DEBOUNCE_MS)
    })
    return () => {
      clearTimeout(timer)
      unsubscribe()
    }
  }, [port, mutate])
}
