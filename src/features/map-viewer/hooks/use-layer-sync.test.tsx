import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createQueryClient } from '#/lib/query-client'
import {
  FakeMapProvider,
  createFakeMapController,
} from '#/lib/map/testing/fake-map-controller'
import { layersQueryKey } from '../api/get-layers'
import { createMemoryMapStateRepository } from '../api/memory-map-state-repository'
import { MapStateRepositoryProvider } from '../api/repository-context'
import { useLayerSync } from './use-layer-sync'
import type { ReactNode } from 'react'
import type { MapController } from '#/lib/map/map-controller'
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
  const mapController = createFakeMapController({
    center: { lng: 0, lat: 0 },
    zoom: 1,
  })
  let currentMapController: MapController | null = mapController

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MapStateRepositoryProvider repository={createMemoryMapStateRepository()}>
        <FakeMapProvider mapController={currentMapController}>
          {children}
        </FakeMapProvider>
      </MapStateRepositoryProvider>
    </QueryClientProvider>
  )
  const hook = renderHook(() => useLayerSync('default'), { wrapper })
  const swapMapController = (next: MapController | null) => {
    currentMapController = next
    hook.rerender()
  }
  return { queryClient, mapController, swapMapController }
}

const methods = (mapController: ReturnType<typeof createFakeMapController>) =>
  mapController.calls.map((call) => call.method)

describe('useLayerSync（キャッシュ → 地図）', () => {
  it('地図が用意されたら、ベースマップ・オーバーレイ・重なり順をすべて反映する', () => {
    const { mapController } = setup()

    expect(mapController.basemap?.id).toBe('gsi-pale')
    expect(mapController.overlayOrder).toEqual(['areas', 'stations'])
    expect(mapController.overlays.get('stations')).toEqual({
      visible: true,
      opacity: 1,
    })
  })

  it('キャッシュが変わったら差分だけを反映する', async () => {
    const { queryClient, mapController } = setup()
    mapController.calls.length = 0

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
      expect(mapController.calls).toEqual([
        {
          method: 'updateOverlay',
          args: ['stations', { visible: true, opacity: 0.4 }],
        },
      ]),
    )
  })

  it('ベースマップの変更は setBasemap だけを呼ぶ', async () => {
    const { queryClient, mapController } = setup()
    mapController.calls.length = 0

    act(() =>
      queryClient.setQueryData<LayerState>(layersQueryKey('default'), {
        ...initial,
        basemapId: 'osm',
      }),
    )

    await waitFor(() => expect(methods(mapController)).toEqual(['setBasemap']))
    expect(mapController.basemap?.id).toBe('osm')
  })

  it('地図が作り直されたら、新しい地図に全部を反映し直す', () => {
    const { swapMapController } = setup()
    const next = createFakeMapController({
      center: { lng: 0, lat: 0 },
      zoom: 1,
    })

    act(() => swapMapController(next))

    expect(methods(next)).toEqual([
      'setBasemap',
      'addOverlay',
      'addOverlay',
      'setOverlayOrder',
    ])
  })
})
