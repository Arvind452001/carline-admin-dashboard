import { Navigate, useParams, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

// Guards a /:roleSlug/* subtree: user must be logged in AND their role
// must match the roleSlug in the URL (so a dispatcher can't open /billing/...).
export default function ProtectedRoute({ children, roleSlug: propRoleSlug }) {
  const { roleSlug: paramRoleSlug } = useParams()
  const { pathname } = useLocation()
  const { isAuthenticated, role } = useAuthStore()

  const currentRoleSlug = propRoleSlug || paramRoleSlug || pathname.split('/')[1]

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (currentRoleSlug && role !== currentRoleSlug) return <Navigate to={`/${role}/dashboard`} replace />

  return children
}
