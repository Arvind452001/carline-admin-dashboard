import { create } from 'zustand'
import { mockTrips } from '@/shared/utils/mockData'

export const useTripStore = create((set, get) => ({
  trips: mockTrips,
  filterStatus: 'all',
  setFilterStatus: (status) => set({ filterStatus: status }),
  get filteredTrips() {
    const { trips, filterStatus } = get()
    if (filterStatus === 'all') return trips
    return trips.filter((t) => t.status === filterStatus)
  },
}))
