import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { EstateRepository } from './estate-repository'

const EstateRepositoryContext = createContext<EstateRepository | null>(null)

type Props = {
  repository: EstateRepository
  children: ReactNode
}

export function EstateRepositoryProvider({ repository, children }: Props) {
  return (
    <EstateRepositoryContext value={repository}>
      {children}
    </EstateRepositoryContext>
  )
}

export function useEstateRepository(): EstateRepository {
  const repository = useContext(EstateRepositoryContext)
  if (!repository) {
    throw new Error('EstateRepositoryProvider の外で使われています')
  }
  return repository
}
