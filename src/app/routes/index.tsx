import { createFileRoute } from '@tanstack/react-router'
import { DEFAULT_MAP_ID } from '#/config/map'
import { viewportQueryOptions } from '#/features/viewport/api/get-viewport'
import { layersQueryOptions } from '#/features/layers/api/get-layers'
import { MapPage } from '../pages/map-page'

export const Route = createFileRoute('/')({
  // 描画前に読み込むのは、地図を最初から保存位置で生成し、初期位置から飛ぶちらつきを出さないため
  loader: ({ context: { queryClient, repositories } }) =>
    Promise.all([
      queryClient.ensureQueryData(
        viewportQueryOptions(repositories.viewport, DEFAULT_MAP_ID),
      ),
      queryClient.ensureQueryData(
        layersQueryOptions(repositories.layers, DEFAULT_MAP_ID),
      ),
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
