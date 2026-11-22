import type {
  MapSnapshotRepository,
  MapSnapshot,
} from './map-snapshot-repository'

/** 保存先が使えない環境（IndexedDB ならプライベートブラウズなど）用。リロードで消える */
export function createMemoryMapSnapshotRepository(): MapSnapshotRepository {
  const store = new Map<string, MapSnapshot>()
  return {
    // 複製して出し入れするのは、呼び出し側が保存後に値を書き換えても、保存した内容が変わらないようにするため
    load: async (mapId) => {
      const mapSnapshot = store.get(mapId)
      return mapSnapshot ? structuredClone(mapSnapshot) : null
    },
    save: async (mapId, mapSnapshot) => {
      store.set(mapId, structuredClone(mapSnapshot))
    },
  }
}
