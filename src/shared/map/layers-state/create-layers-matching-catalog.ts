import type { BaseLayerDefinition, OverlayerDefinition } from '#/lib/map/types'
import type { Layers, OverlayerSetting } from '../types'

export const DEFAULT_OVERLAYER_OPACITY = 1

/**
 * アプリの更新でカタログやベースレイヤーが変わっても、古い保存データで起動が壊れないように合わせ込む。
 * 新しく増えたオーバーレイヤーを非表示で足すのは、利用者が選んでいない層を勝手に表示しないため。
 */
export function createLayersMatchingCatalog(
  storedLayers: Layers | null,
  overlayerCatalog: ReadonlyArray<OverlayerDefinition>,
  baseLayers: ReadonlyArray<BaseLayerDefinition>,
  defaultBaseLayerId: string,
): Layers {
  const overlayerIdsInCatalog = new Set(
    overlayerCatalog.map((overlayerDefinition) => overlayerDefinition.id),
  )

  const keptOverlayerSettings = (storedLayers?.overlayers ?? []).filter(
    (overlayerSetting) =>
      overlayerIdsInCatalog.has(overlayerSetting.overlayerId),
  )
  const keptOverlayerIds = new Set(
    keptOverlayerSettings.map(
      (overlayerSetting) => overlayerSetting.overlayerId,
    ),
  )
  const addedOverlayerSettings: Array<OverlayerSetting> = overlayerCatalog
    .filter(
      (overlayerDefinition) => !keptOverlayerIds.has(overlayerDefinition.id),
    )
    .map((overlayerDefinition) => ({
      overlayerId: overlayerDefinition.id,
      visible: false,
      opacity: DEFAULT_OVERLAYER_OPACITY,
    }))

  const baseLayerExists = baseLayers.some(
    (baseLayer) => baseLayer.id === storedLayers?.baseLayerId,
  )

  return {
    baseLayerId:
      storedLayers && baseLayerExists
        ? storedLayers.baseLayerId
        : defaultBaseLayerId,
    overlayers: [...keptOverlayerSettings, ...addedOverlayerSettings],
  }
}
