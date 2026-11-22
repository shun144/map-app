import type { OverlayDefinition } from '#/lib/map/types'

/**
 * 見た目を利用者に変えさせないのは、スタイル編集だけで1つの機能になる規模だから（MVP の範囲外）。
 * 並び順は、カタログに新しく追加されたときの重なり順の初期値（先頭が最下層）。
 * サンプルデータの座標は手書きの概略で、実際の位置とはずれる。
 */
export const OVERLAY_CATALOG: ReadonlyArray<OverlayDefinition> = [
  {
    id: 'areas',
    label: '公園・緑地（面）',
    dataUrl: '/data/areas.geojson',
    geometryKind: 'polygon',
    color: '#16a34a',
  },
  {
    id: 'railways',
    label: '主要路線（線）',
    dataUrl: '/data/railways.geojson',
    geometryKind: 'line',
    color: '#ea580c',
  },
  {
    id: 'stations',
    label: '主要駅（点）',
    dataUrl: '/data/stations.geojson',
    geometryKind: 'point',
    color: '#2563eb',
  },
]

export function findOverlayDefinition(
  overlayId: string,
): OverlayDefinition | undefined {
  return OVERLAY_CATALOG.find((definition) => definition.id === overlayId)
}
