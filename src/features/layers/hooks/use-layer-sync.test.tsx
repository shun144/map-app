import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createQueryClient } from '#/lib/query-client'
import {
  FakeMapProvider,
  createFakeMapPort,
} from '#/lib/map/testing/fake-map-port'
import { layersQueryKey } from '../api/get-layers'
import { createMemoryLayerRepository } from '../api/memory-layer-repository'
import { LayerRepositoryProvider } from '../api/repository-context'
import { useLayerSync } from './use-layer-sync'
import type { ReactNode } from 'react'
import type { MapPort } from '#/lib/map'
import type { LayerState } from '../types'

const initial: LayerState = {
  basemapId: 'gsi-pale',
  overlays: [
    { overlayId: 'areas', visible: false, opacity: 1 },
    { overlayId: 'stations', visible: true, opacity: 1 },
  ],
}

function setup() {
  const queryClient = createQueryClient()
  // Suspense させないよう、loader が読み込み済みの状態を再現する
  queryClient.setQueryData(layersQueryKey('default'), initial)
  const port = createFakeMapPort({ center: { lng: 0, lat: 0 }, zoom: 1 })
  let currentPort: MapPort | null = port

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <LayerRepositoryProvider repository={createMemoryLayerRepository()}>
        <FakeMapProvider port={currentPort}>{children}</FakeMapProvider>
      </LayerRepositoryProvider>
    </QueryClientProvider>
  )
  const hook = renderHook(() => useLayerSync('default'), { wrapper })
  const swapPort = (next: MapPort | null) => {
    currentPort = next
    hook.rerender()
  }
  return { queryClient, port, swapPort }
}

const methods = (port: ReturnType<typeof createFakeMapPort>) =>
  port.calls.map((call) => call.method)

describe('useLayerSync（キャッシュ → 地図）', () => {
  it('地図が用意されたら、ベースマップ・オーバーレイ・重なり順をすべて反映する', () => {
    const { port } = setup()

    expect(port.basemap?.id).toBe('gsi-pale')
    expect(port.overlayOrder).toEqual(['areas', 'stations'])
    expect(port.overlays.get('stations')).toEqual({ visible: true, opacity: 1 })
  })

  it('キャッシュが変わったら差分だけを反映する', async () => {
    const { queryClient, port } = setup()
    port.calls.length = 0

    act(() =>
      queryClient.setQueryData<LayerState>(layersQueryKey('default'), {
        ...initial,
        overlays: [
          initial.overlays[0],
          { overlayId: 'stations', visible: true, opacity: 0.4 },
        ],
      }),
    )

    // TanStack Query はキャッシュ変更の通知を setTimeout(0) で遅らせるので待つ
    await waitFor(() =>
      expect(port.calls).toEqual([
        {
          method: 'updateOverlay',
          args: ['stations', { visible: true, opacity: 0.4 }],
        },
      ]),
    )
  })

  it('ベースマップの変更は setBasemap だけを呼ぶ', async () => {
    const { queryClient, port } = setup()
    port.calls.length = 0

    act(() =>
      queryClient.setQueryData<LayerState>(layersQueryKey('default'), {
        ...initial,
        basemapId: 'osm',
      }),
    )

    await waitFor(() => expect(methods(port)).toEqual(['setBasemap']))
    expect(port.basemap?.id).toBe('osm')
  })

  it('地図が作り直されたら、新しい地図に全部を反映し直す', () => {
    const { swapPort } = setup()
    const next = createFakeMapPort({ center: { lng: 0, lat: 0 }, zoom: 1 })

    act(() => swapPort(next))

    expect(methods(next)).toEqual([
      'setBasemap',
      'addOverlay',
      'addOverlay',
      'setOverlayOrder',
    ])
  })
})
