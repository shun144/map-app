import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import { openDB } from 'idb'
import { beforeEach, describe, expect, it } from 'vitest'
import { openAppDatabase } from '#/lib/db/database'
import { createIdbMapStateRepository } from './idb-map-state-repository'
import type { SavedMapState } from './map-state-repository'

const savedMapState: SavedMapState = {
  viewport: { center: { lng: 139.7, lat: 35.6 }, zoom: 10 },
  layerState: {
    basemapId: 'osm',
    overlays: [{ overlayId: 'stations', visible: true, opacity: 0.5 }],
  },
}

beforeEach(() => {
  // テスト間でデータが残ると、実行順によって結果が変わるため
  globalThis.indexedDB = new IDBFactory()
})

describe('IndexedDB の MapStateRepository', () => {
  it('ビューポートとレイヤー構成をまとめて保存し、読み戻せる', async () => {
    const repository = createIdbMapStateRepository(await openAppDatabase())

    await repository.save('default', savedMapState)

    expect(await repository.load('default')).toEqual(savedMapState)
  })

  it('保存データがなければ null', async () => {
    const repository = createIdbMapStateRepository(await openAppDatabase())
    expect(await repository.load('default')).toBeNull()
  })

  it('版の違うデータ・片方が壊れたデータは null として扱う', async () => {
    const db = await openAppDatabase()
    const repository = createIdbMapStateRepository(db)

    await db.put('mapStates', { schemaVersion: 999, savedMapState }, 'old')
    await db.put(
      'mapStates',
      {
        schemaVersion: 1,
        savedMapState: { ...savedMapState, layerState: { overlays: 'broken' } },
      },
      'half-broken',
    )

    expect(await repository.load('old')).toBeNull()
    expect(await repository.load('half-broken')).toBeNull()
  })

  it('版 1 の DB（ストアが2つ）から開くと、古いストアを消して新しいストアを作る', async () => {
    const legacyDb = await openDB('map-project', 1, {
      upgrade(db) {
        db.createObjectStore('viewports')
        db.createObjectStore('layers')
      },
    })
    legacyDb.close()

    const db = await openAppDatabase()

    expect([...db.objectStoreNames]).toEqual(['mapStates'])
  })
})
