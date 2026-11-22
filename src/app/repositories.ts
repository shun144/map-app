import { openAppDatabase } from '#/lib/db/database'
import { createIdbViewportRepository } from '#/features/viewport/api/idb-viewport-repository'
import { createMemoryViewportRepository } from '#/features/viewport/api/memory-viewport-repository'
import { createIdbLayerRepository } from '#/features/layers/api/idb-layer-repository'
import { createMemoryLayerRepository } from '#/features/layers/api/memory-layer-repository'
import type { ViewportRepository } from '#/features/viewport/api/viewport-repository'
import type { LayerRepository } from '#/features/layers/api/layer-repository'

/** 保存先の選択をここに集めるのは、保存先を替えるときに features 側を触らずに済ませるため */
export type Repositories = {
  viewport: ViewportRepository
  layers: LayerRepository
}

export async function createRepositories(): Promise<Repositories> {
  try {
    const db = await openAppDatabase()
    return {
      viewport: createIdbViewportRepository(db),
      layers: createIdbLayerRepository(db),
    }
  } catch (error) {
    // IndexedDB が開けなくても地図は使えるべきなので、保存を諦めてメモリで動かす（リロードで消える）
    console.warn(
      'IndexedDB を開けないため、保存先をメモリに切り替えます',
      error,
    )
    return {
      viewport: createMemoryViewportRepository(),
      layers: createMemoryLayerRepository(),
    }
  }
}
