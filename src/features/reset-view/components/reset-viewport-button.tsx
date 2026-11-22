import { DEFAULT_VIEWPORT } from '#/config/default-viewport'
import { useMoveMapToViewport } from '../hooks/use-move-map-to-viewport'

export function ResetViewportButton() {
  const moveMapToViewport = useMoveMapToViewport()
  return (
    <button
      type="button"
      onClick={() => moveMapToViewport(DEFAULT_VIEWPORT)}
      className="rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-md hover:bg-slate-50"
    >
      初期位置に戻る
    </button>
  )
}
