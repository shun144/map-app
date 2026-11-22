import { useMutation, useQueryClient } from '@tanstack/react-query'
import { layersQueryKey } from './get-layers'
import { useLayerRepository } from './repository-context'
import type { LayerState } from '../types'

/**
 * 保存の完了を待つと、切り替えやスライダーが書き込みの分だけ遅れて見えるため、キャッシュを先に書き換える。
 * 保存に失敗したらキャッシュを戻すだけでよい。地図は useLayerSync の差分同期で自動的に戻る。
 */
export function useUpdateLayers(mapId: string) {
  const repository = useLayerRepository()
  const queryClient = useQueryClient()
  const queryKey = layersQueryKey(mapId)

  return useMutation({
    mutationFn: (next: LayerState) => repository.save(mapId, next),
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<LayerState>(queryKey)
      queryClient.setQueryData(queryKey, next)
      return { previous }
    },
    onError: (_error, _next, context) => {
      if (context?.previous)
        queryClient.setQueryData(queryKey, context.previous)
    },
  })
}
