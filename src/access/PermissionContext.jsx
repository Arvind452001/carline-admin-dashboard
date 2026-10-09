import { createContext, useContext, useMemo } from 'react'
import { useAuthStore } from '@/store/authStore'
import { roleHasPermission } from './permissions'

const PermissionContext = createContext({ role: null, can: () => false })

export function PermissionProvider({ children }) {
  const role = useAuthStore((s) => s.role)

  const value = useMemo(
    () => ({
      role,
      can: (permission) => roleHasPermission(role, permission),
    }),
    [role]
  )

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>
}

export function usePermissionContext() {
  return useContext(PermissionContext)
}
