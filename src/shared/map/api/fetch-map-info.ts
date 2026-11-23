import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { DEFAULT_VIEWPORT } from '#/config/default-viewport'
import { BASE_LAYERS, DEFAULT_BASE_LAYER_ID } from '../catalog/base-layers'
import { OVERLAYER_CATALOG } from '../catalog/overlayer-catalog'
import { useMapSnapshotRepository } from '../storage/repository-context'
import { createLayersMatchingCatalog } from './create-layers-matching-catalog'
import type { MapSnapshotRepository } from '../storage/map-snapshot-repository'
import type { Viewport } from '#/lib/map/types'
import type { Layers } from '../types'

/**
 * viewport は最後に読み込んだか保存したビューポートで、いま見ている位置ではない（ADR 0001）。
 * layers は利用者の操作のたびに書き換わる、いま画面に出ているレイヤー構成。
 */
export type MapInfo = {
  viewport: Viewport
  layers: Layers
}

export const mapInfoQueryKey = (mapId: string) => ['map-info', mapId] as const

/**
 * 本番では API から地図情報を取得する想定だが、API がまだないため、仮の保存先（ADR 0004）から読む。
 * API ができたら queryFn の中身を API の呼び出しに書き換える。
 * ルーターの loader（React の外）からも使えるよう、Repository を引数で受け取る。
 * カタログとの突き合わせを Repository ではなくここで行うのは、保存先の実装ごとに同じ突き合わせのコードを書かないため。
 */
export const mapInfoQueryOptions = (
  repository: MapSnapshotRepository,
  mapId: string,
) =>
  queryOptions({
    queryKey: mapInfoQueryKey(mapId),
    queryFn: async (): Promise<MapInfo> => {
      const mapSnapshot = await repository.load(mapId)
      return {
        viewport: mapSnapshot?.viewport ?? DEFAULT_VIEWPORT,
        layers: createLayersMatchingCatalog(
          mapSnapshot?.layers ?? null,
          OVERLAYER_CATALOG,
          BASE_LAYERS,
          DEFAULT_BASE_LAYER_ID,
        ),
      }
    },
  })

// select に渡す関数をフックの外で定義するのは、フックを呼ぶコンポーネントが描画されるたびに
// 新しい関数が作られ、select が毎回再実行されるのを避けるため
const pickViewport = (mapInfo: MapInfo) => mapInfo.viewport
const pickLayers = (mapInfo: MapInfo) => mapInfo.layers

/**
 * キャッシュは地図情報1つにまとめている。select でビューポートだけを取り出すのは、
 * このフックを使うコンポーネントが、レイヤー操作（キャッシュの layers の書き換え）で再描画されないようにするため。
 */
export function useSavedViewportState(mapId: string) {
  const repository = useMapSnapshotRepository()
  return useSuspenseQuery({
    ...mapInfoQueryOptions(repository, mapId),
    select: pickViewport,
  }).data
}

export function useLayersState(mapId: string) {
  const repository = useMapSnapshotRepository()
  return useSuspenseQuery({
    ...mapInfoQueryOptions(repository, mapId),
    select: pickLayers,
  }).data
}
