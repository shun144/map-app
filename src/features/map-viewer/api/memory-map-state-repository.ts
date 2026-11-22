import { parseMapStateRecord, toMapStateRecord } from './map-state-repository'
import type { MapStateRepository } from './map-state-repository'

/** IndexedDB が使えない環境・テスト用。リロードで消える */
export function createMemoryMapStateRepository(): MapStateRepository {
  const store = new Map<string, unknown>()
  return {
    load: async (mapId) => parseMapStateRecord(store.get(mapId)),
    save: async (mapId, savedMapState) => {
      store.set(mapId, toMapStateRecord(savedMapState))
    },
  }
}
