import { createContext } from 'react'
import type { MapFactory, MapController } from './map-controller'

export type MapContextValue = {
  mapController: MapController | null
  createMap: MapFactory
  setMapController: (mapController: MapController | null) => void
}

export const MapContext = createContext<MapContextValue | null>(null)
