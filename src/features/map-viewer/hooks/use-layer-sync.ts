import { useEffect, useRef } from 'react'
import { useMapController } from '#/lib/map/map-provider'
import { useLayerState } from '../api/get-layers'
import { findBasemap } from '../config/basemaps'
import { findOverlayDefinition } from '../config/overlay-catalog'
import { diffLayerState } from '../logic/diff-layer-state'
import type { MapController } from '#/lib/map/map-controller'
import type { LayerState } from '../types'

/**
 * レイヤー構成は画面からしか変わらないので、キャッシュを正として地図へ一方向に反映する（ADR 0001）。
 * 差分だけを適用するのは、全部を描き直すと GeoJSON の再読み込みで地図がちらつくため。
 */
export function useLayerSync(mapId: string) {
  const mapController = useMapController()
  const layerState = useLayerState(mapId)
  /** state ではなく ref にするのは、反映記録の更新で再描画を起こさないため */
  const lastAppliedRef = useRef<{
    mapController: MapController
    layerState: LayerState
  } | null>(null)

  useEffect(() => {
    if (!mapController) return
    // 作り直された地図（HMR など）は空なので、前回分と比べると「差分なし」になり何も描かれない。
    // 別の地図なら前回分なしとして全部を反映し直す
    const lastAppliedLayerState =
      lastAppliedRef.current?.mapController === mapController
        ? lastAppliedRef.current.layerState
        : null
    const layerStateDiff = diffLayerState(lastAppliedLayerState, layerState)

    if (layerStateDiff.basemapId) {
      mapController.setBasemap(findBasemap(layerStateDiff.basemapId))
    }
    for (const overlayChange of layerStateDiff.overlayChanges) {
      switch (overlayChange.type) {
        case 'add': {
          const overlayDefinition = findOverlayDefinition(
            overlayChange.overlayId,
          )
          if (overlayDefinition) {
            mapController.addOverlay(
              overlayDefinition,
              overlayChange.appearance,
            )
          }
          break
        }
        case 'remove':
          mapController.removeOverlay(overlayChange.overlayId)
          break
        case 'update':
          mapController.updateOverlay(
            overlayChange.overlayId,
            overlayChange.appearance,
          )
          break
      }
    }
    if (layerStateDiff.overlayOrder) {
      mapController.setOverlayOrder(layerStateDiff.overlayOrder)
    }

    lastAppliedRef.current = { mapController, layerState }
  }, [mapController, layerState])
}
