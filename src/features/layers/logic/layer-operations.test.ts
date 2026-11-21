import { describe, expect, it } from 'vitest'
import { moveOverlay, setOverlayOpacity } from './layer-operations'
import type { LayerState } from '../types'

const state: LayerState = {
  basemapId: 'pale',
  overlays: [
    { overlayId: 'bottom', visible: true, opacity: 1 },
    { overlayId: 'middle', visible: true, opacity: 1 },
    { overlayId: 'top', visible: true, opacity: 1 },
  ],
}
const order = (s: LayerState) => s.overlays.map((o) => o.overlayId)

describe('moveOverlay', () => {
  it('up は1つ手前（配列の後ろ）へ動かす', () => {
    expect(order(moveOverlay(state, 'bottom', 'up'))).toEqual([
      'middle',
      'bottom',
      'top',
    ])
  })

  it('down は1つ奥（配列の前）へ動かす', () => {
    expect(order(moveOverlay(state, 'top', 'down'))).toEqual([
      'bottom',
      'top',
      'middle',
    ])
  })

  it('端では何もしない（同じ参照を返す）', () => {
    expect(moveOverlay(state, 'top', 'up')).toBe(state)
    expect(moveOverlay(state, 'bottom', 'down')).toBe(state)
  })
})

describe('setOverlayOpacity', () => {
  it('0〜1 に丸める', () => {
    expect(setOverlayOpacity(state, 'top', 1.5).overlays[2].opacity).toBe(1)
    expect(setOverlayOpacity(state, 'top', -1).overlays[2].opacity).toBe(0)
  })
})
