import { createFileRoute } from '@tanstack/react-router'
import { DEFAULT_MAP_ID } from '#/config/map'
import { mapInfoQueryOptions } from '#/shared/map/api/fetch-map-info'
import { NewEstatePage } from '../../pages/new-estate-page'
import { readLngLatSearch } from '../../router/read-location-from-search'

export const Route = createFileRoute('/estate/new')({
  // 物件の位置は、地図画面で右クリックした位置を URL で受け取る。URL にあるのでリロードしても位置が消えない
  validateSearch: readLngLatSearch,
  // 地図情報を読み込むのは、位置の地図を地図画面のレイヤー構成で描くため。
  // 地図画面を通らずに URL で直接開いたときは、キャッシュに地図情報がないので、ここで保存先から読む
  loader: ({ context: { queryClient, repositories } }) =>
    queryClient.ensureQueryData(
      mapInfoQueryOptions(repositories.mapSnapshot, DEFAULT_MAP_ID),
    ),
  pendingComponent: () => (
    <p className="py-6 text-center text-slate-500">読み込み中…</p>
  ),
  errorComponent: ({ error }) => (
    <p className="py-6 text-center text-red-600">
      地図の読み込みに失敗しました:{' '}
      {error instanceof Error ? error.message : String(error)}
    </p>
  ),
  component: NewEstatePage,
})
