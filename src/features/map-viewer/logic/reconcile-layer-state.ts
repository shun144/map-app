import type { BasemapDefinition, OverlayDefinition } from '#/lib/map/types'
import type { LayerState, OverlaySetting } from '../types'

export const DEFAULT_OVERLAY_OPACITY = 1

/**
 * アプリの更新でカタログやベースマップが変わっても、古い保存データで起動が壊れないように合わせ込む。
 * 新しく増えたオーバーレイを非表示で足すのは、利用者が選んでいない層を勝手に表示しないため。
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
