import { createFileRoute } from '@tanstack/react-router'
import { MapCanvas } from '#/lib/map'
import { DEFAULT_MAP_ID } from '#/config/map'
import {
  ResetViewportButton,
  useSavedViewport,
  useViewportSync,
  viewportQueryOptions,
} from '#/features/viewport'
import { LayerPanel, layersQueryOptions, useLayerSync } from '#/features/layers'
import { FeatureInfoPanel, useFeatureSelection } from '#/features/feature-info'

/*
 * ルートは features を並べて配線するだけの薄い層。
 * feature 同士は互いを知らず、MapPort（lib/map）を介して同じ地図を共有する。
 */
export const Route = createFileRoute('/')({
  // 保存データを読み終えてから描画する。地図は保存位置で生成され、初期位置からのちらつきが出ない
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

function MapPage() {
  const savedViewport = useSavedViewport(DEFAULT_MAP_ID)

  useViewportSync(DEFAULT_MAP_ID)
  useLayerSync(DEFAULT_MAP_ID)
  useFeatureSelection()

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <MapCanvas initialViewport={savedViewport} className="absolute inset-0" />
      <div className="absolute top-3 left-3 max-h-[calc(100%-1.5rem)] overflow-y-auto">
        <LayerPanel mapId={DEFAULT_MAP_ID} />
      </div>
      <div className="absolute top-3 right-3 max-h-[calc(100%-1.5rem)] overflow-y-auto">
        <FeatureInfoPanel />
      </div>
      <div className="absolute right-14 bottom-8">
        <ResetViewportButton mapId={DEFAULT_MAP_ID} />
      </div>
    </main>
  )
}
