import type { Viewport } from '#/lib/map'

/**
 * ビューポートの保存先の窓口。IndexedDB 以外（サーバー API など）へ替えるときは
 * このインターフェースを満たす実装を作り、app 層で差し替える。
 */
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

/** 保存先から読んだ値を検証し、使えない値は null にする */
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
