import { isEstate } from '../estate-repository'
import type { AppDatabase } from './database'
import type { Estate, EstateRepository } from '../estate-repository'

/*
 * IndexedDB は本番の保存先が決まるまでの仮の保存先（ADR 0004）。
 * 差し替えたらこのフォルダごと消せるよう、IndexedDB の都合（DB 接続・保存形式・版番号）はここに閉じ込める。
 */

/** ブラウザに残るデータの形が将来変わっても、古い形を見分けて捨てられるよう版番号を付ける */
const ESTATE_SCHEMA_VERSION = 1

type EstateRecord = {
  schemaVersion: typeof ESTATE_SCHEMA_VERSION
  estate: Estate
}

function wrapInEstateRecord(estate: Estate): EstateRecord {
  return { schemaVersion: ESTATE_SCHEMA_VERSION, estate }
}

function unwrapEstateRecord(storedValue: unknown): Estate | null {
  if (typeof storedValue !== 'object' || storedValue === null) return null
  const record = storedValue as Partial<EstateRecord>
  if (record.schemaVersion !== ESTATE_SCHEMA_VERSION) return null
  return isEstate(record.estate) ? record.estate : null
}

export function createIndexedDbEstateRepository(
  db: AppDatabase,
): EstateRepository {
  return {
    list: async () =>
      (await db.getAll('estates'))
        .map(unwrapEstateRecord)
        .filter((estate): estate is Estate => estate !== null),
    find: async (estateId) =>
      unwrapEstateRecord(await db.get('estates', estateId)),
    // API ができるまでの仮の ID。本番では API が発行した ID に置き換わる
    create: async (newEstate) => {
      const estate: Estate = { id: crypto.randomUUID(), ...newEstate }
      await db.put('estates', wrapInEstateRecord(estate), estate.id)
      return estate
    },
  }
}
