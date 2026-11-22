import type { MapStateRepository, SavedMapState } from './map-state-repository'

/** 保存先が使えない環境とテスト用。リロードで消える */
export function createMemoryMapStateRepository(): MapStateRepository {
  const store = new Map<string, SavedMapState>()
  return {
    // 複製して出し入れするのは、呼び出し側が保存後に値を書き換えても、保存した内容が変わらないようにするため
    load: async (mapId) => {
      const savedMapState = store.get(mapId)
      return savedMapState ? structuredClone(savedMapState) : null
    },
    save: async (mapId, savedMapState) => {
      store.set(mapId, structuredClone(savedMapState))
    },
  }
}
