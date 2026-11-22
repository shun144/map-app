import { useMapController } from '#/lib/map/map-provider'
import { useLayerState } from '../api/get-layers'
import { useSaveMapState } from '../api/save-map-state'

const formatTime = (date: Date) =>
  date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })

type Props = {
  mapId: string
}

export function SaveMapStateButton({ mapId }: Props) {
  const mapController = useMapController()
  const layerState = useLayerState(mapId)
  const { mutate, isPending, isError, data: savedAt } = useSaveMapState(mapId)

  // ビューポートは押した瞬間の地図から読む。操作中の正は地図にあり、キャッシュには無いため（ADR 0001）
  const save = () => {
    if (!mapController) return
    mutate({ viewport: mapController.getViewport(), layerState })
  }

  return (
    <div className="flex items-center gap-3 border-t border-slate-200 pt-3">
      <button
        type="button"
        onClick={save}
        disabled={!mapController || isPending}
        className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {isPending ? '保存中…' : '保存'}
      </button>
      {/* 保存しないとリロードで操作前に戻ることを、最後に保存した時刻で利用者に気づかせる */}
      <p className="text-xs text-slate-500" role="status">
        {isError
          ? '保存できませんでした。もう一度押してください'
          : savedAt
            ? `${formatTime(savedAt)} に保存しました`
            : '未保存の変更はリロードで消えます'}
      </p>
    </div>
  )
}
