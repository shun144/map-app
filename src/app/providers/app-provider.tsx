import { QueryClientProvider } from '@tanstack/react-query'
import { MapSnapshotRepositoryProvider } from '#/shared/map/storage/repository-context'
import { EstateRepositoryProvider } from '#/shared/map/storage/estate-repository-context'
import type { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { Repositories } from '../repositories/repositories'

type Props = {
  queryClient: QueryClient
  repositories: Repositories
  children: ReactNode
}

export function AppProvider({ queryClient, repositories, children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <MapSnapshotRepositoryProvider repository={repositories.mapSnapshot}>
        <EstateRepositoryProvider repository={repositories.estate}>
          {children}
        </EstateRepositoryProvider>
      </MapSnapshotRepositoryProvider>
    </QueryClientProvider>
  )
}
