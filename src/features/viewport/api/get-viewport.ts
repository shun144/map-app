import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { DEFAULT_VIEWPORT } from '../config/default-viewport'
import { useViewportRepository } from './repository-context'
import type { ViewportRepository } from './viewport-repository'

export const viewportQueryKey = (mapId: string) => ['viewport', mapId] as const

/**
 * ルーターの loader（React の外）からも使えるよう、Repository を引数で受け取る。
 * キャッシュ上の値は「最後に確定したビューポート」で、操作中の値ではない（ADR 0001）。
 */
export const viewportQueryOptions = (
  repository: ViewportRepository,
  mapId: string,
) =>
  queryOptions({
    queryKey: viewportQueryKey(mapId),
    queryFn: async () => (await repository.load(mapId)) ?? DEFAULT_VIEWPORT,
  })

export function useSavedViewport(mapId: string) {
  const repository = useViewportRepository()
  return useSuspenseQuery(viewportQueryOptions(repository, mapId)).data
}
