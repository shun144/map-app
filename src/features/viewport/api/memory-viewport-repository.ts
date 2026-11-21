import { parseViewportRecord, toViewportRecord } from './viewport-repository'
import type { ViewportRepository } from './viewport-repository'

/** IndexedDB が使えない環境・テスト用。リロードで消える */
export function createMemoryViewportRepository(): ViewportRepository {
  const store = new Map<string, unknown>()
  return {
    load: async (mapId) => parseViewportRecord(store.get(mapId)),
    save: async (mapId, viewport) => {
      store.set(mapId, toViewportRecord(viewport))
    },
  }
}
