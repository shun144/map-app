import { z } from 'zod'

export const Longitude = z.number().min(-180).max(180).brand<'Longitude'>()
export type Longitude = z.infer<typeof Longitude>

export const Latitude = z.number().min(-90).max(90).brand<'Latitude'>()
export type Latitude = z.infer<typeof Latitude>

export const LngLat = z.object({ lng: Longitude, lat: Latitude }).readonly()
export type LngLat = z.infer<typeof LngLat>
