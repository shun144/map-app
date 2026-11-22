import { QueryClientProvider } from '@tanstack/react-query'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { createQueryClient } from '#/lib/query-client'
import {
  FakeMapProvider,
  createFakeMapController,
} from '#/lib/map/testing/fake-map-controller'
import { layersQueryKey } from '#/shared/map/layer-state/fetch-layers'
import { createMemoryMapStateRepository } from '#/shared/map/storage/memory-map-state-repository'
import { MapStateRepositoryProvider } from '#/shared/map/storage/repository-context'
import { SaveMapStateButton } from './save-map-state-button'
import type { MapController } from '#/lib/map/map-controller'
import type { LayerState } from '#/shared/map/types'

const loadedViewport = { center: { lng: 139.76, lat: 35.68 }, zoom: 12 }
const movedViewport = { center: { lng: 139.7, lat: 35.6 }, zoom: 14 }
const layerState: LayerState = {
  basemapId: 'osm',
  overlays: [{ overlayId: 'stations', visible: true, opacity: 0.5 }],
}

function renderButton(mapController: MapController | null) {
  const queryClient = createQueryClient()
  // Suspense させないよう、loader が読み込み済みの状態を再現する
  queryClient.setQueryData(layersQueryKey('default'), layerState)
  const repository = createMemoryMapStateRepository()
  render(
    <QueryClientProvider client={queryClient}>
      <MapStateRepositoryProvider repository={repository}>
        <FakeMapProvider mapController={mapController}>
          <SaveMapStateButton mapId="default" />
        </FakeMapProvider>
      </MapStateRepositoryProvider>
    </QueryClientProvider>,
  )
  return { repository }
}

// Vitest のグローバル関数を有効にしていないため、Testing Library の自動後片付けが働かない
afterEach(cleanup)

describe('SaveMapStateButton', () => {
  it('押した時点の地図のビューポートと、キャッシュのレイヤー構成を保存する', async () => {
    const mapController = createFakeMapController(loadedViewport)
    const { repository } = renderButton(mapController)
    mapController.simulateUserMove(movedViewport)

    fireEvent.click(screen.getByRole('button', { name: '保存' }))

    await waitFor(async () =>
      expect(await repository.load('default')).toEqual({
        viewport: movedViewport,
        layerState,
      }),
    )
  })

  it('地図ができるまでは押せない', () => {
    renderButton(null)

    expect(screen.getByRole('button', { name: '保存' })).toHaveProperty(
      'disabled',
      true,
    )
  })
})
