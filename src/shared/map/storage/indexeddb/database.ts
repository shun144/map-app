import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'

/*
 * 値の型を unknown にしているのは、ブラウザに残っている値は古い版や壊れた値の可能性があり、
 * 型を付けると検証せずに使えてしまうため。検証は indexeddb-map-state-repository.ts で行う。
 */

const DB_NAME = 'map-project'
const DB_VERSION = 2

export interface AppDBSchema extends DBSchema {
  mapStates: { key: string; value: unknown }
}

export type AppDatabase = IDBPDatabase<AppDBSchema>

export function openAppDatabase(): Promise<AppDatabase> {
  return openDB<AppDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      /*
       * 版 1 はビューポートとレイヤー構成を別々のストアに持っていた。
       * IndexedDB は仮の保存先（ADR 0004）で、失うのは最後に保存した表示状態だけなので、
       * 移し替えの処理は書かずに捨てる。
       */
      // 版 1 のストア名は現在のスキーマ型に含まれないため、型なしの DB として扱う
      const untypedDb = db as unknown as IDBPDatabase
      for (const legacyStoreName of ['viewports', 'layers']) {
        if (untypedDb.objectStoreNames.contains(legacyStoreName)) {
          untypedDb.deleteObjectStore(legacyStoreName)
        }
      }
      if (!db.objectStoreNames.contains('mapStates')) {
        db.createObjectStore('mapStates')
      }
    },
  })
}
