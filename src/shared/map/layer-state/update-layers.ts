import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { layersQueryKey } from './fetch-layers'
import type { LayerState } from '../types'

/**
 * 保存先への保存は保存ボタンに任せる（ADR 0003）ので、ここではキャッシュだけを書き換える。
 * 地図への反映は、キャッシュの変化を見ている useLayerSync が行う。
 */
export function useUpdateLayerState(mapId: string) {
  const queryClient = useQueryClient()
  return useCallback(
    (nextLayerState: LayerState) =>
      queryClient.setQueryData(layersQueryKey(mapId), nextLayerState),
    [queryClient, mapId],
  )
}
