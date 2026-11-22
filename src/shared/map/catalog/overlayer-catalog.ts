import type { OverlayerDefinition } from '#/lib/map/types'

export type OverlayerCatalogEntry = OverlayerDefinition & {
  /** カタログに追加されたあと、保存データに設定がないときに、表示した状態で始めるか */
  visibleWhenAdded: boolean
}

export const ESTATE_OVERLAYER_ID = 'estates'

/**
 * 見た目を利用者に変えさせないのは、スタイル編集だけで1つの機能になる規模だから（MVP の範囲外）。
 * 並び順は、カタログに新しく追加されたときの重なり順の初期値（先頭が最下層）。
 * サンプルデータの座標は手書きの概略で、実際の位置とはずれる。
 */
export const OVERLAYER_CATALOG: ReadonlyArray<OverlayerCatalogEntry> = [
  {
    id: 'areas',
    label: '公園・緑地（面）',
    dataUrl: '/data/areas.geojson',
    geometryKind: 'polygon',
    color: '#16a34a',
    visibleWhenAdded: false,
  },
  {
    id: 'railways',
    label: '主要路線（線）',
    dataUrl: '/data/railways.geojson',
    geometryKind: 'line',
    color: '#ea580c',
    visibleWhenAdded: false,
  },
  {
    id: 'stations',
    label: '主要駅（点）',
    dataUrl: '/data/stations.geojson',
    geometryKind: 'point',
    color: '#2563eb',
    visibleWhenAdded: false,
  },
  // 物件レイヤーを最初から表示するのは、非表示で始めると、物件を作って地図画面に戻っても物件ポイントが見えないため。
  // いちばん手前（配列の末尾）に置くのは、物件ポイントが他のオーバーレイヤーに隠れてクリックできなくなるのを防ぐため。
  // 描く物件は利用者が増やすので dataUrl は持たず、物件の一覧から点を渡す
  {
    id: ESTATE_OVERLAYER_ID,
    label: '物件（点）',
    dataUrl: null,
    geometryKind: 'point',
    color: '#dc2626',
    visibleWhenAdded: true,
  },
]

export function findOverlayerDefinition(
  overlayerId: string,
): OverlayerCatalogEntry | undefined {
  return OVERLAYER_CATALOG.find(
    (overlayerDefinition) => overlayerDefinition.id === overlayerId,
  )
}
