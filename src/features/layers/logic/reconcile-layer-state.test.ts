import { describe, expect, it } from 'vitest'
import { reconcileLayerState } from './reconcile-layer-state'
import type { BasemapDefinition, OverlayDefinition } from '#/lib/map'

const overlay = (id: string): OverlayDefinition => ({
  id,
  label: id,
  dataUrl: `/${id}.geojson`,
  geometryKind: 'point',
  color: '#000',
})
const basemap = (id: string): BasemapDefinition => ({
  id,
  label: id,
  tileUrl: '',
  attribution: '',
  maxZoom: 18,
})
const catalog = [overlay('a'), overlay('b')]
const basemaps = [basemap('pale'), basemap('osm')]

describe('reconcileLayerState', () => {
  it('保存データがなければ全オーバーレイ非表示・デフォルトのベースマップになる', () => {
    expect(reconcileLayerState(null, catalog, basemaps, 'pale')).toEqual({
      basemapId: 'pale',
      overlays: [
        { overlayId: 'a', visible: false, opacity: 1 },
        { overlayId: 'b', visible: false, opacity: 1 },
      ],
    })
  })

  it('保存された重なり順と表示設定を保ち、カタログから消えたものは捨て、増えたものは最上位に足す', () => {
    const stored = {
      basemapId: 'osm',
      overlays: [
        { overlayId: 'b', visible: true, opacity: 0.5 },
        { overlayId: 'removed', visible: true, opacity: 1 },
      ],
    }
    expect(reconcileLayerState(stored, catalog, basemaps, 'pale')).toEqual({
      basemapId: 'osm',
      overlays: [
        { overlayId: 'b', visible: true, opacity: 0.5 },
        { overlayId: 'a', visible: false, opacity: 1 },
      ],
    })
  })

  it('存在しないベースマップはデフォルトに戻す', () => {
    const stored = { basemapId: 'gone', overlays: [] }
    expect(
      reconcileLayerState(stored, catalog, basemaps, 'pale').basemapId,
    ).toBe('pale')
  })
})
