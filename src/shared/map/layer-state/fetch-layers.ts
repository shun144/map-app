import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { BASEMAPS, DEFAULT_BASEMAP_ID } from '../catalog/basemaps'
import { OVERLAY_CATALOG } from '../catalog/overlay-catalog'
import { reconcileLayerState } from './reconcile-layer-state'
import { useMapStateRepository } from '../storage/repository-context'
import type { MapStateRepository } from '../storage/map-state-repository'

export const layersQueryKey = (mapId: string) => ['layers', mapId] as const

/** カタログとの突き合わせを Repository ではなくここで行うのは、保存先の実装ごとに同じ処理を書かないため */
export const layersQueryOptions = (
  repository: MapStateRepository,
  mapId: string,
) =>
  queryOptions({
    queryKey: layersQueryKey(mapId),
    queryFn: async () =>
      reconcileLayerState(
        (await repository.load(mapId))?.layerState ?? null,
        OVERLAY_CATALOG,
        BASEMAPS,
        DEFAULT_BASEMAP_ID,
      ),
  })

export function useLayerState(mapId: string) {
  const repository = useMapStateRepository()
  return useSuspenseQuery(layersQueryOptions(repository, mapId)).data
}
