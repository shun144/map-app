import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { BASEMAPS, DEFAULT_BASEMAP_ID } from '../config/basemaps'
import { OVERLAY_CATALOG } from '../config/overlay-catalog'
import { reconcileLayerState } from '../logic/reconcile-layer-state'
import { useLayerRepository } from './repository-context'
import type { LayerRepository } from './layer-repository'

export const layersQueryKey = (mapId: string) => ['layers', mapId] as const

/** カタログとの突き合わせを Repository ではなくここで行うのは、保存先の実装ごとに同じ処理を書かないため */
export const layersQueryOptions = (
  repository: LayerRepository,
  mapId: string,
) =>
  queryOptions({
    queryKey: layersQueryKey(mapId),
    queryFn: async () =>
      reconcileLayerState(
        await repository.load(mapId),
        OVERLAY_CATALOG,
        BASEMAPS,
        DEFAULT_BASEMAP_ID,
      ),
  })

export function useLayerState(mapId: string) {
  const repository = useLayerRepository()
  return useSuspenseQuery(layersQueryOptions(repository, mapId)).data
}
