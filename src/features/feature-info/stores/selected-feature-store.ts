import { create } from 'zustand'
import type { MapFeature } from '#/lib/map'

/** 選択中の地物。保存せず、再読み込みで解除される UI 状態 */
type SelectedFeatureStore = {
  selected: MapFeature | null
  select: (feature: MapFeature | null) => void
}

export const useSelectedFeatureStore = create<SelectedFeatureStore>((set) => ({
  selected: null,
  select: (feature) => set({ selected: feature }),
}))
