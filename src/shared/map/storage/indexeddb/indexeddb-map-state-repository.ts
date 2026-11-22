import { isSavedMapState } from '../map-state-repository'
import type { AppDatabase } from './database'
import type { MapStateRepository, SavedMapState } from '../map-state-repository'

/*
 * IndexedDB は本番の保存先が決まるまでの仮の保存先（ADR 0004）。
 * 差し替えたらこのフォルダごと消せるよう、IndexedDB の都合（DB 接続・保存形式・版番号）はここに閉じ込める。
 */

/** ブラウザに残るデータの形が将来変わっても、古い形を見分けて捨てられるよう版番号を付ける */
const MAP_STATE_SCHEMA_VERSION = 1

type MapStateRecord = {
  schemaVersion: typeof MAP_STATE_SCHEMA_VERSION
  savedMapState: SavedMapState
}

function toMapStateRecord(savedMapState: SavedMapState): MapStateRecord {
  return { schemaVersion: MAP_STATE_SCHEMA_VERSION, savedMapState }
}

function fromMapStateRecord(storedValue: unknown): SavedMapState | null {
  if (typeof storedValue !== 'object' || storedValue === null) return null
  const record = storedValue as Partial<MapStateRecord>
  if (record.schemaVersion !== MAP_STATE_SCHEMA_VERSION) return null
  return isSavedMapState(record.savedMapState) ? record.savedMapState : null
}

export function createIndexedDbMapStateRepository(
  db: AppDatabase,
): MapStateRepository {
  return {
    load: async (mapId) => fromMapStateRecord(await db.get('mapStates', mapId)),
    save: async (mapId, savedMapState) => {
      await db.put('mapStates', toMapStateRecord(savedMapState), mapId)
    },
  }
}
