import { useAuthStore } from '@/store/authStore'
import { loginRequest } from '../services/authApi'

export function useAuth() {
  const { user, role, isAuthenticated, login, logout } = useAuthStore()

  async function signIn({ email, password, role }) {
    const session = await loginRequest({ email, password, role })
    login(session)
    return session
  }

  return { user, role, isAuthenticated, signIn, signOut: logout }
}
