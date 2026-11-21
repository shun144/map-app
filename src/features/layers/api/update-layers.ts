import { useMutation, useQueryClient } from '@tanstack/react-query'
import { layersQueryKey } from './get-layers'
import { useLayerRepository } from './repository-context'
import type { LayerState } from '../types'

/**
 * レイヤー構成を楽観的更新で書き換える。
 * キャッシュを先に書き換えるので、地図への反映（useLayerSync）は保存の完了を待たない。
 * 保存に失敗したら元の状態に戻し、地図も差分同期で元に戻る。
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
