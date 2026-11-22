import type { Viewport } from '#/lib/map/types'
import type { LayerState } from '../types'

export type SavedMapState = {
  viewport: Viewport
  layerState: LayerState
}

/**
 * 保存先を IndexedDB 以外（サーバー API など）に替えられるよう、features はこの型にだけ依存する。
 * ビューポートとレイヤー構成を1レコードにまとめるのは、1回の書き込みで両方を残し、
 * 片方だけ新しい組み合わせで復元される状態を作らないため（ADR 0003）。
 */
export interface MapStateRepository {
  /** 保存データがない・壊れている・版が古いときは null */
  load: (mapId: string) => Promise<SavedMapState | null>
  save: (mapId: string, savedMapState: SavedMapState) => Promise<void>
}

const MAP_STATE_SCHEMA_VERSION = 1

type MapStateRecord = {
  schemaVersion: typeof MAP_STATE_SCHEMA_VERSION
  savedMapState: SavedMapState
}

export function toMapStateRecord(savedMapState: SavedMapState): MapStateRecord {
  return { schemaVersion: MAP_STATE_SCHEMA_VERSION, savedMapState }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

function isViewport(value: unknown): value is Viewport {
  return (
    isRecord(value) &&
    isFiniteNumber(value.zoom) &&
    isRecord(value.center) &&
    isFiniteNumber(value.center.lng) &&
    isFiniteNumber(value.center.lat)
  )
}

function isLayerState(value: unknown): value is LayerState {
  return (
    isRecord(value) &&
    typeof value.basemapId === 'string' &&
    Array.isArray(value.overlays) &&
    value.overlays.every(
      (overlaySetting) =>
        isRecord(overlaySetting) &&
        typeof overlaySetting.overlayId === 'string' &&
        typeof overlaySetting.visible === 'boolean' &&
        typeof overlaySetting.opacity === 'number',
    )
  )
}

/** 保存データは古い版や壊れた値の可能性があるため、型を信用せず中身を確かめる */
export function parseMapStateRecord(
  storedValue: unknown,
): SavedMapState | null {
  if (!isRecord(storedValue)) return null
  if (storedValue.schemaVersion !== MAP_STATE_SCHEMA_VERSION) return null
  const savedMapState = storedValue.savedMapState
  if (
    !isRecord(savedMapState) ||
    !isViewport(savedMapState.viewport) ||
    !isLayerState(savedMapState.layerState)
  ) {
    return null
  }
  return {
    viewport: savedMapState.viewport,
    layerState: savedMapState.layerState,
  }
}
