import { useMutation, useQueryClient } from '@tanstack/react-query'
import { viewportQueryKey } from '#/shared/map/storage/fetch-viewport'
import { useMapSnapshotRepository } from '#/shared/map/storage/repository-context'
import type { MapSnapshot } from '#/shared/map/storage/map-snapshot-repository'

export function useSaveMapSnapshot(mapId: string) {
  const mapSnapshotRepository = useMapSnapshotRepository()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (mapSnapshot: MapSnapshot) => {
      await mapSnapshotRepository.save(mapId, mapSnapshot)
      return new Date()
    },
    // キャッシュのビューポートは「保存した値」を表すので、保存できたときだけ合わせる
    onSuccess: (_savedAt, mapSnapshot) => {
      queryClient.setQueryData(viewportQueryKey(mapId), mapSnapshot.viewport)
    },
  })
}
