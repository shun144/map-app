import { useEffect, useRef } from 'react'
import { useMapPort } from '#/lib/map'
import { useLayerState } from '../api/get-layers'
import { findBasemap } from '../config/basemaps'
import { findOverlayDefinition } from '../config/overlay-catalog'
import { diffLayerState } from '../logic/diff-layer-state'
import type { MapPort } from '#/lib/map'
import type { LayerState } from '../types'

/**
 * キャッシュ → 地図の一方向同期。ビューポートとは向きが逆（ADR 0001 の Consequences）。
 * 前回反映した状態との差分だけを MapPort に適用する。
 */
export function useLayerSync(mapId: string) {
  const port = useMapPort()
  const state = useLayerState(mapId)
  /** どの地図に、どの状態まで反映済みか */
  const appliedRef = useRef<{ port: MapPort; state: LayerState } | null>(null)

  useEffect(() => {
    if (!port) return
    // 地図が作り直されたら空の地図とみなして全部を反映し直す
    const applied =
      appliedRef.current?.port === port ? appliedRef.current.state : null
    const diff = diffLayerState(applied, state)

    if (diff.basemapId) port.setBasemap(findBasemap(diff.basemapId))
    for (const change of diff.overlayChanges) {
      switch (change.type) {
        case 'add': {
          const definition = findOverlayDefinition(change.overlayId)
          if (definition) port.addOverlay(definition, change.appearance)
          break
        }
        case 'remove':
          port.removeOverlay(change.overlayId)
          break
        case 'update':
          port.updateOverlay(change.overlayId, change.appearance)
          break
      }
    }
    if (diff.overlayOrder) port.setOverlayOrder(diff.overlayOrder)

    appliedRef.current = { port, state }
  }, [port, state])
}
