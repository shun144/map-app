import { useContext, useMemo, useState } from 'react'
import { MapContext } from './map-context'
import type { ReactNode } from 'react'
import type { MapFactory, MapController } from './map-controller'

type Props = {
  createMap: MapFactory
  children: ReactNode
}

/** ref ではなく state に入れるのは、地図ができたことを使う側に再描画で知らせるため */
export function MapProvider({ createMap, children }: Props) {
  const [mapController, setMapController] = useState<MapController | null>(null)
  const value = useMemo(
    () => ({ mapController, createMap, setMapController }),
    [mapController, createMap],
  )
  return <MapContext value={value}>{children}</MapContext>
}

function useMapContext() {
  const context = useContext(MapContext)
  if (!context) {
    throw new Error('MapProvider の外で地図を使おうとしています')
  }
  return context
}

export function useMapController(): MapController | null {
  return useMapContext().mapController
}

export { useMapContext }
