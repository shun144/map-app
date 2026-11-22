import type { LngLat } from '#/lib/map/types'

/*
 * URL のクエリは利用者が書き換えられるので、数値でない値や範囲外の値は「指定なし」として捨てる。
 * ルートの validateSearch で使い、画面には検証済みの値だけを渡す。
 */

const readNumberInRange = (value: unknown, min: number, max: number) =>
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value >= min &&
  value <= max
    ? value
    : undefined

export type LngLatSearch = {
  lng?: number
  lat?: number
}

export type ViewportSearch = LngLatSearch & {
  zoom?: number
}

export function readLngLatSearch(
  search: Record<string, unknown>,
): LngLatSearch {
  return {
    lng: readNumberInRange(search.lng, -180, 180),
    lat: readNumberInRange(search.lat, -90, 90),
  }
}

export function readViewportSearch(
  search: Record<string, unknown>,
): ViewportSearch {
  return {
    ...readLngLatSearch(search),
    zoom: readNumberInRange(search.zoom, 0, 24),
  }
}

/** 経度と緯度の両方がそろっていないときは null */
export function findLngLatInSearch({ lng, lat }: LngLatSearch): LngLat | null {
  return lng !== undefined && lat !== undefined ? { lng, lat } : null
}
