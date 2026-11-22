import { useEffect } from 'react'
import { useMapController } from '#/lib/map/map-provider'
import { useEstates } from '#/shared/map/api/fetch-estates'
import { ESTATE_OVERLAYER_ID } from '#/shared/map/catalog/overlayer-catalog'

/**
 * 物件レイヤーの表示/非表示・不透明度・重なり順は、ほかのオーバーレイヤーと同じく useDrawLayersStateOnMap が描く。
 * このフックが描くのは、物件レイヤーに載せる点（物件ポイント）だけ。
 */
export function useDrawEstatesOnMap() {
  const mapController = useMapController()
  const estates = useEstates()

  useEffect(() => {
    if (!mapController) return
    mapController.setOverlayerPoints(
      ESTATE_OVERLAYER_ID,
      // estateId は、物件ポイントをクリックしたときに物件詳細画面を開くために使う
      estates.map((estate) => ({
        lngLat: estate.lngLat,
        properties: { estateId: estate.id, name: estate.name },
      })),
    )
  }, [mapController, estates])
}
