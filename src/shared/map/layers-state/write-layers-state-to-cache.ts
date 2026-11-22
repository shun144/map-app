import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { layersQueryKey } from './fetch-layers'
import type { Layers } from '../types'

export function useWriteLayersStateToCache(mapId: string) {
  const queryClient = useQueryClient();
  const queryKey = layersQueryKey(mapId);
  return useCallback(
    (nextLayers: Layers) =>
      queryClient.setQueryData(queryKey, nextLayers),
    [queryClient, mapId],
  )
}
