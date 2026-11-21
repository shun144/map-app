import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { LayerRepository } from './layer-repository'

const LayerRepositoryContext = createContext<LayerRepository | null>(null)

export function LayerRepositoryProvider({
  repository,
  children,
}: {
  repository: LayerRepository
  children: ReactNode
}) {
  return (
    <LayerRepositoryContext value={repository}>
      {children}
    </LayerRepositoryContext>
  )
}

export function useLayerRepository(): LayerRepository {
  const repository = useContext(LayerRepositoryContext)
  if (!repository) {
    throw new Error('LayerRepositoryProvider の外で使われています')
  }
  return repository
}
