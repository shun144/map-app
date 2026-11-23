import { useEffect } from 'react'
import { hashKey, useQueryClient } from '@tanstack/react-query'
import { useMapController } from '#/lib/map/map-provider'
import { mapInfoQueryKey } from '#/shared/map/api/fetch-map-info'
import { getBaseLayer } from '#/shared/map/catalog/base-layers'
import { findOverlayerDefinition } from '#/shared/map/catalog/overlayer-catalog'
import { findChangesBetweenLayers } from '../logic/find-changes-between-layers'
import type { MapController } from '#/lib/map/map-controller'
import type { MapInfo } from '#/shared/map/api/fetch-map-info'
import type { Layers } from '#/shared/map/types'

/**
 * レイヤー構成は画面からしか変わらないので、キャッシュを正として、キャッシュのレイヤー構成を地図に描く。地図からキャッシュへは書き戻さない（ADR 0001）。
 * キャッシュの変化は QueryCache を直接購読して受け取る。React の再描画と useEffect の依存配列を
 * 通さずに、「キャッシュが変わった → 地図に描く」の1段で地図を書き換えるため。
 * 差分だけを描くのは、全部を描き直すと GeoJSON の再読み込みで地図がちらつくため。
 */
export function useDrawLayersStateOnMap(mapId: string) {
  const mapController = useMapController()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!mapController) return

    const readLayersFromCache = () =>
      queryClient.getQueryData<MapInfo>(mapInfoQueryKey(mapId))?.layers

    let lastDrawnLayers: Layers | null = null

    const layersInCache = readLayersFromCache()
    if (layersInCache) {
      lastDrawnLayers = drawLayersOnMap(
        mapController,
        lastDrawnLayers,
        layersInCache,
      )
    }

    const unsubscribe = queryClient
      .getQueryCache()
      .subscribe((queryCacheEvent) => {
        const isMapInfoUpdated =
          queryCacheEvent.type === 'updated' &&
          queryCacheEvent.query.queryHash === hashKey(mapInfoQueryKey(mapId))
        if (!isMapInfoUpdated) return

        const nextLayers = readLayersFromCache()

        // 取得中への切り替えなど、layers が変わらない通知も届くため、同じ構成なら描かない
        const isLayersChanged =
          nextLayers !== undefined && nextLayers !== lastDrawnLayers
        if (!isLayersChanged) return
        lastDrawnLayers = drawLayersOnMap(
          mapController,
          lastDrawnLayers,
          nextLayers,
        )
      })
    return unsubscribe
  }, [mapController, queryClient, mapId])
}

/** 描いた構成を返す。呼び出し側は戻り値で、前回描いた構成の記録を上書きする */
function drawLayersOnMap(
  mapController: MapController,
  lastDrawnLayers: Layers | null,
  nextLayers: Layers,
): Layers {
  if (lastDrawnLayers) {
    drawChangedLayersOnMap(mapController, lastDrawnLayers, nextLayers)
  } else {
    drawAllLayersOnMap(mapController, nextLayers)
  }
  return nextLayers
}

/**
 * 重なり順を指定しないのは、addOverlayer が追加したオーバーレイヤーを最上位に置くため。
 * 下から順に追加すれば、そのまま指定どおりの重なり順になる
 */
function drawAllLayersOnMap(mapController: MapController, layers: Layers) {
  mapController.setBaseLayer(getBaseLayer(layers.baseLayerId))
  for (const overlayer of layers.overlayers) {
    const overlayerDefinition = findOverlayerDefinition(overlayer.id)
    if (!overlayerDefinition) continue
    mapController.addOverlayer(overlayerDefinition, overlayer.appearance)
  }
}

function drawChangedLayersOnMap(
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
