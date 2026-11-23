import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { createQueryClient } from '#/lib/query-client'
import { AppProvider } from '#/app/provider'
import { createRepositories } from '#/app/repositories'
import { createAppRouter } from '#/app/router'

async function bootstrap() {
  const queryClient = createQueryClient()
  // loader は React の外で動き Context を読めないため、ルーター経由でも渡す。
  // 同じインスタンスにするのは、loader が読む保存先と mutation が書く保存先を食い違わせないため
  const repositories = await createRepositories()
  const router = createAppRouter({ queryClient, repositories })

  const rootElement = document.getElementById('app')!
  if (rootElement.innerHTML) return
  ReactDOM.createRoot(rootElement).render(
    <AppProvider queryClient={queryClient} repositories={repositories}>
      <RouterProvider router={router} />
    </AppProvider>,
  )
}

void bootstrap()
