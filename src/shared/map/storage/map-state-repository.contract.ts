import { describe, expect, it } from 'vitest'
import type { MapStateRepository, SavedMapState } from './map-state-repository'

/*
 * どの保存先の実装も満たすべき振る舞い。保存先を差し替える（ADR 0004）ときは、
 * 新しい実装のテストからこの関数を呼べば、アプリが前提にしている動きを確かめられる。
 */

const savedMapState: SavedMapState = {
  viewport: { center: { lng: 139.7, lat: 35.6 }, zoom: 10 },
  layerState: {
    basemapId: 'osm',
    overlays: [{ overlayId: 'stations', visible: true, opacity: 0.5 }],
  },
}

export function describeMapStateRepositoryContract(
  implementationName: string,
  createRepository: () => Promise<MapStateRepository>,
) {
  describe(`MapStateRepository の契約: ${implementationName}`, () => {
    it('保存した地図の状態を、そのまま読み戻せる', async () => {
      const repository = await createRepository()

      await repository.save('default', savedMapState)

      expect(await repository.load('default')).toEqual(savedMapState)
    })

    it('保存データがなければ null を返す', async () => {
      const repository = await createRepository()

      expect(await repository.load('default')).toBeNull()
    })

    it('同じ地図に保存し直すと、最後に保存した内容で上書きされる', async () => {
      const repository = await createRepository()
      const zoomedIn: SavedMapState = {
        ...savedMapState,
        viewport: { ...savedMapState.viewport, zoom: 16 },
      }

      await repository.save('default', savedMapState)
      await repository.save('default', zoomedIn)

      expect(await repository.load('default')).toEqual(zoomedIn)
    })

    it('地図ごとに別々に保存される', async () => {
      const repository = await createRepository()

      await repository.save('default', savedMapState)

      expect(await repository.load('another-map')).toBeNull()
    })

    it('保存後に呼び出し側が値を書き換えても、保存した内容は変わらない', async () => {
      const repository = await createRepository()
      const editable = structuredClone(savedMapState)

      await repository.save('default', editable)
      editable.viewport.zoom = 1

      expect(await repository.load('default')).toEqual(savedMapState)
    })
  })
}
