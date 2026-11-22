import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { useEstateRepository } from '../storage/estate-repository-context'
import type { EstateRepository } from '../storage/estate-repository'

/*
 * 本番では API から物件を取得する想定だが、API がまだないため、仮の保存先（ADR 0004）から読む。
 * 物件はどの地図にも属さないので、地図情報（fetch-map-info.ts）とは別に取得する。
 * ルーターの loader（React の外）からも使えるよう、Repository を引数で受け取る。
 */

export const estatesQueryKey = ['estates'] as const

export const estateQueryKey = (estateId: string) =>
  ['estates', estateId] as const

export const estatesQueryOptions = (repository: EstateRepository) =>
  queryOptions({
    queryKey: estatesQueryKey,
    queryFn: () => repository.list(),
  })

export const estateQueryOptions = (
  repository: EstateRepository,
  estateId: string,
) =>
  queryOptions({
    queryKey: estateQueryKey(estateId),
    queryFn: () => repository.find(estateId),
  })

export function useEstates() {
  const repository = useEstateRepository()
  return useSuspenseQuery(estatesQueryOptions(repository)).data
}

/** 物件がないときは null */
export function useEstate(estateId: string) {
  const repository = useEstateRepository()
  return useSuspenseQuery(estateQueryOptions(repository, estateId)).data
}
