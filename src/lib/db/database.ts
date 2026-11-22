import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'

/*
 * 値の型を unknown にしているのは、shared 層が feature の型を知らないようにするため。
 * 中身の検証は各 feature の Repository が行う。
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
       * 2つを1レコードへ移し替えるには shared 層が feature のデータ形式を知る必要があるため、
       * 移行はせずに捨てる（学習用アプリで、失うのは最後に保存した表示状態だけ）。
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
