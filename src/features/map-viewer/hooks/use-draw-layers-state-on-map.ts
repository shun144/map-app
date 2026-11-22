import { useEffect, useRef } from 'react'
import { useMapController } from '#/lib/map/map-provider'
import { useLayersState } from '#/shared/map/layers-state/fetch-layers'
import { findBaseLayer } from '#/shared/map/catalog/base-layers'
import { findOverlayerDefinition } from '#/shared/map/catalog/overlayer-catalog'
import { findChangesBetweenLayers } from '../logic/find-changes-between-layers'
import type { MapController } from '#/lib/map/map-controller'
import type { Layers } from '#/shared/map/types'

/**
 * レイヤー構成は画面からしか変わらないので、キャッシュを正として地図へ一方向に反映する（ADR 0001）。
 * 差分だけを描くのは、全部を描き直すと GeoJSON の再読み込みで地図がちらつくため。
 */
export function useDrawLayersStateOnMap(mapId: string) {
  const mapController = useMapController()
  const layersState = useLayersState(mapId)
  /** state ではなく ref にするのは、描いた記録の更新で再描画を起こさないため */
  const lastDrawnRef = useRef<{
    mapController: MapController
    layers: Layers
  } | null>(null)

  useEffect(() => {
    if (!mapController) return
    // 作り直された地図（HMR など）は空なので、前回分と比べると「差分なし」になり何も描かれない。
    // 別の地図なら前回分なしとして全部を反映し直す
    const lastDrawnLayers =
      lastDrawnRef.current?.mapController === mapController
        ? lastDrawnRef.current.layers
        : null
    const layersChanges = findChangesBetweenLayers(lastDrawnLayers, layersState)

    if (layersChanges.baseLayerId) {
      mapController.setBaseLayer(findBaseLayer(layersChanges.baseLayerId))
    }
    for (const overlayerChange of layersChanges.overlayerChanges) {
      switch (overlayerChange.type) {
        case 'add': {
          const overlayerDefinition = findOverlayerDefinition(
            overlayerChange.overlayerId,
          )
          if (overlayerDefinition) {
            mapController.addOverlayer(
              overlayerDefinition,
              overlayerChange.overlayerAppearance,
            )
          }
          break
        }
        case 'remove':
          mapController.removeOverlayer(overlayerChange.overlayerId)
          break
        case 'update':
          mapController.updateOverlayerAppearance(
            overlayerChange.overlayerId,
            overlayerChange.overlayerAppearance,
          )
          break
      }
    }
    if (layersChanges.overlayerOrder) {
      mapController.setOverlayerOrder(layersChanges.overlayerOrder)
    }

    lastDrawnRef.current = { mapController, layers: layersState }
  }, [mapController, layersState])
}
