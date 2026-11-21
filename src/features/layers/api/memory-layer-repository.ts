import { parseLayerRecord, toLayerRecord } from './layer-repository'
import type { LayerRepository } from './layer-repository'

/** IndexedDB が使えない環境・テスト用。リロードで消える */
export function createMemoryLayerRepository(): LayerRepository {
  const store = new Map<string, unknown>()
  return {
    load: async (mapId) => parseLayerRecord(store.get(mapId)),
    save: async (mapId, state) => {
      store.set(mapId, toLayerRecord(state))
    },
  }
}
