import { useLayersState } from '#/shared/map/api/fetch-map-info'
import { useWriteLayersStateToCache } from '#/shared/map/api/write-layers-state-to-cache'
import { BASE_LAYERS } from '#/shared/map/catalog/base-layers'
import { findOverlayerDefinition } from '#/shared/map/catalog/overlayer-catalog'
import {
  moveOverlayerOneStep,
  updateBaseLayer,
  updateOverlayerOpacity,
  updateOverlayerVisibility,
} from '#/shared/map/api/update-layers'
import { useLayerPanelStore } from '../stores/layer-panel-store'
import type { ReactNode } from 'react'

type Props = {
  mapId: string
  /** 保存ボタンなど、ほかの feature の部品を差し込む枠。パネルが他の feature を import しないため */
  children?: ReactNode
}

export function LayerPanel({ mapId, children }: Props) {
  const layersState = useLayersState(mapId)
  const writeLayersStateToCache = useWriteLayersStateToCache(mapId)
  const isOpen = useLayerPanelStore((store) => store.isOpen)
  const switchBetweenOpenAndClosed = useLayerPanelStore(
    (store) => store.switchBetweenOpenAndClosed,
  )

  // 保存上は先頭が最下層だが、パネルでは手前に描かれるものを上に見せたいので逆順で表示する
  const overlayersTopFirst = [...layersState.overlayers].reverse()

  return (
    <section className="w-72 rounded-lg bg-white/95 text-sm text-slate-800 shadow-lg backdrop-blur">
      <header className="flex items-center justify-between px-4 py-3">
        <h2 className="font-semibold">レイヤー</h2>
        <button
          type="button"
          onClick={switchBetweenOpenAndClosed}
          aria-expanded={isOpen}
          className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
        >
          {isOpen ? '閉じる' : '開く'}
        </button>
      </header>

      {isOpen && (
        <div className="space-y-4 border-t border-slate-200 px-4 py-3">
          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-slate-500">
              ベースレイヤー
            </legend>
            <div className="space-y-1">
              {BASE_LAYERS.map((baseLayer) => (
                <label key={baseLayer.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="baseLayer"
                    checked={layersState.baseLayerId === baseLayer.id}
                    onChange={() =>
                      writeLayersStateToCache(
                        updateBaseLayer(layersState, baseLayer.id),
                      )
                    }
                  />
                  {baseLayer.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-slate-500">
              オーバーレイヤー（上ほど手前）
            </legend>
            <ul className="space-y-3">
              {overlayersTopFirst.map((overlayerSetting, positionFromTop) => {
                const overlayerDefinition = findOverlayerDefinition(
                  overlayerSetting.overlayerId,
                )
                if (!overlayerDefinition) return null
                return (
                  <li key={overlayerSetting.overlayerId} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`overlayer-${overlayerSetting.overlayerId}`}
                        checked={overlayerSetting.visible}
                        onChange={(event) =>
                          writeLayersStateToCache(
                            updateOverlayerVisibility(
                              layersState,
                              overlayerSetting.overlayerId,
                              event.target.checked,
                            ),
                          )
                        }
                      />
                      <span
                        className="inline-block size-3 rounded-sm"
                        style={{
                          backgroundColor: overlayerDefinition.color,
                        }}
                      />
                      <label
                        htmlFor={`overlayer-${overlayerSetting.overlayerId}`}
                        className="flex-1"
                      >
                        {overlayerDefinition.label}
                      </label>
                      <button
                        type="button"
                        aria-label={`${overlayerDefinition.label}を上へ`}
                        disabled={positionFromTop === 0}
                        onClick={() =>
                          writeLayersStateToCache(
                            moveOverlayerOneStep(
                              layersState,
                              overlayerSetting.overlayerId,
                              'up',
                            ),
                          )
                        }
                        className="rounded px-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        aria-label={`${overlayerDefinition.label}を下へ`}
                        disabled={
                          positionFromTop === overlayersTopFirst.length - 1
                        }
                        onClick={() =>
                          writeLayersStateToCache(
                            moveOverlayerOneStep(
                              layersState,
                              overlayerSetting.overlayerId,
                              'down',
                            ),
                          )
                        }
                        className="rounded px-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </div>
                    <label className="flex items-center gap-2 pl-6 text-xs text-slate-500">
                      不透明度
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={overlayerSetting.opacity}
                        disabled={!overlayerSetting.visible}
                        onChange={(event) =>
                          writeLayersStateToCache(
                            updateOverlayerOpacity(
                              layersState,
                              overlayerSetting.overlayerId,
                              Number(event.target.value),
                            ),
                          )
                        }
                        className="flex-1"
                      />
                      <span className="w-8 text-right tabular-nums">
                        {Math.round(overlayerSetting.opacity * 100)}%
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </fieldset>

          {children}
        </div>
      )}
    </section>
  )
}
