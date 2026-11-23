import { EstateLocationMap } from './estate-location-map'
import type { LngLat } from '#/lib/map/lng-lat'
import type { Layers } from '#/shared/map/types'

type Props = {
  lngLat: LngLat
  layers: Layers
}

const formatCoordinate = (coordinate: number) => coordinate.toFixed(6)

/** 物件新規作成画面と物件詳細画面の「位置」の欄。物件の位置を小さな地図と経度・緯度で見せる */
export function EstateLocationField({ lngLat, layers }: Props) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-slate-700">位置</p>
      <EstateLocationMap
        lngLat={lngLat}
        layers={layers}
        className="h-56 w-full overflow-hidden rounded-md border border-slate-300"
      />
      <p className="flex gap-4 text-xs text-slate-500 tabular-nums">
        <span>経度 {formatCoordinate(lngLat.lng)}</span>
        <span>緯度 {formatCoordinate(lngLat.lat)}</span>
      </p>
    </div>
  )
}
