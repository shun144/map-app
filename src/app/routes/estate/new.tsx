import { createFileRoute } from '@tanstack/react-router'
import { NewEstatePage } from '../../pages/new-estate-page'
import { readLngLatSearch } from '../../router/read-location-from-search'

export const Route = createFileRoute('/estate/new')({
  // 物件の位置は、地図画面で右クリックした位置を URL で受け取る。URL にあるのでリロードしても位置が消えない
  validateSearch: readLngLatSearch,
  component: NewEstatePage,
})
