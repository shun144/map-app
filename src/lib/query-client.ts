import { QueryClient } from '@tanstack/react-query'

/*
 * 保存先はこのブラウザの IndexedDB だけで、書き込むのもこのアプリだけ。
 * サーバーのように外部で値が変わることがないため、自動の再取得はすべて止める。
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
