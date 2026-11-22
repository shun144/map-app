import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import { beforeEach, describe, expect, it } from 'vitest'
import { openAppDatabase } from '#/lib/db/database'
import { createIdbLayerRepository } from './idb-layer-repository'

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory()
})

describe('IndexedDB の LayerRepository', () => {
  it('保存したレイヤー構成を読み戻せる', async () => {
    const repository = createIdbLayerRepository(await openAppDatabase())
    const state = {
      basemapId: 'osm',
      overlays: [{ overlayId: 'stations', visible: true, opacity: 0.5 }],
    }

    await repository.save('default', state)

    expect(await repository.load('default')).toEqual(state)
  })

  it('形の合わないデータは null として扱う', async () => {
    const db = await openAppDatabase()
    await db.put(
      'layers',
      { schemaVersion: 1, state: { basemapId: 'osm', overlays: [{ id: 1 }] } },
      'default',
    )
    expect(await createIdbLayerRepository(db).load('default')).toBeNull()
  })
})
