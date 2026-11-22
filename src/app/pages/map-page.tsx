import { MapCanvas } from '#/lib/map/map-canvas'
import { DEFAULT_MAP_ID } from '#/config/map'
import { useSavedViewport } from '#/shared/map/api/fetch-map-info'
import { ResetViewportButton } from '#/features/reset-view/components/reset-viewport-button'
import { useDrawLayersStateOnMap } from '#/features/map-viewer/hooks/use-draw-layers-state-on-map'
import { SaveMapSnapshotButton } from '#/features/map-viewer/components/save-map-snapshot-button'
import { LayerPanel } from '#/features/layer-panel/components/layer-panel'
import { useSetSelectedFeatureOnMapClick } from '#/features/feature-info/hooks/use-set-selected-feature-on-map-click'
import { FeatureInfoPanel } from '#/features/feature-info/components/feature-info-panel'

export function MapPage() {
  const savedViewport = useSavedViewport(DEFAULT_MAP_ID)

  useDrawLayersStateOnMap(DEFAULT_MAP_ID)
  useSetSelectedFeatureOnMapClick()

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <MapCanvas initialViewport={savedViewport} className="absolute inset-0" />
      <div className="absolute top-3 left-3 max-h-[calc(100%-1.5rem)] overflow-y-auto">
        <LayerPanel mapId={DEFAULT_MAP_ID}>
          <SaveMapSnapshotButton mapId={DEFAULT_MAP_ID} />
        </LayerPanel>
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
