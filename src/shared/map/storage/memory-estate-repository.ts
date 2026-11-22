import type { Estate, EstateRepository } from './estate-repository'

/** 保存先が使えない環境（IndexedDB ならプライベートブラウズなど）用。リロードで消える */
export function createMemoryEstateRepository(): EstateRepository {
  const estatesById = new Map<string, Estate>()
  return {
    // 複製して出し入れするのは、呼び出し側が保存後に値を書き換えても、保存した内容が変わらないようにするため
    list: async () =>
      [...estatesById.values()].map((estate) => structuredClone(estate)),
    find: async (estateId) => {
      const estate = estatesById.get(estateId)
      return estate ? structuredClone(estate) : null
    },
    create: async (newEstate) => {
      const estate: Estate = { id: crypto.randomUUID(), ...newEstate }
      estatesById.set(estate.id, structuredClone(estate))
      return estate
    },
  }
}
