import type { OverlayerAppearance } from '#/lib/map/types'
import type { Layers } from '../types'

/*
 * 操作を純粋関数に切り出したのは、画面も地図もなしで操作の正しさを確かめられるようにするため。
 * キャッシュを書き換える側は、この結果を書き込むだけにする。
 *
 * どの関数も新しいオブジェクトとして非破壊的更新をする（元のレイヤー構成は書き換えない）。
 * TanStack Query・React・useDrawLayersStateOnMap は参照が変わったかどうかで変更を検知するため、
 * 元のオブジェクトを書き換えると画面も地図も更新されない。
 */

export function updateBaseLayer(layers: Layers, baseLayerId: string): Layers {
  return { ...layers, baseLayerId }
}

function updateOverlayerAppearance(
  layers: Layers,
  overlayerId: string,
  makeUpdatedAppearance: (
    appearance: OverlayerAppearance,
  ) => OverlayerAppearance,
): Layers {
  return {
    ...layers,
    overlayers: layers.overlayers.map((overlayer) =>
      overlayer.id === overlayerId
        ? {
            ...overlayer,
            appearance: makeUpdatedAppearance(overlayer.appearance),
          }
        : overlayer,
    ),
  }
}

export function updateOverlayerVisibility(
  layers: Layers,
  overlayerId: string,
  visible: boolean,
): Layers {
  return updateOverlayerAppearance(layers, overlayerId, (appearance) => ({
    ...appearance,
    visible,
  }))
}

export function updateOverlayerOpacity(
  layers: Layers,
  overlayerId: string,
  opacity: number,
): Layers {
  const clampedOpacity = Math.min(1, Math.max(0, opacity))
  return updateOverlayerAppearance(layers, overlayerId, (appearance) => ({
    ...appearance,
    opacity: clampedOpacity,
  }))
}

export function moveOverlayerOneStep(
  layers: Layers,
  overlayerId: string,
  direction: 'up' | 'down',
): Layers {
  const currentIndex = layers.overlayers.findIndex(
    (overlayer) => overlayer.id === overlayerId,
  )
  // 配列の先頭が最下層なので、「上へ」は添字を増やす方向
  const destinationIndex =
    direction === 'up' ? currentIndex + 1 : currentIndex - 1
  const isMovable =
    currentIndex >= 0 &&
    destinationIndex >= 0 &&
    destinationIndex < layers.overlayers.length
  if (!isMovable) return layers

  const overlayers = [...layers.overlayers]
  ;[overlayers[currentIndex], overlayers[destinationIndex]] = [
    overlayers[destinationIndex],
    overlayers[currentIndex],
  ]
  return { ...layers, overlayers }
}
