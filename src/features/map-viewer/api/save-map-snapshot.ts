import { useMutation } from '@tanstack/react-query'
import { mapInfoQueryKey } from '#/shared/map/api/fetch-map-info'
import type { MapInfo } from '#/shared/map/api/fetch-map-info'
import { useMapSnapshotRepository } from '#/shared/map/storage/repository-context'
import type { MapSnapshot } from '#/shared/map/storage/map-snapshot-repository'

export function useSaveMapSnapshot(mapId: string) {
  const mapSnapshotRepository = useMapSnapshotRepository()

  return useMutation({
    mutationFn: async (mapSnapshot: MapSnapshot) => {
      await mapSnapshotRepository.save(mapId, mapSnapshot)
      return new Date()
    },
    // 地図情報のキャッシュ（['map-info', mapId]）のビューポートは、最後に保存したビューポートを表す。
    // そのため、保存先への保存が成功したときだけ、キャッシュのビューポートを保存したビューポートで書き換える。
    // レイヤー構成はキャッシュのほうが新しいか同じなので、保存した値で書き換えない
    onSuccess: (_savedAt, mapSnapshot, _onMutateResult, { client }) => {
      client.setQueryData<MapInfo>(
        mapInfoQueryKey(mapId),
        (currentMapInfo) =>
          currentMapInfo && {
            ...currentMapInfo,
            viewport: mapSnapshot.viewport,
          },
      )
    },
  })
}
