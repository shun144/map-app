import { createFileRoute } from '@tanstack/react-router'
import { estateQueryOptions } from '#/shared/map/api/fetch-estates'
import { EstateDetailPage } from '../../pages/estate-detail-page'

export const Route = createFileRoute('/estate/$estateId')({
  // 描画前に読み込むのは、地図を最初から物件の位置で生成するため
  loader: ({ context: { queryClient, repositories }, params: { estateId } }) =>
    queryClient.ensureQueryData(
      estateQueryOptions(repositories.estate, estateId),
    ),
  pendingComponent: () => (
    <p className="grid h-dvh place-items-center text-slate-500">読み込み中…</p>
  ),
  errorComponent: ({ error }) => (
    <p className="grid h-dvh place-items-center text-red-600">
      物件の読み込みに失敗しました:{' '}
      {error instanceof Error ? error.message : String(error)}
    </p>
  ),
  component: EstateDetailPage,
})
