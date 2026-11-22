import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import type { QueryClient } from '@tanstack/react-query'
import type { Repositories } from './repositories'

/** loader は React の外で動き Context を読めないため、必要な値をルーターの context で渡す */
export type RouterContext = {
  queryClient: QueryClient
  repositories: Repositories
}

export function createAppRouter(context: RouterContext) {
  return createRouter({
    routeTree,
    context,
    scrollRestoration: true,
    defaultPreload: 'intent',
    // ルーター側でも loader の結果をキャッシュすると TanStack Query のキャッシュと二重になるため、
    // 鮮度の判断は Query に一本化する
    defaultPreloadStaleTime: 0,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
