import { useEffect } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { MapCanvas } from '#/lib/map/map-canvas'
import { DEFAULT_MAP_ID } from '#/config/map'
import { ESTATE_LOCATION_ZOOM } from '#/config/estate'
import { useSavedViewportState } from '#/shared/map/api/fetch-map-info'
import { ResetViewportButton } from '#/features/reset-view/components/reset-viewport-button'
import { useDrawLayersStateOnMap } from '#/features/map-viewer/hooks/use-draw-layers-state-on-map'
import { SaveMapSnapshotButton } from '#/features/map-viewer/components/save-map-snapshot-button'
import { LayerPanel } from '#/features/layer-panel/components/layer-panel'
import { useSetSelectedFeatureOnMapClick } from '#/features/feature-info/hooks/use-set-selected-feature-on-map-click'
import { FeatureInfoPanel } from '#/features/feature-info/components/feature-info-panel'
import { useDrawEstatesOnMap } from '#/features/estate-layer/hooks/use-draw-estates-on-map'
import { useOpenEstateDetailOnPointClick } from '#/features/estate-layer/hooks/use-open-estate-detail-on-point-click'
import { MapContextMenu } from '#/features/map-context-menu/components/map-context-menu'
import { findLngLatInSearch } from '../read-location-from-search'
import { PageMapProvider } from './page-map-provider'

export function MapPage() {
  return (
    <PageMapProvider>
      <MapPageContent />
    </PageMapProvider>
  )
}

/** 地図を使うフックを PageMapProvider の内側で呼ぶため、MapPage から分けている */
function MapPageContent() {
  const savedViewport = useSavedViewportState(DEFAULT_MAP_ID)
  const viewportSearch = useSearch({ from: '/map' })
  const lngLatInSearch = findLngLatInSearch(viewportSearch)
  const navigate = useNavigate()

  useDrawLayersStateOnMap(DEFAULT_MAP_ID)
  useSetSelectedFeatureOnMapClick()
  useDrawEstatesOnMap()
  useOpenEstateDetailOnPointClick()

  // URL の位置は地図を作るときだけ使い、地図を作ったら URL から消す。
  // 残すと、リロードしたときに保存したビューポートではなく URL の位置で開いてしまうため。
  // MapCanvas は作るときの initialViewport しか使わないので、URL から消しても地図は動かない
  const hasViewportInSearch =
    viewportSearch.lng !== undefined ||
    viewportSearch.lat !== undefined ||
    viewportSearch.zoom !== undefined
  useEffect(() => {
    if (!hasViewportInSearch) return
    void navigate({ to: '/map', search: {}, replace: true })
  }, [hasViewportInSearch, navigate])

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <MapCanvas
        initialViewport={
          lngLatInSearch
            ? {
                center: lngLatInSearch,
                zoom: viewportSearch.zoom ?? ESTATE_LOCATION_ZOOM,
              }
            : savedViewport
        }
        className="absolute inset-0"
      />
      <MapContextMenu />
      <div className="absolute top-3 left-3 max-h-[calc(100%-1.5rem)] overflow-y-auto">
        <LayerPanel mapId={DEFAULT_MAP_ID}>
          <SaveMapSnapshotButton mapId={DEFAULT_MAP_ID} />
        </LayerPanel>
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
