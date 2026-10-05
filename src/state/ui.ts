import { create } from 'zustand'

export type ToastItem = {
  id: number
  message: string
  action?: { label: string; run: () => void }
  duration: number
}

export type Burst = { id: number; x: number; y: number }

type UiState = {
  toast: ToastItem | null
  showToast: (t: Omit<ToastItem, 'id'>) => void
  dismissToast: () => void
  sheetDepth: number
  pushSheet: () => () => void
  reducedMotion: 'user' | 'always'
  setReducedMotion: (v: 'user' | 'always') => void
  bursts: Burst[]
  addBurst: (x: number, y: number) => void
  removeBurst: (id: number) => void
}

let nextId = 1

export const useUi = create<UiState>((set) => ({
  toast: null,
  showToast: (t) => set({ toast: { ...t, id: nextId++ } }),
  dismissToast: () => set({ toast: null }),
  sheetDepth: 0,
  pushSheet: () => {
    set((s) => ({ sheetDepth: s.sheetDepth + 1 }))
    return () => set((s) => ({ sheetDepth: s.sheetDepth - 1 }))
  },
  reducedMotion: 'user',
  setReducedMotion: (reducedMotion) => {
    if (reducedMotion === 'always') document.documentElement.dataset.reducedMotion = 'always'
    else delete document.documentElement.dataset.reducedMotion
    set({ reducedMotion })
  },
  bursts: [],
  addBurst: (x, y) => set((s) => ({ bursts: [...s.bursts, { id: nextId++, x, y }] })),
  removeBurst: (id) => set((s) => ({ bursts: s.bursts.filter((b) => b.id !== id) })),
}))
