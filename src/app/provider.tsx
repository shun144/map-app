import { QueryClientProvider } from '@tanstack/react-query'
import { MapProvider } from '#/lib/map/map-provider'
import { createMapLibreMap } from '#/lib/map/maplibre/maplibre-adapter'
import { ViewportRepositoryProvider } from '#/features/viewport/api/repository-context'
import { LayerRepositoryProvider } from '#/features/layers/api/repository-context'
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
      <ViewportRepositoryProvider repository={repositories.viewport}>
        <LayerRepositoryProvider repository={repositories.layers}>
          <MapProvider createMap={createMapLibreMap}>{children}</MapProvider>
        </LayerRepositoryProvider>
      </ViewportRepositoryProvider>
    </QueryClientProvider>
  )
}
