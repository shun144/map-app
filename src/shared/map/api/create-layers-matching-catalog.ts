import type { BaseLayerDefinition } from '#/lib/map/types'
import type { OverlayerCatalogEntry } from '../catalog/overlayer-catalog'
import type { Layers, OverlayerSetting } from '../types'

export const DEFAULT_OVERLAYER_OPACITY = 1

/**
 * 保存データのレイヤー構成から、カタログにないオーバーレイヤーを取り除き、カタログに新しく増えたオーバーレイヤーを足す。
 * ベースレイヤーが一覧にないときは既定のベースレイヤーにする。
 * アプリの更新でカタログやベースレイヤーが変わっても、古い保存データで起動が壊れないようにするため。
 * 新しく増えたオーバーレイヤーは、カタログの visibleWhenAdded が true のものを除いて非表示で足す。
 * 非表示にするのは、利用者が選んでいない層を勝手に表示しないため。
 */
export function createLayersMatchingCatalog(
  storedLayers: Layers | null,
  overlayerCatalog: ReadonlyArray<OverlayerCatalogEntry>,
  baseLayers: ReadonlyArray<BaseLayerDefinition>,
  defaultBaseLayerId: string,
): Layers {
  const overlayerIdsInCatalog = new Set(
    overlayerCatalog.map((overlayerCatalogEntry) => overlayerCatalogEntry.id),
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
      (overlayerCatalogEntry) =>
        !keptOverlayerIds.has(overlayerCatalogEntry.id),
    )
    .map((overlayerCatalogEntry) => ({
      overlayerId: overlayerCatalogEntry.id,
      visible: overlayerCatalogEntry.visibleWhenAdded,
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
