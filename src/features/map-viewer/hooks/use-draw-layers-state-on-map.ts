import { useEffect } from 'react'
import { hashKey, useQueryClient } from '@tanstack/react-query'
import { useMapController } from '#/lib/map/map-provider'
import { mapInfoQueryKey } from '#/shared/map/api/fetch-map-info'
import { findBaseLayer } from '#/shared/map/catalog/base-layers'
import { findOverlayerDefinition } from '#/shared/map/catalog/overlayer-catalog'
import { findChangesBetweenLayers } from '../logic/find-changes-between-layers'
import type { MapController } from '#/lib/map/map-controller'
import type { MapInfo } from '#/shared/map/api/fetch-map-info'
import type { Layers } from '#/shared/map/types'

/**
 * レイヤー構成は画面からしか変わらないので、キャッシュを正として地図へ一方向に反映する（ADR 0001）。
 * キャッシュの変化は QueryCache を直接購読して受け取る。React の再描画と useEffect の依存配列を
 * 通さずに、「キャッシュが変わった → 地図に描く」の1段で反映するため。
 * 差分だけを描くのは、全部を描き直すと GeoJSON の再読み込みで地図がちらつくため。
 */
export function useDrawLayersStateOnMap(mapId: string) {
  const mapController = useMapController()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!mapController) return

    const readLayersFromCache = () =>
      queryClient.getQueryData<MapInfo>(mapInfoQueryKey(mapId))?.layers

    // 前回描いた構成をこの useEffect の中に持つのは、地図が作り直されると useEffect も動き直し、
    // 新しい地図では前回分なしから描き始められるため
    let lastDrawnLayers: Layers | null = null
    const drawLayersOnMap = (nextLayers: Layers) => {
      if (lastDrawnLayers) {
        drawChangedLayers(mapController, lastDrawnLayers, nextLayers)
      } else {
        drawAllLayers(mapController, nextLayers)
      }
      lastDrawnLayers = nextLayers
    }

    const layersInCache = readLayersFromCache()
    if (layersInCache) drawLayersOnMap(layersInCache)

    const unsubscribe = queryClient
      .getQueryCache()
      .subscribe((queryCacheEvent) => {
        const isMapInfoUpdated =
          queryCacheEvent.type === 'updated' &&
          queryCacheEvent.query.queryHash === hashKey(mapInfoQueryKey(mapId))
        if (!isMapInfoUpdated) return

        const nextLayers = readLayersFromCache()

        // 取得中への切り替えなど、layers が変わらない通知も届くため、同じ構成なら描かない
        if (!nextLayers || nextLayers === lastDrawnLayers) return
        drawLayersOnMap(nextLayers)
      })
    return unsubscribe
  }, [mapController, queryClient, mapId])
}

/**
 * 重なり順を指定しないのは、addOverlayer が追加したオーバーレイヤーを最上位に置くため。
 * 下から順に追加すれば、そのまま指定どおりの重なり順になる
 */
function drawAllLayers(mapController: MapController, layers: Layers) {
  mapController.setBaseLayer(findBaseLayer(layers.baseLayerId))
  for (const overlayerSetting of layers.overlayers) {
    const overlayerDefinition = findOverlayerDefinition(
      overlayerSetting.overlayerId,
    )
    if (overlayerDefinition) {
      mapController.addOverlayer(overlayerDefinition, {
        visible: overlayerSetting.visible,
        opacity: overlayerSetting.opacity,
      })
    }
  }
}

function drawChangedLayers(
  mapController: MapController,
  lastDrawnLayers: Layers,
  nextLayers: Layers,
) {
  const layersChanges = findChangesBetweenLayers(lastDrawnLayers, nextLayers)

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
}
