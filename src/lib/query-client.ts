import { QueryClient } from '@tanstack/react-query'

/*
 * 自動の再取得はすべて止める。レイヤー構成のキャッシュは保存前の作業中の状態を持つので（ADR 0003）、
 * 再取得すると保存先の値で上書きされ、未保存の変更が消えるため。保存先をサーバーに替えても同じ理由で必要になる。
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  })
}
