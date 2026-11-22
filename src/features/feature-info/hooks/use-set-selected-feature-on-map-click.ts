import { useEffect } from 'react'
import { useMapController } from '#/lib/map/map-provider'
import { ESTATE_OVERLAYER_ID } from '#/shared/map/catalog/overlayer-catalog'
import { useSelectedFeatureStore } from '../stores/selected-feature-store'

export function useSetSelectedFeatureOnMapClick() {
  const mapController = useMapController()
  const setSelectedFeature = useSelectedFeatureStore(
    (store) => store.setSelectedFeature,
  )

  useEffect(() => {
    if (!mapController) return
    return mapController.subscribeToFeatureClick((feature) => {
      // 物件ポイントをクリックしたときは、属性を表示せず物件詳細画面を開くので（GLOSSARY「地物」）、選択中の地物を変えない
      if (feature?.overlayerId === ESTATE_OVERLAYER_ID) return
      setSelectedFeature(feature)
    })
  }, [mapController, setSelectedFeature])
}
