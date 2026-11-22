import { useEffect } from 'react'
import { useMapController } from '#/lib/map/map-provider'
import { useSelectedFeatureStore } from '../stores/selected-feature-store'

export function useSetSelectedFeatureOnMapClick() {
  const mapController = useMapController()
  const setSelectedFeature = useSelectedFeatureStore(
    (store) => store.setSelectedFeature,
  )

  useEffect(() => {
    if (!mapController) return
    return mapController.subscribeToFeatureClick(setSelectedFeature)
  }, [mapController, setSelectedFeature])
}
