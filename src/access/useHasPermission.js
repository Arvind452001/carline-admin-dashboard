import { usePermissionContext } from './PermissionContext'

export function useHasPermission(permission) {
  const { can } = usePermissionContext()
  return can(permission)
}
