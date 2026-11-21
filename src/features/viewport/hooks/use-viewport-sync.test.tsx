import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createQueryClient } from '#/lib/query-client'
import {
  FakeMapProvider,
  createFakeMapPort,
} from '#/lib/map/testing/fake-map-port'
import { viewportQueryKey } from '../api/get-viewport'
import { createMemoryViewportRepository } from '../api/memory-viewport-repository'
import { ViewportRepositoryProvider } from '../api/repository-context'
import { VIEWPORT_SAVE_DEBOUNCE_MS, useViewportSync } from './use-viewport-sync'
import type { ReactNode } from 'react'
import type { Viewport } from '#/lib/map'

const at = (lng: number, zoom = 12): Viewport => ({
  center: { lng, lat: 35 },
  zoom,
})

function setup() {
  const queryClient = createQueryClient()
  const repository = createMemoryViewportRepository()
  const save = vi.spyOn(repository, 'save')
  const port = createFakeMapPort(at(0))
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ViewportRepositoryProvider repository={repository}>
        <FakeMapProvider port={port}>{children}</FakeMapProvider>
      </ViewportRepositoryProvider>
    </QueryClientProvider>
  )
  const hook = renderHook(() => useViewportSync('default'), { wrapper })
  return { queryClient, save, port, hook }
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('useViewportSync（地図 → キャッシュ・保存先）', () => {
  it('連続した移動は最後の1回だけを保存し、キャッシュにも書き込む', async () => {
    const { queryClient, save, port } = setup()

    act(() => {
      port.emitViewportChange(at(1))
      port.emitViewportChange(at(2))
      port.emitViewportChange(at(3))
    })
    expect(save).not.toHaveBeenCalled()

    await act(() => vi.advanceTimersByTimeAsync(VIEWPORT_SAVE_DEBOUNCE_MS))

    expect(save).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenCalledWith('default', at(3))
    expect(queryClient.getQueryData(viewportQueryKey('default'))).toEqual(at(3))
  })

  it('アンマウント後に届いた移動は保存しない', async () => {
    const { save, port, hook } = setup()

    act(() => port.emitViewportChange(at(1)))
    hook.unmount()
    await act(() => vi.advanceTimersByTimeAsync(VIEWPORT_SAVE_DEBOUNCE_MS))
    act(() => port.emitViewportChange(at(2)))
    await act(() => vi.advanceTimersByTimeAsync(VIEWPORT_SAVE_DEBOUNCE_MS))

    expect(save).not.toHaveBeenCalled()
  })

  it('キャッシュを書き換えても地図は動かさない（ループ防止, ADR 0001）', async () => {
    const { queryClient, port } = setup()

    act(() => queryClient.setQueryData(viewportQueryKey('default'), at(99)))
    // キャッシュ変更の通知（setTimeout(0)）が届くまで進めてから確認する
    await act(() => vi.advanceTimersByTimeAsync(VIEWPORT_SAVE_DEBOUNCE_MS))

    expect(port.calls.filter((c) => c.method === 'setViewport')).toEqual([])
  })
})
