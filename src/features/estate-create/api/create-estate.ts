import { useMutation } from '@tanstack/react-query'
import { useEstateRepository } from '#/shared/map/storage/estate-repository-context'
import { estateQueryKey, estatesQueryKey } from '#/shared/map/api/fetch-estates'
import type { NewEstate } from '#/shared/map/storage/estate-repository'

export function useCreateEstate() {
  const estateRepository = useEstateRepository()

  return useMutation({
    mutationFn: (newEstate: NewEstate) => estateRepository.create(newEstate),
    onSuccess: async (
      createdEstate,
      _newEstate,
      _onMutateResult,
      { client },
    ) => {
      // 作成直後に開く物件詳細画面が、保存先を読み直さずに表示できるようにする
      client.setQueryData(estateQueryKey(createdEstate.id), createdEstate)
      // 物件の一覧のキャッシュを取り直す。地図画面を離れている間は一覧を使う画面がないため、
      // refetchType: 'all' で使われていないキャッシュも取り直す（既定では取り直さず、古い一覧が残る）。
      // await するのは、取り直しが終わる前に地図画面へ戻ると、新しい物件が地図に出ないため
      await client.invalidateQueries({
        queryKey: estatesQueryKey,
        exact: true,
        refetchType: 'all',
      })
    },
  })
}
