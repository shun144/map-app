import { createFileRoute } from '@tanstack/react-router'
import { DEFAULT_MAP_ID } from '#/config/map'
import { estateQueryOptions } from '#/shared/map/api/fetch-estates'
import { mapInfoQueryOptions } from '#/shared/map/api/fetch-map-info'
import { EstateDetailPage } from '../../pages/estate-detail-page'

export const Route = createFileRoute('/estate/$estateId')({
  // 描画前に物件を読み込むのは、地図を最初から物件の位置で生成するため。
  // 地図情報も読み込むのは、位置の地図を地図画面のレイヤー構成で描くため（URL で直接開いたときはキャッシュにない）
  loader: ({ context: { queryClient, repositories }, params: { estateId } }) =>
    Promise.all([
      queryClient.ensureQueryData(
        estateQueryOptions(repositories.estate, estateId),
      ),
      queryClient.ensureQueryData(
        mapInfoQueryOptions(repositories.mapSnapshot, DEFAULT_MAP_ID),
      ),
    ]),
  pendingComponent: () => (
    <p className="py-6 text-center text-slate-500">読み込み中…</p>
  ),
  errorComponent: ({ error }) => (
    <p className="py-6 text-center text-red-600">
      物件の読み込みに失敗しました:{' '}
      {error instanceof Error ? error.message : String(error)}
    </p>
  ),
  component: EstateDetailPage,
})
