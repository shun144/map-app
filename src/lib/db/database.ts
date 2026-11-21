import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'

/*
 * IndexedDB の接続とスキーマ（オブジェクトストアの一覧）だけを持つ。
 * 値の型は各 feature の Repository が検証する。shared 層が feature の型を知らないよう unknown にしている。
 */

const DB_NAME = 'map-project'
const DB_VERSION = 1

export interface AppDBSchema extends DBSchema {
  viewports: { key: string; value: unknown }
  layers: { key: string; value: unknown }
}

export type AppDatabase = IDBPDatabase<AppDBSchema>

export function openAppDatabase(): Promise<AppDatabase> {
  return openDB<AppDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('viewports')) {
        db.createObjectStore('viewports')
      }
      if (!db.objectStoreNames.contains('layers')) {
        db.createObjectStore('layers')
      }
    },
  })
}
