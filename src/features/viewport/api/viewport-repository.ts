import type { Viewport } from '#/lib/map/types'

/** 保存先を IndexedDB 以外（サーバー API など）に替えられるよう、features はこの型にだけ依存する */
export interface ViewportRepository {
  /** 保存データがない・壊れている・版が古いときは null */
  load: (mapId: string) => Promise<Viewport | null>
  save: (mapId: string, viewport: Viewport) => Promise<void>
}

export const VIEWPORT_SCHEMA_VERSION = 1

type ViewportRecord = {
  schemaVersion: typeof VIEWPORT_SCHEMA_VERSION
  viewport: Viewport
}

export function toViewportRecord(viewport: Viewport): ViewportRecord {
  return { schemaVersion: VIEWPORT_SCHEMA_VERSION, viewport }
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

/** 保存データは古い版や壊れた値の可能性があるため、型を信用せず中身を確かめる */
export function parseViewportRecord(value: unknown): Viewport | null {
  if (typeof value !== 'object' || value === null) return null
  const record = value as Partial<ViewportRecord>
  if (record.schemaVersion !== VIEWPORT_SCHEMA_VERSION) return null
  const viewport = record.viewport
  if (
    !viewport ||
    !isFiniteNumber(viewport.zoom) ||
    !isFiniteNumber(viewport.center.lng) ||
    !isFiniteNumber(viewport.center.lat)
  ) {
    return null
  }
  return viewport
}
