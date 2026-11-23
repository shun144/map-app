import type { OverlayerAppearance } from '#/lib/map/types'
import type { Layers } from '#/shared/map/types'

export type ChangedOverlayer =
  | {
      type: 'add'
      id: string
      appearance: OverlayerAppearance
    }
  | { type: 'remove'; id: string }
  | {
      type: 'update'
      id: string
      appearance: OverlayerAppearance
    }

export type LayersChanges = {
  /** 変わったときだけベースレイヤーの ID */
  baseLayerId: string | null
  changedOverlayers: Array<ChangedOverlayer>
  /** 重なり順が変わったときだけ新しい順（先頭が最下層） */
  overlayerOrder: Array<string> | null
}

export function findChangesBetweenLayers(
  fromLayers: Layers,
  toLayers: Layers,
): LayersChanges {
  const fromOverlayersById = new Map(
    fromLayers.overlayers.map((fromOverlayer) => [
      fromOverlayer.id,
      fromOverlayer,
    ]),
  )
  const toOverlayerIds = new Set(
    toLayers.overlayers.map((toOverlayer) => toOverlayer.id),
  )

  const changedOverlayers: Array<ChangedOverlayer> = []

  for (const overlayerId of fromOverlayersById.keys()) {
    if (toOverlayerIds.has(overlayerId)) continue
    changedOverlayers.push({ type: 'remove', id: overlayerId })
  }

  for (const toOverlayer of toLayers.overlayers) {
    const fromOverlayer = fromOverlayersById.get(toOverlayer.id)
    if (!fromOverlayer) {
      changedOverlayers.push({
        type: 'add',
        id: toOverlayer.id,
        appearance: toOverlayer.appearance,
      })
      continue
    }

    const isOverlayerAppearanceChanged =
      fromOverlayer.appearance.visible !== toOverlayer.appearance.visible ||
      fromOverlayer.appearance.opacity !== toOverlayer.appearance.opacity

    if (!isOverlayerAppearanceChanged) continue

    changedOverlayers.push({
      type: 'update',
      id: toOverlayer.id,
      appearance: toOverlayer.appearance,
    })
  }

  const fromOverlayerOrder = fromLayers.overlayers.map(
    (overlayer) => overlayer.id,
  )
  const toOverlayerOrder = toLayers.overlayers.map((overlayer) => overlayer.id)
  const isOverlayerOrderChanged =
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
    changedOverlayers,
    overlayerOrder: isOverlayerOrderChanged ? toOverlayerOrder : null,
  }
}
