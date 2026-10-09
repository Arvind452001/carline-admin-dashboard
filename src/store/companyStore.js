import { create } from 'zustand'
import { mockCompanies } from '@/shared/utils/mockData'

export const useCompanyStore = create((set) => ({
  companies: mockCompanies,
  selectedCompanyId: mockCompanies[0]?.id ?? null,
  selectCompany: (id) => set({ selectedCompanyId: id }),
}))
