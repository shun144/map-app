import type { BasemapDefinition } from '#/lib/map'

const GSI_ATTRIBUTION =
  '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>'

export const BASEMAPS: ReadonlyArray<BasemapDefinition> = [
  {
    id: 'gsi-pale',
    label: '地理院 淡色地図',
    tileUrl: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
    attribution: GSI_ATTRIBUTION,
    maxZoom: 18,
  },
  {
    id: 'gsi-std',
    label: '地理院 標準地図',
    tileUrl: 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
    attribution: GSI_ATTRIBUTION,
    maxZoom: 18,
  },
  {
    id: 'gsi-photo',
    label: '地理院 写真',
    tileUrl:
      'https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg',
    attribution: GSI_ATTRIBUTION,
    maxZoom: 18,
  },
  {
    id: 'osm',
    label: 'OpenStreetMap',
    tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>',
    maxZoom: 19,
  },
]

export const DEFAULT_BASEMAP_ID = 'gsi-pale'

export function findBasemap(basemapId: string): BasemapDefinition {
  return (
    BASEMAPS.find((basemap) => basemap.id === basemapId) ??
    BASEMAPS.find((basemap) => basemap.id === DEFAULT_BASEMAP_ID)!
  )
}
