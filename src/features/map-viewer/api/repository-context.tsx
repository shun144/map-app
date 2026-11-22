import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { MapStateRepository } from './map-state-repository'

const MapStateRepositoryContext = createContext<MapStateRepository | null>(null)

export function MapStateRepositoryProvider({
  repository,
  children,
}: {
  repository: MapStateRepository
  children: ReactNode
}) {
  return (
    <MapStateRepositoryContext value={repository}>
      {children}
    </MapStateRepositoryContext>
  )
}

export function useMapStateRepository(): MapStateRepository {
  const repository = useContext(MapStateRepositoryContext)
  if (!repository) {
    throw new Error('MapStateRepositoryProvider の外で使われています')
  }
  return repository
}
