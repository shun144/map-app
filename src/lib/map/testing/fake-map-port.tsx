import { useMemo } from 'react'
import { MapContext } from '../map-context'
import type { ReactNode } from 'react'
import type { MapPort } from '../map-port'
import type {
  BasemapDefinition,
  MapFeature,
  OverlayAppearance,
  OverlayDefinition,
  Viewport,
} from '../types'

/**
 * テスト用の MapPort。実際の描画は行わず、呼び出された操作を記録する。
 * 地図ライブラリを MapPort の裏に隠したことで、同期ロジックをこれだけで検証できる。
 */
export type FakeMapPort = MapPort & {
  calls: Array<{ method: string; args: Array<unknown> }>
  basemap: BasemapDefinition | null
  overlays: Map<string, OverlayAppearance>
  overlayOrder: Array<string>
  /** 利用者が地図を動かし終えたことを再現する */
  emitViewportChange: (viewport: Viewport) => void
  emitFeatureClick: (feature: MapFeature | null) => void
}

export function createFakeMapPort(initialViewport: Viewport): FakeMapPort {
  let viewport = initialViewport
  const viewportListeners = new Set<(viewport: Viewport) => void>()
  const clickListeners = new Set<(feature: MapFeature | null) => void>()

  const fake: FakeMapPort = {
    calls: [],
    basemap: null,
    overlays: new Map(),
    overlayOrder: [],

    getViewport: () => viewport,
    setViewport: (next) => {
      record('setViewport', next)
      fake.emitViewportChange(next)
    },
    onViewportChange: (listener) => {
      viewportListeners.add(listener)
      return () => viewportListeners.delete(listener)
    },
    setBasemap: (basemap) => {
      record('setBasemap', basemap.id)
      fake.basemap = basemap
    },
    addOverlay: (definition: OverlayDefinition, appearance) => {
      record('addOverlay', definition.id, appearance)
      fake.overlays.set(definition.id, appearance)
      fake.overlayOrder.push(definition.id)
    },
    removeOverlay: (overlayId) => {
      record('removeOverlay', overlayId)
      fake.overlays.delete(overlayId)
      fake.overlayOrder = fake.overlayOrder.filter((id) => id !== overlayId)
    },
    updateOverlay: (overlayId, appearance) => {
      record('updateOverlay', overlayId, appearance)
      fake.overlays.set(overlayId, appearance)
    },
    setOverlayOrder: (overlayIds) => {
      record('setOverlayOrder', [...overlayIds])
      fake.overlayOrder = [...overlayIds]
    },
    onFeatureClick: (listener) => {
      clickListeners.add(listener)
      return () => clickListeners.delete(listener)
    },
    destroy: () => record('destroy'),

    emitViewportChange: (next) => {
      viewport = next
      viewportListeners.forEach((listener) => listener(next))
    },
    emitFeatureClick: (feature) =>
      clickListeners.forEach((listener) => listener(feature)),
  }

  function record(method: string, ...args: Array<unknown>) {
    fake.calls.push({ method, args })
  }

  return fake
}

/** MapCanvas を使わずに、渡した MapPort を配る Provider */
export function FakeMapProvider({
  port,
  children,
}: {
  port: MapPort | null
  children: ReactNode
}) {
  const value = useMemo(
    () => ({
      port,
      createMap: () => {
        throw new Error('FakeMapProvider では地図を生成しません')
      },
      registerPort: () => {},
    }),
    [port],
  )
  return <MapContext value={value}>{children}</MapContext>
}
