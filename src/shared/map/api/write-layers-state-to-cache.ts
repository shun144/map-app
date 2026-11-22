import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { mapInfoQueryKey } from './fetch-map-info'
import type { MapInfo } from './fetch-map-info'
import type { Layers } from '../types'

export function useWriteLayersStateToCache(mapId: string) {
  const queryClient = useQueryClient()
  return useCallback(
    (layers: Layers) =>
      // 地図情報のキャッシュがまだないときは、レイヤー構成だけの不完全な地図情報を作らずに何もしない
      queryClient.setQueryData<MapInfo>(
        mapInfoQueryKey(mapId),
        (currentMapInfo) => currentMapInfo && { ...currentMapInfo, layers },
      ),
    [queryClient, mapId],
  )
}
