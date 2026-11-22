import type { OverlayAppearance } from '#/lib/map/types'
import type { LayerState, OverlaySetting } from '#/shared/map/types'

export type OverlayChange =
  | { type: 'add'; overlayId: string; appearance: OverlayAppearance }
  | { type: 'remove'; overlayId: string }
  | { type: 'update'; overlayId: string; appearance: OverlayAppearance }

export type LayerStateDiff = {
  /** 変わったときだけベースマップの ID */
  basemapId: string | null
  overlayChanges: Array<OverlayChange>
  /** 重なり順が変わったときだけ新しい順（先頭が最下層） */
  overlayOrder: Array<string> | null
}

const appearanceOf = ({
  visible,
  opacity,
}: OverlaySetting): OverlayAppearance => ({
  visible,
  opacity,
})

/** prev が null のときは地図が空とみなし、すべてを追加として返す */
export function diffLayerState(
  prev: LayerState | null,
  next: LayerState,
): LayerStateDiff {
  const prevById = new Map(
    (prev?.overlays ?? []).map((setting) => [setting.overlayId, setting]),
  )
  const nextIds = new Set(next.overlays.map((setting) => setting.overlayId))

  const overlayChanges: Array<OverlayChange> = []
  for (const [overlayId] of prevById) {
    if (!nextIds.has(overlayId))
      overlayChanges.push({ type: 'remove', overlayId })
  }
  for (const setting of next.overlays) {
    const before = prevById.get(setting.overlayId)
    if (!before) {
      overlayChanges.push({
        type: 'add',
        overlayId: setting.overlayId,
        appearance: appearanceOf(setting),
      })
    } else if (
      before.visible !== setting.visible ||
      before.opacity !== setting.opacity
    ) {
      overlayChanges.push({
        type: 'update',
        overlayId: setting.overlayId,
        appearance: appearanceOf(setting),
      })
    }
  }

  const prevOrder = (prev?.overlays ?? []).map((setting) => setting.overlayId)
  const nextOrder = next.overlays.map((setting) => setting.overlayId)
  const orderChanged =
    prevOrder.length !== nextOrder.length ||
    prevOrder.some((overlayId, index) => overlayId !== nextOrder[index])

  return {
    basemapId: prev?.basemapId === next.basemapId ? null : next.basemapId,
    overlayChanges,
    overlayOrder: orderChanged ? nextOrder : null,
  }
}
