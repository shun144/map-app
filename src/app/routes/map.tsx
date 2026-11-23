import { createFileRoute } from '@tanstack/react-router'
import { DEFAULT_MAP_ID } from '#/config/map'
import { mapInfoQueryOptions } from '#/shared/map/api/fetch-map-info'
import { estatesQueryOptions } from '#/shared/map/api/fetch-estates'
import { MapPage } from '../pages/map-page'
import { readViewportSearch } from '../router/read-location-from-search'

export const Route = createFileRoute('/map')({
  // lng・lat・zoom は、物件の画面から戻るときに物件の位置で地図を開くために使う（指定がなければ保存したビューポート）
  validateSearch: readViewportSearch,
  // 描画前に読み込むのは、地図を最初から保存位置で生成し、初期位置から飛ぶちらつきを出さないため
  loader: ({ context: { queryClient, repositories } }) =>
    Promise.all([
      queryClient.ensureQueryData(
        mapInfoQueryOptions(repositories.mapSnapshot, DEFAULT_MAP_ID),
      ),
      queryClient.ensureQueryData(estatesQueryOptions(repositories.estate)),
    ]),
  pendingComponent: () => (
    <p className="grid h-dvh place-items-center text-slate-500">読み込み中…</p>
  ),
  errorComponent: ({ error }) => (
    <p className="grid h-dvh place-items-center text-red-600">
      地図の読み込みに失敗しました:{' '}
      {error instanceof Error ? error.message : String(error)}
    </p>
  ),
  component: MapPage,
})
