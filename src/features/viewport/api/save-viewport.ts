import { useMutation, useQueryClient } from '@tanstack/react-query'
import { viewportQueryKey } from './get-viewport'
import { useViewportRepository } from './repository-context'
import type { Viewport } from '#/lib/map'

/**
 * 地図が確定させたビューポートをキャッシュと保存先へ書き込む。
 * 正は地図側にあるので、保存の成否を待たずにキャッシュを先に書き換える。
 */
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
