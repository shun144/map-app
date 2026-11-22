import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createQueryClient } from '#/lib/query-client'
import { viewportQueryKey } from '#/shared/map/storage/fetch-viewport'
import { createMemoryMapStateRepository } from '#/shared/map/storage/memory-map-state-repository'
import { MapStateRepositoryProvider } from '#/shared/map/storage/repository-context'
import { useSaveMapState } from './save-map-state'
import type { ReactNode } from 'react'
import type { SavedMapState } from '#/shared/map/storage/map-state-repository'

const loadedViewport = { center: { lng: 139.76, lat: 35.68 }, zoom: 12 }
const savedMapState: SavedMapState = {
  viewport: { center: { lng: 139.7, lat: 35.6 }, zoom: 14 },
  layerState: {
    basemapId: 'osm',
    overlays: [{ overlayId: 'stations', visible: true, opacity: 0.5 }],
  },
}

function setup() {
  const queryClient = createQueryClient()
  // loader が保存データを読み込み済みの状態を再現する
  queryClient.setQueryData(viewportQueryKey('default'), loadedViewport)
  const repository = createMemoryMapStateRepository()
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MapStateRepositoryProvider repository={repository}>
        {children}
      </MapStateRepositoryProvider>
    </QueryClientProvider>
  )
  const hook = renderHook(() => useSaveMapState('default'), { wrapper })
  return { queryClient, repository, hook }
}

describe('useSaveMapState', () => {
  it('渡された地図の状態を保存先に書く', async () => {
    const { repository, hook } = setup()

    act(() => hook.result.current.mutate(savedMapState))
    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true))

    expect(await repository.load('default')).toEqual(savedMapState)
  })

  it('保存できたら、キャッシュのビューポートも保存した値に合わせる', async () => {
    const { queryClient, hook } = setup()

    act(() => hook.result.current.mutate(savedMapState))
    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true))

    expect(queryClient.getQueryData(viewportQueryKey('default'))).toEqual(
      savedMapState.viewport,
    )
  })

  it('保存先への書き込みに失敗したら、失敗として扱い、キャッシュは変えない', async () => {
    const { queryClient, repository, hook } = setup()
    vi.spyOn(repository, 'save').mockRejectedValue(new Error('quota'))

    act(() => hook.result.current.mutate(savedMapState))

    await waitFor(() => expect(hook.result.current.isError).toBe(true))
    expect(queryClient.getQueryData(viewportQueryKey('default'))).toEqual(
      loadedViewport,
    )
  })
})
