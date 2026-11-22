import { QueryClientProvider } from '@tanstack/react-query'
import { MapProvider } from '#/lib/map/map-provider'
import { createMapLibreMap } from '#/lib/map/maplibre/maplibre-adapter'
import { MapSnapshotRepositoryProvider } from '#/shared/map/storage/repository-context'
import type { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { Repositories } from './repositories'

type Props = {
  queryClient: QueryClient
  repositories: Repositories
  children: ReactNode
}

export function AppProvider({ queryClient, repositories, children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <MapSnapshotRepositoryProvider repository={repositories.mapSnapshot}>
        <MapProvider createMap={createMapLibreMap}>{children}</MapProvider>
      </MapSnapshotRepositoryProvider>
    </QueryClientProvider>
  )
}
