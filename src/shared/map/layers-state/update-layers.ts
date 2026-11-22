import type { Layers, OverlayerSetting } from '../types'

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

function updateOverlayerSetting(
  layers: Layers,
  overlayerId: string,
  makeUpdatedOverlayerSetting: (
    overlayerSetting: OverlayerSetting,
  ) => OverlayerSetting,
): Layers {
  return {
    ...layers,
    overlayers: layers.overlayers.map((overlayerSetting) =>
      overlayerSetting.overlayerId === overlayerId
        ? makeUpdatedOverlayerSetting(overlayerSetting)
        : overlayerSetting,
    ),
  }
}

export function updateOverlayerVisibility(
  layers: Layers,
  overlayerId: string,
  visible: boolean,
): Layers {
  return updateOverlayerSetting(layers, overlayerId, (overlayerSetting) => ({
    ...overlayerSetting,
    visible,
  }))
}

export function updateOverlayerOpacity(
  layers: Layers,
  overlayerId: string,
  opacity: number,
): Layers {
  const clampedOpacity = Math.min(1, Math.max(0, opacity))
  return updateOverlayerSetting(layers, overlayerId, (overlayerSetting) => ({
    ...overlayerSetting,
    opacity: clampedOpacity,
  }))
}

export function moveOverlayerOneStep(
  layers: Layers,
  overlayerId: string,
  direction: 'up' | 'down',
): Layers {
  const currentIndex = layers.overlayers.findIndex(
    (overlayerSetting) => overlayerSetting.overlayerId === overlayerId,
  )
  // 配列の先頭が最下層なので、「上へ」は添字を増やす方向
  const destinationIndex =
    direction === 'up' ? currentIndex + 1 : currentIndex - 1
  if (
    currentIndex < 0 ||
    destinationIndex < 0 ||
    destinationIndex >= layers.overlayers.length
  )
    return layers

  const overlayers = [...layers.overlayers]
  ;[overlayers[currentIndex], overlayers[destinationIndex]] = [
    overlayers[destinationIndex],
    overlayers[currentIndex],
  ]
  return { ...layers, overlayers }
}
