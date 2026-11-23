import { z } from 'zod'

/*
 * 経度と緯度は、範囲の決まった別々の値なので、ただの number ではなく zod の brand で型を分ける。
 * 範囲外の値と、経度と緯度の取り違えを型で防ぐため。
 * 値は parse / safeParse を通して作る。`as Longitude` のような型の書き換えで作らない（範囲の確認を飛ばせてしまうため）
 */

export const Longitude = z.number().min(-180).max(180).brand<'Longitude'>()
export type Longitude = z.infer<typeof Longitude>

export const Latitude = z.number().min(-90).max(90).brand<'Latitude'>()
export type Latitude = z.infer<typeof Latitude>

export const LngLat = z.object({ lng: Longitude, lat: Latitude }).readonly()
export type LngLat = z.infer<typeof LngLat>
