import { create } from 'zustand'

/** レイヤーパネルの開閉。保存しない UI 状態なので Zustand に置く */
type LayerPanelStore = {
  open: boolean
  toggle: () => void
}

export const useLayerPanelStore = create<LayerPanelStore>((set) => ({
  open: true,
  toggle: () => set((state) => ({ open: !state.open })),
}))
