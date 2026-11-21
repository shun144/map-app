import { createContext } from 'react'
import type { MapFactory, MapPort } from './map-port'

export type MapContextValue = {
  port: MapPort | null
  createMap: MapFactory
  registerPort: (port: MapPort | null) => void
}

export const MapContext = createContext<MapContextValue | null>(null)
