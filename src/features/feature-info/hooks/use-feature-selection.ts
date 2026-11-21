import { useEffect } from 'react'
import { useMapPort } from '#/lib/map'
import { useSelectedFeatureStore } from '../stores/selected-feature-store'

/** 地図のクリックを選択中の地物に反映する。何もない場所のクリックで選択解除 */
export function useFeatureSelection() {
  const port = useMapPort()
  const select = useSelectedFeatureStore((store) => store.select)

  useEffect(() => {
    if (!port) return
    return port.onFeatureClick(select)
  }, [port, select])
}
