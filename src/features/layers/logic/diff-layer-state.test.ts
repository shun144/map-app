import { describe, expect, it } from 'vitest'
import { diffLayerState } from './diff-layer-state'
import type { LayerState } from '../types'

const base: LayerState = {
  basemapId: 'pale',
  overlays: [
    { overlayId: 'a', visible: false, opacity: 1 },
    { overlayId: 'b', visible: true, opacity: 1 },
  ],
}

describe('diffLayerState', () => {
  it('前回の状態がなければ、ベースマップ・全オーバーレイ・重なり順をすべて反映する', () => {
    const diff = diffLayerState(null, base)
    expect(diff.basemapId).toBe('pale')
    expect(diff.overlayChanges.map((c) => [c.type, c.overlayId])).toEqual([
      ['add', 'a'],
      ['add', 'b'],
    ])
    expect(diff.overlayOrder).toEqual(['a', 'b'])
  })

  it('同じ状態なら何もしない', () => {
    expect(diffLayerState(base, base)).toEqual({
      basemapId: null,
      overlayChanges: [],
      overlayOrder: null,
    })
  })

  it('変わったオーバーレイだけを update する', () => {
    const next: LayerState = {
      ...base,
      overlays: [
        base.overlays[0],
        { overlayId: 'b', visible: true, opacity: 0.3 },
      ],
    }
    expect(diffLayerState(base, next).overlayChanges).toEqual([
      {
        type: 'update',
        overlayId: 'b',
        appearance: { visible: true, opacity: 0.3 },
      },
    ])
  })

  it('並べ替えだけなら重なり順だけを返す', () => {
    const next: LayerState = { ...base, overlays: [...base.overlays].reverse() }
    const diff = diffLayerState(base, next)
    expect(diff.overlayChanges).toEqual([])
    expect(diff.overlayOrder).toEqual(['b', 'a'])
  })
})
