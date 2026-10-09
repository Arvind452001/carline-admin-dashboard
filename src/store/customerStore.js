import { create } from 'zustand'
import { mockCustomers } from '@/shared/utils/mockData'

export const useCustomerStore = create(() => ({
  customers: mockCustomers,
}))
