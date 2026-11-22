import { parseMapStateRecord, toMapStateRecord } from './map-state-repository'
import type { AppDatabase } from '#/lib/db/database'
import type { MapStateRepository } from './map-state-repository'

export function createIdbMapStateRepository(
  db: AppDatabase,
): MapStateRepository {
  return {
    load: async (mapId) =>
      parseMapStateRecord(await db.get('mapStates', mapId)),
    save: async (mapId, savedMapState) => {
      await db.put('mapStates', toMapStateRecord(savedMapState), mapId)
    },
  }
}
