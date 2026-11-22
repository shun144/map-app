import { useMutation, useQueryClient } from '@tanstack/react-query'
import { viewportQueryKey } from './get-viewport'
import { useViewportRepository } from './repository-context'
import type { Viewport } from '#/lib/map/types'

/** 正は地図側にあるので保存の成否を待たない。保存に失敗しても地図の表示は正しいまま */
export function useSaveViewport(mapId: string) {
  const repository = useViewportRepository()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (viewport: Viewport) => repository.save(mapId, viewport),
    onMutate: (viewport) => {
      queryClient.setQueryData(viewportQueryKey(mapId), viewport)
    },
  })
}
