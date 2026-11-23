import type { OverlayerAppearance } from '#/lib/map/types'
import type { Layers, OverlayerSetting } from '#/shared/map/types'

export type OverlayerChange =
  | {
      type: 'add'
      overlayerId: string
      overlayerAppearance: OverlayerAppearance
    }
  | { type: 'remove'; overlayerId: string }
  | {
      type: 'update'
      overlayerId: string
      overlayerAppearance: OverlayerAppearance
    }

export type LayersChanges = {
  /** 変わったときだけベースレイヤーの ID */
  baseLayerId: string | null
  overlayerChanges: Array<OverlayerChange>
  /** 重なり順が変わったときだけ新しい順（先頭が最下層） */
  overlayerOrder: Array<string> | null
}

const extractOverlayerAppearance = ({
  visible,
  opacity,
}: OverlayerSetting): OverlayerAppearance => ({
  visible,
  opacity,
})

export function findChangesBetweenLayers(
  fromLayers: Layers,
  toLayers: Layers,
): LayersChanges {
  const fromOverlayerSettingsById = new Map(
    fromLayers.overlayers.map((overlayerSetting) => [
      overlayerSetting.overlayerId,
      overlayerSetting,
    ]),
  )
  const toOverlayerIds = new Set(
    toLayers.overlayers.map((overlayerSetting) => overlayerSetting.overlayerId),
  )

  const overlayerChanges: Array<OverlayerChange> = []

  for (const overlayerId of fromOverlayerSettingsById.keys()) {
    if (toOverlayerIds.has(overlayerId)) continue
    overlayerChanges.push({ type: 'remove', overlayerId })
  }

  for (const overlayerSetting of toLayers.overlayers) {
    const fromOverlayerSetting = fromOverlayerSettingsById.get(
      overlayerSetting.overlayerId,
    )
    if (!fromOverlayerSetting) {
      overlayerChanges.push({
        type: 'add',
        overlayerId: overlayerSetting.overlayerId,
        overlayerAppearance: extractOverlayerAppearance(overlayerSetting),
      })
      continue
    }

    const isOverlayerAppearanceChanged =
      fromOverlayerSetting.visible !== overlayerSetting.visible ||
      fromOverlayerSetting.opacity !== overlayerSetting.opacity
    if (!isOverlayerAppearanceChanged) continue

    overlayerChanges.push({
      type: 'update',
      overlayerId: overlayerSetting.overlayerId,
      overlayerAppearance: extractOverlayerAppearance(overlayerSetting),
    })
  }

  const fromOverlayerOrder = fromLayers.overlayers.map(
    (overlayerSetting) => overlayerSetting.overlayerId,
  )
  const toOverlayerOrder = toLayers.overlayers.map(
    (overlayerSetting) => overlayerSetting.overlayerId,
  )
  const orderChanged =
    fromOverlayerOrder.length !== toOverlayerOrder.length ||
    fromOverlayerOrder.some(
      (overlayerId, orderPosition) =>
        overlayerId !== toOverlayerOrder[orderPosition],
    )

  return {
    baseLayerId:
      fromLayers.baseLayerId === toLayers.baseLayerId
        ? null
        : toLayers.baseLayerId,
    overlayerChanges,
    overlayerOrder: orderChanged ? toOverlayerOrder : null,
  }
}
