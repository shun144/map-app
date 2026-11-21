import { openAppDatabase } from '#/lib/db'
import {
  createIdbViewportRepository,
  createMemoryViewportRepository,
} from '#/features/viewport'
import {
  createIdbLayerRepository,
  createMemoryLayerRepository,
} from '#/features/layers'
import type { ViewportRepository } from '#/features/viewport'
import type { LayerRepository } from '#/features/layers'

/** アプリが使う保存先の一式。保存先の差し替えはこのファイルだけで完結する */
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
    // プライベートブラウズなど IndexedDB が使えない環境ではメモリに保存する
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
