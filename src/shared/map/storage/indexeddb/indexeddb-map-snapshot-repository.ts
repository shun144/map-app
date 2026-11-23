import { isMapSnapshot } from '../map-snapshot-repository'
import type { AppDatabase } from './database'
import type {
  MapSnapshotRepository,
  MapSnapshot,
} from '../map-snapshot-repository'

/*
 * IndexedDB は本番の保存先が決まるまでの仮の保存先（ADR 0004）。
 * 差し替えたらこのフォルダごと消せるよう、IndexedDB の都合（DB 接続・保存形式・版番号）はここに閉じ込める。
 */

/** ブラウザに残るデータの形が将来変わっても、古い形を見分けて捨てられるよう版番号を付ける */
const MAP_SNAPSHOT_SCHEMA_VERSION = 7

type MapSnapshotRecord = {
  schemaVersion: typeof MAP_SNAPSHOT_SCHEMA_VERSION
  mapSnapshot: MapSnapshot
}

function wrapInMapSnapshotRecord(mapSnapshot: MapSnapshot): MapSnapshotRecord {
  return { schemaVersion: MAP_SNAPSHOT_SCHEMA_VERSION, mapSnapshot }
}

function unwrapMapSnapshotRecord(storedValue: unknown): MapSnapshot | null {
  const isObject = typeof storedValue === 'object' && storedValue !== null
  if (!isObject) return null
  const record = storedValue as Partial<MapSnapshotRecord>
  if (record.schemaVersion !== MAP_SNAPSHOT_SCHEMA_VERSION) return null
  return isMapSnapshot(record.mapSnapshot) ? record.mapSnapshot : null
}

export function createIndexedDbMapSnapshotRepository(
  db: AppDatabase,
): MapSnapshotRepository {
  return {
    load: async (mapId) =>
      unwrapMapSnapshotRecord(await db.get('mapSnapshots', mapId)),
    save: async (mapId, mapSnapshot) => {
      await db.put('mapSnapshots', wrapInMapSnapshotRecord(mapSnapshot), mapId)
    },
  }
}
