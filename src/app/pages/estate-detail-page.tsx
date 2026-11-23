import { Link, useParams } from '@tanstack/react-router'
import { ESTATE_LOCATION_ZOOM } from '#/config/estate'
import { DEFAULT_MAP_ID } from '#/config/map'
import { useLayersState } from '#/shared/map/api/fetch-map-info'
import { useEstate } from '#/shared/map/api/fetch-estates'
import { EstateLocationField } from '#/features/estate-location-map/components/estate-location-field'
import { PageMapProvider } from '../providers/page-map-provider'

export function EstateDetailPage() {
  const { estateId } = useParams({ from: '/estate/$estateId' })
  const estate = useEstate(estateId)
  const layersState = useLayersState(DEFAULT_MAP_ID)

  if (!estate) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-slate-700">
        <p>物件が見つかりません</p>
        <Link to="/map" className="text-sm text-blue-700 underline">
          地図画面へ
        </Link>
      </div>
    )
  }

  return (
    <>
      <h1 className="mb-6 text-lg font-semibold text-slate-800">物件詳細</h1>
      <div className="space-y-5">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-700">物件名</p>
          {/* 入力欄と同じ枠で見せるのは、新規作成画面と並べたときに同じ項目だと分かるようにするため */}
          <p className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 break-all text-slate-800">
            {estate.name}
          </p>
        </div>
        <PageMapProvider>
          <EstateLocationField lngLat={estate.lngLat} layers={layersState} />
        </PageMapProvider>
        <div className="flex justify-end border-t border-slate-200 pt-4">
          {/* 物件の位置を中心に地図画面を開くのは、見ていた物件の場所に戻れるようにするため */}
          <Link
            to="/map"
            search={{ ...estate.lngLat, zoom: ESTATE_LOCATION_ZOOM }}
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            地図画面へ戻る
          </Link>
        </div>
      </div>
    </>
  )
}
