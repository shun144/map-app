import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { ViewportRepository } from './viewport-repository'

const ViewportRepositoryContext = createContext<ViewportRepository | null>(null)

export function ViewportRepositoryProvider({
  repository,
  children,
}: {
  repository: ViewportRepository
  children: ReactNode
}) {
  return (
    <ViewportRepositoryContext value={repository}>
      {children}
    </ViewportRepositoryContext>
  )
}

export function useViewportRepository(): ViewportRepository {
  const repository = useContext(ViewportRepositoryContext)
  if (!repository) {
    throw new Error('ViewportRepositoryProvider の外で使われています')
  }
  return repository
}
