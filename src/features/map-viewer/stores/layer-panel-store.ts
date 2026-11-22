import { create } from 'zustand'

/** リロード後まで覚える必要がないので、保存する状態（TanStack Query）ではなく Zustand に置く */
type LayerPanelStore = {
  open: boolean
  toggle: () => void
}

export const useLayerPanelStore = create<LayerPanelStore>((set) => ({
  open: true,
  toggle: () => set((state) => ({ open: !state.open })),
}))
