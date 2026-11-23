import type { BaseLayerDefinition } from '#/lib/map/types'
import type { OverlayerCatalogEntry } from '../catalog/overlayer-catalog'
import type { Layers } from '../types'

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

  const keptOverlayers = (storedLayers?.overlayers ?? []).filter((overlayer) =>
    overlayerIdsInCatalog.has(overlayer.id),
  )
  const keptOverlayerIds = new Set(
    keptOverlayers.map((overlayer) => overlayer.id),
  )
  const addedOverlayers: Layers['overlayers'] = overlayerCatalog
    .filter(
      (overlayerCatalogEntry) =>
        !keptOverlayerIds.has(overlayerCatalogEntry.id),
    )
    .map((overlayerCatalogEntry) => ({
      id: overlayerCatalogEntry.id,
      appearance: {
        visible: overlayerCatalogEntry.visibleWhenAdded,
        opacity: DEFAULT_OVERLAYER_OPACITY,
      },
    }))

  const hasStoredBaseLayerInList = baseLayers.some(
    (baseLayer) => baseLayer.id === storedLayers?.baseLayerId,
  )

  return {
    baseLayerId:
      storedLayers && hasStoredBaseLayerInList
        ? storedLayers.baseLayerId
        : defaultBaseLayerId,
    overlayers: [...keptOverlayers, ...addedOverlayers],
  }
}
