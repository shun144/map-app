import { useEffect } from 'react'
import { useMapController } from '#/lib/map/map-provider'
import { useSelectedFeatureStore } from '../stores/selected-feature-store'

export function useFeatureSelection() {
  const mapController = useMapController()
  const select = useSelectedFeatureStore((store) => store.select)

  useEffect(() => {
    if (!mapController) return
    return mapController.onFeatureClick(select)
  }, [mapController, select])
}
