import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { DEFAULT_VIEWPORT } from '#/config/default-viewport'
import { useMapSnapshotRepository } from './repository-context'
import type { MapSnapshotRepository } from './map-snapshot-repository'

export const viewportQueryKey = (mapId: string) => ['viewport', mapId] as const

/**
 * ルーターの loader（React の外）からも使えるよう、Repository を引数で受け取る。
 * キャッシュ上の値は最後に読み込んだか保存したビューポートで、いま見ている位置ではない。
 * 地図を動かすたびにキャッシュを書き換えないのは、保存ボタンが地図から直接読めば足りるため（ADR 0001）。
 * 保存先は1レコードでも、キャッシュはレイヤー構成と分けている。レイヤー構成は操作のたびに書き換わるので、
 * 同じキャッシュにすると、保存した値しか見ない地図画面までレイヤー操作のたびに再描画されるため。
 */
export const viewportQueryOptions = (
  repository: MapSnapshotRepository,
  mapId: string,
) =>
  queryOptions({
    queryKey: viewportQueryKey(mapId),
    queryFn: async () =>
      (await repository.load(mapId))?.viewport ?? DEFAULT_VIEWPORT,
  })

export function useSavedViewport(mapId: string) {
  const repository = useMapSnapshotRepository()
  return useSuspenseQuery(viewportQueryOptions(repository, mapId)).data
}
