import { MapCanvas } from '#/lib/map/map-canvas'
import { DEFAULT_MAP_ID } from '#/config/map'
import { useSavedViewport } from '#/features/map-viewer/api/get-viewport'
import { ResetViewportButton } from '#/features/map-viewer/components/reset-viewport-button'
import { useLayerSync } from '#/features/map-viewer/hooks/use-layer-sync'
import { LayerPanel } from '#/features/map-viewer/components/layer-panel'
import { useFeatureSelection } from '#/features/map-viewer/hooks/use-feature-selection'
import { FeatureInfoPanel } from '#/features/map-viewer/components/feature-info-panel'

export function MapPage() {
  const savedViewport = useSavedViewport(DEFAULT_MAP_ID)

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
        <ResetViewportButton />
      </div>
    </main>
  )
}
