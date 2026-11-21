import { DEFAULT_VIEWPORT } from '../config/default-viewport'
import { useMoveToViewport } from '../hooks/use-move-to-viewport'

export function ResetViewportButton({ mapId }: { mapId: string }) {
  const moveTo = useMoveToViewport(mapId)
  return (
    <button
      type="button"
      onClick={() => moveTo(DEFAULT_VIEWPORT)}
      className="rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-md hover:bg-slate-50"
    >
      初期位置に戻る
    </button>
  )
}
