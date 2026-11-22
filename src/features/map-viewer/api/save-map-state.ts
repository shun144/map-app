import { useMutation, useQueryClient } from '@tanstack/react-query'
import { viewportQueryKey } from './get-viewport'
import { useMapStateRepository } from './repository-context'
import type { SavedMapState } from './map-state-repository'

export function useSaveMapState(mapId: string) {
  const mapStateRepository = useMapStateRepository()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (savedMapState: SavedMapState) => {
      await mapStateRepository.save(mapId, savedMapState)
      return new Date()
    },
    // キャッシュのビューポートは「保存した値」を表すので、保存できたときだけ合わせる
    onSuccess: (_savedAt, savedMapState) => {
      queryClient.setQueryData(viewportQueryKey(mapId), savedMapState.viewport)
    },
  })
}
