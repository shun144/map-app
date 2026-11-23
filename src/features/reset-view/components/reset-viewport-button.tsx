import { useSavedViewportState } from '#/shared/map/api/fetch-map-info'
import { useMoveMapToViewport } from '../hooks/use-move-map-to-viewport'

type Props = {
  mapId: string
}

/**
 * 戻る先をキャッシュのビューポート（最後に読み込んだか保存したビューポート）にするのは、
 * 地図画面を開いたときと同じ位置に戻れるようにするため。保存すると戻る先も保存した位置に変わる
 */
export function ResetViewportButton({ mapId }: Props) {
  const savedViewport = useSavedViewportState(mapId)
  const moveMapToViewport = useMoveMapToViewport()
  return (
    <button
      type="button"
      onClick={() => moveMapToViewport(savedViewport)}
      className="rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-md hover:bg-slate-50"
    >
      保存した位置に戻る
    </button>
  )
}
