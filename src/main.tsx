import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { createQueryClient } from '#/lib/query-client'
import { AppProvider } from '#/app/provider'
import { createRepositories } from '#/app/repositories'
import { createAppRouter } from '#/app/router'

async function bootstrap() {
  const queryClient = createQueryClient()
  // 同じ Repository を React（Provider）とルーター（loader）の両方に渡す
  const repositories = await createRepositories()
  const router = createAppRouter({ queryClient, repositories })

  const rootElement = document.getElementById('app')!
  if (!rootElement.innerHTML) {
    ReactDOM.createRoot(rootElement).render(
      <AppProvider queryClient={queryClient} repositories={repositories}>
        <RouterProvider router={router} />
      </AppProvider>,
    )
  }
}

void bootstrap()
