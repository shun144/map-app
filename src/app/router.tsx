import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import type { QueryClient } from '@tanstack/react-query'
import type { Repositories } from './repositories'

/** ルートの loader から使える値。loader は React の外で動くので Context の代わりにここで渡す */
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
    // データの鮮度は TanStack Query に任せる
    defaultPreloadStaleTime: 0,
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
