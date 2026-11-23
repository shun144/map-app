import { useEffect } from 'react'
import { MapCanvas } from '#/lib/map/map-canvas'
import { useMapController } from '#/lib/map/map-provider'
import { ESTATE_LOCATION_ZOOM } from '#/config/estate'
import {
  DEFAULT_BASE_LAYER_ID,
  getBaseLayer,
} from '#/shared/map/catalog/base-layers'
import {
  ESTATE_OVERLAYER_ID,
  findOverlayerDefinition,
} from '#/shared/map/catalog/overlayer-catalog'
import type { LngLat } from '#/lib/map/lng-lat'

type Props = {
  lngLat: LngLat
  className?: string
}

/**
 * 物件新規作成画面と物件詳細画面で、物件の位置を確かめるための地図。
 * 地図画面のレイヤー構成は使わず、既定のベースレイヤーと、この物件の点1つだけを描く。
 * 地図は動かせるが、動かした位置はどこにも保存しない。
 */
export function EstateLocationMap({ lngLat, className }: Props) {
  const mapController = useMapController()
  // 依存配列に lngLat ではなく数値を入れるのは、呼び出し側が描画のたびに新しい lngLat を作っても
  // ベースレイヤーを描き直さないようにするため
  const { lng, lat } = lngLat

  useEffect(() => {
    if (!mapController) return
    const estateOverlayerDefinition =
      findOverlayerDefinition(ESTATE_OVERLAYER_ID)
    if (!estateOverlayerDefinition) return
    mapController.setBaseLayer(getBaseLayer(DEFAULT_BASE_LAYER_ID))
    mapController.setOverlayerPoints(ESTATE_OVERLAYER_ID, [
      { lngLat: { lng, lat }, properties: {} },
    ])
    mapController.addOverlayer(estateOverlayerDefinition, {
      visible: true,
      opacity: 1,
    })
  }, [mapController, lng, lat])

  return (
    <MapCanvas
      initialViewport={{ center: lngLat, zoom: ESTATE_LOCATION_ZOOM }}
      className={className}
    />
  )
}
