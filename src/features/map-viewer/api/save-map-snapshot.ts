import { useMutation } from '@tanstack/react-query'
import { viewportQueryKey } from '#/shared/map/storage/fetch-viewport'
import { useMapSnapshotRepository } from '#/shared/map/storage/repository-context'
import type { MapSnapshot } from '#/shared/map/storage/map-snapshot-repository'

export function useSaveMapSnapshot(mapId: string) {
  const mapSnapshotRepository = useMapSnapshotRepository()

  return useMutation({
    mutationFn: async (mapSnapshot: MapSnapshot) => {
      await mapSnapshotRepository.save(mapId, mapSnapshot)
      return new Date()
    },
    // キャッシュのビューポート（['viewport', mapId]）は、最後に保存したビューポートを表す。
    // そのため、保存先への保存が成功したときだけ、キャッシュのビューポートを保存したビューポートで書き換える
    onSuccess: (_savedAt, mapSnapshot, _onMutateResult, { client }) => {
      client.setQueryData(viewportQueryKey(mapId), mapSnapshot.viewport)
    },
  })
}
