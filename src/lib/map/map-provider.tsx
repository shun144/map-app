import { useContext, useMemo, useState } from 'react'
import { MapContext } from './map-context'
import type { ReactNode } from 'react'
import type { MapFactory, MapPort } from './map-port'

type MapProviderProps = {
  /** どの地図ライブラリで地図を作るか。差し替えはここだけで行う */
  createMap: MapFactory
  children: ReactNode
}

/**
 * 地図インスタンス（MapPort）を保持して配る。
 * インスタンスの生成は MapCanvas が DOM にマウントされたときに行う。
 */
export function MapProvider({ createMap, children }: MapProviderProps) {
  const [port, setPort] = useState<MapPort | null>(null)
  const value = useMemo(
    () => ({ port, createMap, registerPort: setPort }),
    [port, createMap],
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

/** 地図の準備ができるまでは null を返す */
export function useMapPort(): MapPort | null {
  return useMapContext().port
}

export { useMapContext }
