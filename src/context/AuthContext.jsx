// Thin context wrapper around the auth store, for components that prefer
// context over importing the zustand store directly.
import { createContext, useContext } from 'react'
import { useAuthStore } from '@/store/authStore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const auth = useAuthStore()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
