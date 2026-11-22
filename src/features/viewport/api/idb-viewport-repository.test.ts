import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import { beforeEach, describe, expect, it } from 'vitest'
import { openAppDatabase } from '#/lib/db/database'
import { createIdbViewportRepository } from './idb-viewport-repository'

beforeEach(() => {
  // テスト間でデータが残ると、実行順によって結果が変わるため
  globalThis.indexedDB = new IDBFactory()
})

describe('IndexedDB の ViewportRepository', () => {
  it('保存したビューポートを読み戻せる', async () => {
    const repository = createIdbViewportRepository(await openAppDatabase())
    const viewport = { center: { lng: 139.7, lat: 35.6 }, zoom: 10 }

    await repository.save('default', viewport)

    expect(await repository.load('default')).toEqual(viewport)
  })

  it('保存データがなければ null', async () => {
    const repository = createIdbViewportRepository(await openAppDatabase())
    expect(await repository.load('default')).toBeNull()
  })

  it('版の違うデータや壊れたデータは null として扱う', async () => {
    const db = await openAppDatabase()
    const repository = createIdbViewportRepository(db)

    await db.put('viewports', { schemaVersion: 999, viewport: {} }, 'old')
    await db.put('viewports', 'broken', 'broken')

    expect(await repository.load('old')).toBeNull()
    expect(await repository.load('broken')).toBeNull()
  })
})
