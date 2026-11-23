import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { ESTATE_LOCATION_ZOOM } from '#/config/estate'
import { NewEstateForm } from '#/features/estate-create/components/new-estate-form'
import { findLngLatInSearch } from '../router/read-location-from-search'
import { EstateLocationField } from '#/features/estate-location-map/components/estate-location-field'
import { PageMapProvider } from '../providers/page-map-provider'

export function NewEstatePage() {
  const lngLat = findLngLatInSearch(useSearch({ from: '/estate/new' }))
  const navigate = useNavigate()

  if (!lngLat) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-slate-700">
        <p>地図で右クリックして位置を選んでください</p>
        <Link to="/map" className="text-sm text-blue-700 underline">
          地図画面へ
        </Link>
      </div>
    )
  }

  return (
    <>
      <h1 className="mb-6 text-lg font-semibold text-slate-800">
        物件の新規作成
      </h1>
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
      >
        <PageMapProvider>
          <EstateLocationField lngLat={lngLat} />
        </PageMapProvider>
      </NewEstateForm>
    </>
  )
}
