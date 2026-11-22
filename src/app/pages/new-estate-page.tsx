import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { ESTATE_LOCATION_ZOOM } from '#/config/estate'
import { EstateLocationMap } from '#/features/estate-location-map/components/estate-location-map'
import { NewEstateForm } from '#/features/estate-create/components/new-estate-form'
import { findLngLatInSearch } from '../read-location-from-search'
import { PageMapProvider } from './page-map-provider'

export function NewEstatePage() {
  const lngLat = findLngLatInSearch(useSearch({ from: '/estate/new' }))
  const navigate = useNavigate()

  if (!lngLat) {
    return (
      <main className="grid h-dvh place-items-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-slate-700">
          <p>地図で右クリックして位置を選んでください</p>
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
        <EstateLocationMap lngLat={lngLat} className="absolute inset-0" />
        <section className="absolute top-3 left-3 w-80 rounded-lg bg-white/95 p-4 shadow-lg backdrop-blur">
          <h1 className="mb-4 font-semibold text-slate-800">物件の新規作成</h1>
          <NewEstateForm
            lngLat={lngLat}
            // 履歴を置き換えるのは、ブラウザの「戻る」で保存済みの物件の新規作成画面に戻らないようにするため
            onCreated={(createdEstate) =>
              navigate({
                to: '/estate/$estateId',
                params: { estateId: createdEstate.id },
                replace: true,
              })
            }
            onCancel={() =>
              navigate({
                to: '/map',
                search: { ...lngLat, zoom: ESTATE_LOCATION_ZOOM },
              })
            }
          />
        </section>
      </main>
    </PageMapProvider>
  )
}
