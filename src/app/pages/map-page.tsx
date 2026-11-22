import { MapCanvas } from '#/lib/map/map-canvas'
import { DEFAULT_MAP_ID } from '#/config/map'
import { useSavedViewport } from '#/features/viewport/api/get-viewport'
import { useViewportSync } from '#/features/viewport/hooks/use-viewport-sync'
import { ResetViewportButton } from '#/features/viewport/components/reset-viewport-button'
import { useLayerSync } from '#/features/layers/hooks/use-layer-sync'
import { LayerPanel } from '#/features/layers/components/layer-panel'
import { useFeatureSelection } from '#/features/feature-info/hooks/use-feature-selection'
import { FeatureInfoPanel } from '#/features/feature-info/components/feature-info-panel'

/*
 * feature 同士は import できない（依存ルール）ので、複数の feature をつなぐのはこの画面の役目。
 * useSavedViewport はルートの loader が読み込み済みである前提で呼んでいる。
 */
export function MapPage() {
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
