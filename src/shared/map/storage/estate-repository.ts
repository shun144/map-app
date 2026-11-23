import { LngLat } from '#/value-objects/lng-lat'

export type Estate = {
  id: string
  name: string
  lngLat: LngLat
}

/** 作成する物件。ID は保存先が発行するので持たない */
export type NewEstate = Omit<Estate, 'id'>

/**
 * 保存先は差し替える前提（ADR 0004）なので、保存先の外のコードはこの型にだけ依存する。
 * ID を保存先に発行させるのは、本番の API に差し替えたときに API が ID を発行する想定だから。
 */
export interface EstateRepository {
  /** 並び順は決めない */
  list: () => Promise<Array<Estate>>
  /** 物件がない・壊れている・読めない形式のときは null */
  find: (estateId: string) => Promise<Estate | null>
  /** ID を発行して保存し、ID の付いた物件を返す */
  create: (newEstate: NewEstate) => Promise<Estate>
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/** 保存先から返る値はアプリの外から来たものなので、どの保存先でも型を信用せず中身を確かめる */
export function isEstate(value: unknown): value is Estate {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    LngLat.safeParse(value.lngLat).success
  )
}
