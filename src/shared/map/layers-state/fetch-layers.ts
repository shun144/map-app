import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { BASE_LAYERS, DEFAULT_BASE_LAYER_ID } from '../catalog/base-layers'
import { OVERLAYER_CATALOG } from '../catalog/overlayer-catalog'
import { createLayersMatchingCatalog } from './create-layers-matching-catalog'
import { useMapSnapshotRepository } from '../storage/repository-context'
import type { MapSnapshotRepository } from '../storage/map-snapshot-repository'

export const layersQueryKey = (mapId: string) => ['layers', mapId] as const

/** カタログとの突き合わせを Repository ではなくここで行うのは、保存先の実装ごとに同じ処理を書かないため */
export const layersQueryOptions = (
  repository: MapSnapshotRepository,
  mapId: string,
) =>
  queryOptions({
    queryKey: layersQueryKey(mapId),
    queryFn: async () =>
      createLayersMatchingCatalog(
        (await repository.load(mapId))?.layers ?? null,
        OVERLAYER_CATALOG,
        BASE_LAYERS,
        DEFAULT_BASE_LAYER_ID,
      ),
  })

export function useLayersState(mapId: string) {
  const repository = useMapSnapshotRepository()
  return useSuspenseQuery(layersQueryOptions(repository, mapId)).data
}
