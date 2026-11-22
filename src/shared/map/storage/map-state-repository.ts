import type { Viewport } from '#/lib/map/types'
import type { LayerState } from '../types'

export type SavedMapState = {
  viewport: Viewport
  layerState: LayerState
}

/**
 * 保存先は差し替える前提（ADR 0004）なので、保存先の外のコードはこの型にだけ依存する。
 * ビューポートとレイヤー構成を1レコードにまとめるのは、1回の書き込みで両方を残し、
 * 片方だけ新しい組み合わせで復元される状態を作らないため（ADR 0003）。
 * 期待する振る舞いは map-state-repository.contract.ts のテストで定義している。
 */
export interface MapStateRepository {
  /** 保存データがない・壊れている・読めない形式のときは null */
  load: (mapId: string) => Promise<SavedMapState | null>
  save: (mapId: string, savedMapState: SavedMapState) => Promise<void>
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

/**
 * 保存先から返る値はアプリの外から来たものなので、どの保存先でも型を信用せず中身を確かめる。
 * 保存先ごとの形式（版番号など）を外したあとの値を渡す。
 */
export function isSavedMapState(value: unknown): value is SavedMapState {
  return (
    isRecord(value) &&
    isViewport(value.viewport) &&
    isLayerState(value.layerState)
  )
}
