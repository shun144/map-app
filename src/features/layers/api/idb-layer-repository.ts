import { parseLayerRecord, toLayerRecord } from './layer-repository'
import type { AppDatabase } from '#/lib/db/database'
import type { LayerRepository } from './layer-repository'

export function createIdbLayerRepository(db: AppDatabase): LayerRepository {
  return {
    load: async (mapId) => parseLayerRecord(await db.get('layers', mapId)),
    save: async (mapId, state) => {
      await db.put('layers', toLayerRecord(state), mapId)
    },
  }
}
