import { openAppDatabase } from '#/shared/map/storage/indexeddb/database'
import { createIndexedDbMapStateRepository } from '#/shared/map/storage/indexeddb/indexeddb-map-state-repository'
import { createMemoryMapStateRepository } from '#/shared/map/storage/memory-map-state-repository'
import type { MapStateRepository } from '#/shared/map/storage/map-state-repository'

export type Repositories = {
  mapState: MapStateRepository
}

/**
 * 保存先を選ぶ唯一の場所。保存先は差し替える前提（ADR 0004）なので、
 * 差し替えるときに書き換えるのはこの関数だけで済むよう、ほかの場所では保存先の種類を決めない。
 */
export async function createRepositories(): Promise<Repositories> {
  try {
    const db = await openAppDatabase()
    return { mapState: createIndexedDbMapStateRepository(db) }
  } catch (error) {
    // 保存先が使えなくても地図は使えるべきなので、保存を諦めてメモリで動かす（リロードで消える）
    console.warn('保存先を開けないため、メモリに保存します', error)
    return { mapState: createMemoryMapStateRepository() }
  }
}
