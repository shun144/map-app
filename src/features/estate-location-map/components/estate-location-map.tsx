import { useEffect } from 'react'
import { MapCanvas } from '#/lib/map/map-canvas'
import { useMapController } from '#/lib/map/map-provider'
import { ESTATE_LOCATION_ZOOM } from '#/config/estate'
import { ESTATE_OVERLAYER_ID } from '#/shared/map/catalog/overlayer-catalog'
import { drawAllLayersOnMap } from '#/shared/map/draw/draw-layers-on-map'
import { updateLayersToShowEstateOnTop } from '../logic/update-layers-to-show-estate-on-top'
import type { LngLat } from '#/value-objects/lng-lat'
import type { Layers } from '#/shared/map/types'

type Props = {
  lngLat: LngLat
  /** 地図画面のレイヤー構成。物件レイヤーの設定だけは使わない */
  layers: Layers
  className?: string
}

/**
 * 物件新規作成画面と物件詳細画面で、物件の位置を確かめるための地図。
 * 地図画面と同じ見た目で確かめられるよう、地図画面のレイヤー構成で描く。
 * 物件レイヤーには、この物件の物件ポイントだけを載せる。
 * 見るだけの地図なので、レイヤー構成の変更も、地図を動かした位置も、どこにも書き込まない。
 */
export function EstateLocationMap({ lngLat, layers, className }: Props) {
  const mapController = useMapController()
  // 依存配列に lngLat ではなく数値を入れるのは、呼び出し側が描画のたびに新しい lngLat を作っても
  // 地図を描き直さないようにするため
  const { lng, lat } = lngLat

  useEffect(() => {
    if (!mapController) return
    // 物件レイヤーを追加する前に点を渡しておくと、追加したときにこの点だけで描かれる
    mapController.setOverlayerPoints(ESTATE_OVERLAYER_ID, [
      { lngLat: { lng, lat }, properties: {} },
    ])
    drawAllLayersOnMap(mapController, updateLayersToShowEstateOnTop(layers))
  }, [mapController, lng, lat, layers])

  return (
    <MapCanvas
      initialViewport={{ center: lngLat, zoom: ESTATE_LOCATION_ZOOM }}
      className={className}
    />
  )
}
