import { parseViewportRecord, toViewportRecord } from './viewport-repository'
import type { AppDatabase } from '#/lib/db'
import type { ViewportRepository } from './viewport-repository'

export function createIdbViewportRepository(
  db: AppDatabase,
): ViewportRepository {
  return {
    load: async (mapId) =>
      parseViewportRecord(await db.get('viewports', mapId)),
    save: async (mapId, viewport) => {
      await db.put('viewports', toViewportRecord(viewport), mapId)
    },
  }
}
