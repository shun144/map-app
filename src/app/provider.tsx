import { QueryClientProvider } from '@tanstack/react-query'
import { MapProvider } from '#/lib/map'
import { createMapLibreMap } from '#/lib/map/maplibre'
import { ViewportRepositoryProvider } from '#/features/viewport'
import { LayerRepositoryProvider } from '#/features/layers'
import type { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import type { Repositories } from './repositories'

type AppProviderProps = {
  queryClient: QueryClient
  repositories: Repositories
  children: ReactNode
}

/**
 * アプリ全体の Provider を合成する場所。差し替え口が3つ並ぶ。
 * - 地図ライブラリ: MapProvider の createMap
 * - 保存先: 各 RepositoryProvider の repository（中身は repositories.ts で決める）
 */
export function AppProvider({
  queryClient,
  repositories,
  children,
}: AppProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ViewportRepositoryProvider repository={repositories.viewport}>
        <LayerRepositoryProvider repository={repositories.layers}>
          <MapProvider createMap={createMapLibreMap}>{children}</MapProvider>
        </LayerRepositoryProvider>
      </ViewportRepositoryProvider>
    </QueryClientProvider>
  )
}
