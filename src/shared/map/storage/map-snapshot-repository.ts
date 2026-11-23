import { LngLat } from '#/value-objects/lng-lat'
import type { Viewport } from '#/lib/map/types'
import type { Layers } from '../types'

export type MapSnapshot = {
  viewport: Viewport
  layers: Layers
}

/**
 * 保存先は差し替える前提（ADR 0004）なので、保存先の外のコードはこの型にだけ依存する。
 * ビューポートとレイヤー構成を1レコードにまとめるのは、1回の書き込みで両方を残し、
 * 片方だけ新しい組み合わせで復元される状態を作らないため（ADR 0003）。
 */
export interface MapSnapshotRepository {
  /** 保存データがない・壊れている・読めない形式のときは null */
  load: (mapId: string) => Promise<MapSnapshot | null>
  save: (mapId: string, mapSnapshot: MapSnapshot) => Promise<void>
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

function isViewport(value: unknown): value is Viewport {
  return (
    isRecord(value) &&
    isFiniteNumber(value.zoom) &&
    LngLat.safeParse(value.center).success
  )
}

function isLayers(value: unknown): value is Layers {
  return (
    isRecord(value) &&
    typeof value.baseLayerId === 'string' &&
    Array.isArray(value.overlayers) &&
    value.overlayers.every(
      (overlayer) =>
        isRecord(overlayer) &&
        typeof overlayer.id === 'string' &&
        isRecord(overlayer.appearance) &&
        typeof overlayer.appearance.visible === 'boolean' &&
        typeof overlayer.appearance.opacity === 'number',
    )
  )
}

/**
 * 保存先から返る値はアプリの外から来たものなので、どの保存先でも型を信用せず中身を確かめる。
 * 保存先ごとの形式（版番号など）を外したあとの値を渡す。
 */
export function isMapSnapshot(value: unknown): value is MapSnapshot {
  return isRecord(value) && isViewport(value.viewport) && isLayers(value.layers)
}
