import { createContext, useContext } from 'react'
import { useCompanyStore } from '@/store/companyStore'

const CompanyContext = createContext(null)

export function CompanyProvider({ children }) {
  const company = useCompanyStore()
  return <CompanyContext.Provider value={company}>{children}</CompanyContext.Provider>
}

export function useCompanyContext() {
  const ctx = useContext(CompanyContext)
  if (!ctx) throw new Error('useCompanyContext must be used within CompanyProvider')
  return ctx
}
