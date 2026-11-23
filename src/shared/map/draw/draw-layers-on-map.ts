import { getBaseLayer } from '../catalog/base-layers'
import { findOverlayerDefinition } from '../catalog/overlayer-catalog'
import { findChangesBetweenLayers } from './find-changes-between-layers'
import type { MapController } from '#/lib/map/map-controller'
import type { Layers } from '../types'

/*
 * レイヤー構成を MapController で地図に描く関数。
 * 地図画面（キャッシュの変化に合わせて描き直す）と、物件の位置の地図（1回だけ描く）の両方が使う。
 */

/**
 * 重なり順を指定しないのは、addOverlayer が追加したオーバーレイヤーを最上位に置くため。
 * 下から順に追加すれば、そのまま指定どおりの重なり順になる
 */
export function drawAllLayersOnMap(
  mapController: MapController,
  layers: Layers,
) {
  mapController.setBaseLayer(getBaseLayer(layers.baseLayerId))
  for (const overlayer of layers.overlayers) {
    const overlayerDefinition = findOverlayerDefinition(overlayer.id)
    if (!overlayerDefinition) continue
    mapController.addOverlayer(overlayerDefinition, overlayer.appearance)
  }
}

export function drawChangedLayersOnMap(
  mapController: MapController,
  lastDrawnLayers: Layers,
  nextLayers: Layers,
) {
  const layersChanges = findChangesBetweenLayers(lastDrawnLayers, nextLayers)

  if (layersChanges.baseLayerId) {
    mapController.setBaseLayer(getBaseLayer(layersChanges.baseLayerId))
  }
  for (const overlayerChange of layersChanges.changedOverlayers) {
    switch (overlayerChange.type) {
      case 'add': {
        const overlayerDefinition = findOverlayerDefinition(overlayerChange.id)
        if (!overlayerDefinition) break
        mapController.addOverlayer(
          overlayerDefinition,
          overlayerChange.appearance,
        )
        break
      }
      case 'remove':
        mapController.removeOverlayer(overlayerChange.id)
        break
      case 'update':
        mapController.updateOverlayerAppearance(
          overlayerChange.id,
          overlayerChange.appearance,
        )
        break
    }
  }
  if (layersChanges.overlayerOrder) {
    mapController.setOverlayerOrder(layersChanges.overlayerOrder)
  }
}
