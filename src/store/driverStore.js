import { create } from 'zustand'
import { mockDrivers } from '@/shared/utils/mockData'

export const useDriverStore = create(() => ({
  drivers: mockDrivers,
}))
