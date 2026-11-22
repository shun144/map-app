import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMapController } from '#/lib/map/map-provider'
import { ESTATE_OVERLAYER_ID } from '#/shared/map/catalog/overlayer-catalog'

export function useOpenEstateDetailOnPointClick() {
  const mapController = useMapController()
  const navigate = useNavigate()

  useEffect(() => {
    if (!mapController) return
    return mapController.subscribeToFeatureClick((feature) => {
      if (feature?.overlayerId !== ESTATE_OVERLAYER_ID) return
      const estateId = feature.properties.estateId
      if (typeof estateId !== 'string') return
      void navigate({ to: '/estate/$estateId', params: { estateId } })
    })
  }, [mapController, navigate])
}
