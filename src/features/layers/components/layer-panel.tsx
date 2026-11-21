import { useLayerState } from '../api/get-layers'
import { useUpdateLayers } from '../api/update-layers'
import { BASEMAPS } from '../config/basemaps'
import { findOverlayDefinition } from '../config/overlay-catalog'
import {
  moveOverlay,
  selectBasemap,
  setOverlayOpacity,
  setOverlayVisible,
} from '../logic/layer-operations'
import { useLayerPanelStore } from '../stores/layer-panel-store'
import type { LayerState } from '../types'

export function LayerPanel({ mapId }: { mapId: string }) {
  const state = useLayerState(mapId)
  const { mutate } = useUpdateLayers(mapId)
  const open = useLayerPanelStore((store) => store.open)
  const toggle = useLayerPanelStore((store) => store.toggle)

  const apply = (operation: (current: LayerState) => LayerState) =>
    mutate(operation(state))

  // 画面では上にあるものほど上に描かれるよう、最上位から並べる
  const overlaysTopFirst = [...state.overlays].reverse()

  return (
    <section className="w-72 rounded-lg bg-white/95 text-sm text-slate-800 shadow-lg backdrop-blur">
      <header className="flex items-center justify-between px-4 py-3">
        <h2 className="font-semibold">レイヤー</h2>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
        >
          {open ? '閉じる' : '開く'}
        </button>
      </header>

      {open && (
        <div className="space-y-4 border-t border-slate-200 px-4 py-3">
          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-slate-500">
              ベースマップ
            </legend>
            <div className="space-y-1">
              {BASEMAPS.map((basemap) => (
                <label key={basemap.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="basemap"
                    checked={state.basemapId === basemap.id}
                    onChange={() => apply((s) => selectBasemap(s, basemap.id))}
                  />
                  {basemap.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-slate-500">
              オーバーレイ（上ほど手前）
            </legend>
            <ul className="space-y-3">
              {overlaysTopFirst.map((setting, index) => {
                const definition = findOverlayDefinition(setting.overlayId)
                if (!definition) return null
                return (
                  <li key={setting.overlayId} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`overlay-${setting.overlayId}`}
                        checked={setting.visible}
                        onChange={(event) =>
                          apply((s) =>
                            setOverlayVisible(
                              s,
                              setting.overlayId,
                              event.target.checked,
                            ),
                          )
                        }
                      />
                      <span
                        className="inline-block size-3 rounded-sm"
                        style={{ backgroundColor: definition.color }}
                      />
                      <label
                        htmlFor={`overlay-${setting.overlayId}`}
                        className="flex-1"
                      >
                        {definition.label}
                      </label>
                      <button
                        type="button"
                        aria-label={`${definition.label}を上へ`}
                        disabled={index === 0}
                        onClick={() =>
                          apply((s) => moveOverlay(s, setting.overlayId, 'up'))
                        }
                        className="rounded px-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        aria-label={`${definition.label}を下へ`}
                        disabled={index === overlaysTopFirst.length - 1}
                        onClick={() =>
                          apply((s) =>
                            moveOverlay(s, setting.overlayId, 'down'),
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
                        value={setting.opacity}
                        disabled={!setting.visible}
                        onChange={(event) =>
                          apply((s) =>
                            setOverlayOpacity(
                              s,
                              setting.overlayId,
                              Number(event.target.value),
                            ),
                          )
                        }
                        className="flex-1"
                      />
                      <span className="w-8 text-right tabular-nums">
                        {Math.round(setting.opacity * 100)}%
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </fieldset>
        </div>
      )}
    </section>
  )
}
