import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import type { RouterContext } from '../router'

import '../../styles.css'

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: () => (
    <p className="p-8 text-slate-600">ページが見つかりません。</p>
  ),
})

function RootComponent() {
  return (
    <>
      <Outlet />
      <TanStackDevtools
        config={{ position: 'bottom-left' }}
        plugins={[
          { name: 'TanStack Router', render: <TanStackRouterDevtoolsPanel /> },
          { name: 'TanStack Query', render: <ReactQueryDevtoolsPanel /> },
        ]}
      />
    </>
  )
}
