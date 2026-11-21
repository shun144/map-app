import type { BasemapDefinition, OverlayDefinition } from '#/lib/map'
import type { LayerState, OverlaySetting } from '../types'

export const DEFAULT_OVERLAY_OPACITY = 1

/**
 * 保存データをいまのカタログに合わせ込む。
 * - カタログから消えたオーバーレイの設定は捨てる
 * - カタログに増えたオーバーレイは非表示で最上位に足す
 * - 存在しないベースマップはデフォルトに戻す
 * - 保存データがなければ全オーバーレイ非表示の初期状態を作る
 */
export function reconcileLayerState(
  stored: LayerState | null,
  catalog: ReadonlyArray<OverlayDefinition>,
  basemaps: ReadonlyArray<BasemapDefinition>,
  defaultBasemapId: string,
): LayerState {
  const catalogIds = new Set(catalog.map((definition) => definition.id))

  const kept = (stored?.overlays ?? []).filter((setting) =>
    catalogIds.has(setting.overlayId),
  )
  const keptIds = new Set(kept.map((setting) => setting.overlayId))
  const added: Array<OverlaySetting> = catalog
    .filter((definition) => !keptIds.has(definition.id))
    .map((definition) => ({
      overlayId: definition.id,
      visible: false,
      opacity: DEFAULT_OVERLAY_OPACITY,
    }))

  const basemapExists = basemaps.some(
    (basemap) => basemap.id === stored?.basemapId,
  )

  return {
    basemapId: stored && basemapExists ? stored.basemapId : defaultBasemapId,
    overlays: [...kept, ...added],
  }
}
