import { openAppDatabase } from '#/lib/db/database'
import { createIdbMapStateRepository } from '#/shared/map/storage/idb-map-state-repository'
import { createMemoryMapStateRepository } from '#/shared/map/storage/memory-map-state-repository'
import type { MapStateRepository } from '#/shared/map/storage/map-state-repository'

/** 保存先の選択をここに集めるのは、保存先を替えるときに features 側を触らずに済ませるため */
export type Repositories = {
  mapState: MapStateRepository
}

export async function createRepositories(): Promise<Repositories> {
  try {
    const db = await openAppDatabase()
    return { mapState: createIdbMapStateRepository(db) }
  } catch (error) {
    // IndexedDB が開けなくても地図は使えるべきなので、保存を諦めてメモリで動かす（リロードで消える）
    console.warn(
      'IndexedDB を開けないため、保存先をメモリに切り替えます',
      error,
    )
    return { mapState: createMemoryMapStateRepository() }
  }
}
