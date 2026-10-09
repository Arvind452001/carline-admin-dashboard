import { create } from 'zustand'

export const useBookingStore = create((set) => ({
  draft: { pickup: '', dropoff: '', customer: '', notes: '' },
  updateDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
  resetDraft: () => set({ draft: { pickup: '', dropoff: '', customer: '', notes: '' } }),
}))
