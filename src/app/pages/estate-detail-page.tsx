import { Link, useParams } from '@tanstack/react-router'
import { ESTATE_LOCATION_ZOOM } from '#/config/estate'
import { useEstate } from '#/shared/map/api/fetch-estates'
import { EstateLocationMap } from '#/features/estate-location-map/components/estate-location-map'
import { PageMapProvider } from './page-map-provider'

export function EstateDetailPage() {
  const { estateId } = useParams({ from: '/estate/$estateId' })
  const estate = useEstate(estateId)

  if (!estate) {
    return (
      <main className="grid h-dvh place-items-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-slate-700">
          <p>物件が見つかりません</p>
          <Link to="/map" className="text-sm text-blue-700 underline">
            地図画面へ
          </Link>
        </div>
      </main>
    )
  }

  return (
    <PageMapProvider>
      <main className="relative h-dvh w-full overflow-hidden">
        <EstateLocationMap
          lngLat={estate.lngLat}
          className="absolute inset-0"
        />
        <section className="absolute top-3 left-3 w-80 space-y-3 rounded-lg bg-white/95 p-4 shadow-lg backdrop-blur">
          <h1 className="font-semibold break-all text-slate-800">
            {estate.name}
          </h1>
          {/* 物件の位置を中心に地図画面を開くのは、見ていた物件の場所に戻れるようにするため */}
          <Link
            to="/map"
            search={{ ...estate.lngLat, zoom: ESTATE_LOCATION_ZOOM }}
            className="inline-block text-sm text-blue-700 underline"
          >
            地図画面へ戻る
          </Link>
        </section>
      </main>
    </PageMapProvider>
  )
}
