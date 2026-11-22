import type { LayerState, OverlaySetting } from '../types'

/*
 * 操作を純粋関数に切り出したのは、画面も地図もなしで操作の正しさをテストするため。
 * mutation はこの結果を保存するだけにする。
 */

export function selectBasemap(
  state: LayerState,
  basemapId: string,
): LayerState {
  return { ...state, basemapId }
}

function updateOverlaySetting(
  state: LayerState,
  overlayId: string,
  update: (setting: OverlaySetting) => OverlaySetting,
): LayerState {
  return {
    ...state,
    overlays: state.overlays.map((setting) =>
      setting.overlayId === overlayId ? update(setting) : setting,
    ),
  }
}

export function setOverlayVisible(
  state: LayerState,
  overlayId: string,
  visible: boolean,
): LayerState {
  return updateOverlaySetting(state, overlayId, (setting) => ({
    ...setting,
    visible,
  }))
}

export function setOverlayOpacity(
  state: LayerState,
  overlayId: string,
  opacity: number,
): LayerState {
  const clamped = Math.min(1, Math.max(0, opacity))
  return updateOverlaySetting(state, overlayId, (setting) => ({
    ...setting,
    opacity: clamped,
  }))
}

export function moveOverlay(
  state: LayerState,
  overlayId: string,
  direction: 'up' | 'down',
): LayerState {
  const index = state.overlays.findIndex(
    (setting) => setting.overlayId === overlayId,
  )
  // 配列の先頭が最下層なので、「上へ」は添字を増やす方向
  const target = direction === 'up' ? index + 1 : index - 1
  if (index < 0 || target < 0 || target >= state.overlays.length) return state

  const overlays = [...state.overlays]
  ;[overlays[index], overlays[target]] = [overlays[target], overlays[index]]
  return { ...state, overlays }
}
