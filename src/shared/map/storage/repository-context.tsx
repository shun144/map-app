import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { MapSnapshotRepository } from './map-snapshot-repository'

const MapSnapshotRepositoryContext =
  createContext<MapSnapshotRepository | null>(null)

export function MapSnapshotRepositoryProvider({
  repository,
  children,
}: {
  repository: MapSnapshotRepository
  children: ReactNode
}) {
  return (
    <MapSnapshotRepositoryContext value={repository}>
      {children}
    </MapSnapshotRepositoryContext>
  )
}

export function useMapSnapshotRepository(): MapSnapshotRepository {
  const repository = useContext(MapSnapshotRepositoryContext)
  if (!repository) {
    throw new Error('MapSnapshotRepositoryProvider の外で使われています')
  }
  return repository
}
