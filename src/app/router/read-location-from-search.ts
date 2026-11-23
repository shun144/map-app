import { Latitude, Longitude } from '#/lib/map/lng-lat'
import type { LngLat } from '#/lib/map/lng-lat'

/*
 * URL のクエリは利用者が書き換えられるので、数値でない値や範囲外の値は「指定なし」として捨てる。
 * ルートの validateSearch で使い、画面には検証済みの値だけを渡す。
 */

function readNumberInRange(searchValue: unknown, min: number, max: number) {
  const isNumberInRange =
    typeof searchValue === 'number' &&
    Number.isFinite(searchValue) &&
    searchValue >= min &&
    searchValue <= max
  return isNumberInRange ? searchValue : undefined
}

export type LngLatSearch = {
  lng?: Longitude
  lat?: Latitude
}

export type ViewportSearch = LngLatSearch & {
  zoom?: number
}

export function readLngLatSearch(
  search: Record<string, unknown>,
): LngLatSearch {
  return {
    lng: Longitude.safeParse(search.lng).data,
    lat: Latitude.safeParse(search.lat).data,
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
  const hasLngAndLat = lng !== undefined && lat !== undefined
  return hasLngAndLat ? { lng, lat } : null
}
