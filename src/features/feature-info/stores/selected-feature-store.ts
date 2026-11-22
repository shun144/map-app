import { create } from 'zustand'
import type { MapFeature } from '#/lib/map/types'

/** リロード後に前回の選択が残っても意味がないので、保存せず Zustand に置く */
type SelectedFeatureStore = {
  selected: MapFeature | null
  select: (feature: MapFeature | null) => void
}

export const useSelectedFeatureStore = create<SelectedFeatureStore>((set) => ({
  selected: null,
  select: (feature) => set({ selected: feature }),
}))
