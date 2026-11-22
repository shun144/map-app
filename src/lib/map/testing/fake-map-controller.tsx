import { useMemo } from 'react'
import { MapContext } from '../map-context'
import type { ReactNode } from 'react'
import type { MapController } from '../map-controller'
import type {
  BasemapDefinition,
  MapFeature,
  OverlayAppearance,
  OverlayDefinition,
  Viewport,
} from '../types'

/**
 * 地図ライブラリを MapController の裏に隠したので、本物の地図（WebGL）なしで同期ロジックを検証できる。
 * そのため描画はせず、呼ばれた操作を記録するだけにする。
 */
export type FakeMapController = MapController & {
  calls: Array<{ method: string; args: Array<unknown> }>
  basemap: BasemapDefinition | null
  overlays: Map<string, OverlayAppearance>
  overlayOrder: Array<string>
  emitViewportChange: (viewport: Viewport) => void
  emitFeatureClick: (feature: MapFeature | null) => void
}

export function createFakeMapController(
  initialViewport: Viewport,
): FakeMapController {
  let viewport = initialViewport
  const viewportListeners = new Set<(viewport: Viewport) => void>()
  const clickListeners = new Set<(feature: MapFeature | null) => void>()

  const fake: FakeMapController = {
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

/** テストでは DOM に地図を作れないため、作成済みの MapController を直接配る */
export function FakeMapProvider({
  mapController,
  children,
}: {
  mapController: MapController | null
  children: ReactNode
}) {
  const value = useMemo(
    () => ({
      mapController,
      createMap: () => {
        throw new Error('FakeMapProvider では地図を生成しません')
      },
      setMapController: () => {},
    }),
    [mapController],
  )
  return <MapContext value={value}>{children}</MapContext>
}
