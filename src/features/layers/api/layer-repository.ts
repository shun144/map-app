import type { LayerState } from '../types'

/** 保存先を IndexedDB 以外（サーバー API など）に替えられるよう、features はこの型にだけ依存する */
export interface LayerRepository {
  /** 保存データがない・壊れている・版が古いときは null */
  load: (mapId: string) => Promise<LayerState | null>
  save: (mapId: string, state: LayerState) => Promise<void>
}

export const LAYER_SCHEMA_VERSION = 1

type LayerRecord = {
  schemaVersion: typeof LAYER_SCHEMA_VERSION
  state: LayerState
}

export function toLayerRecord(state: LayerState): LayerRecord {
  return { schemaVersion: LAYER_SCHEMA_VERSION, state }
}

function isOverlaySetting(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false
  const setting = value as Record<string, unknown>
  return (
    typeof setting.overlayId === 'string' &&
    typeof setting.visible === 'boolean' &&
    typeof setting.opacity === 'number'
  )
}

/** 保存データは古い版や壊れた値の可能性があるため、型を信用せず中身を確かめる */
export function parseLayerRecord(value: unknown): LayerState | null {
  if (typeof value !== 'object' || value === null) return null
  const record = value as Partial<LayerRecord>
  if (record.schemaVersion !== LAYER_SCHEMA_VERSION) return null
  const state = record.state
  if (
    !state ||
    typeof state.basemapId !== 'string' ||
    !Array.isArray(state.overlays) ||
    !state.overlays.every(isOverlaySetting)
  ) {
    return null
  }
  return state
}
