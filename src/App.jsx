import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PermissionProvider } from '@/access/PermissionContext'
import { NotificationProvider } from '@/context/NotificationContext'
import ProtectedRoute from '@/access/ProtectedRoute'
import AdminLayout from '@/layouts/AdminLayout'
import Login from '@/auth/pages/Login'
import ForgotPassword from '@/auth/pages/ForgotPassword'
import { useAuthStore } from '@/store/authStore'
import { ROLES } from '@/access/roles'

import { superAdminRoutes } from '@/roles/super-admin/routes'
import { companyAdminRoutes } from '@/roles/company-admin/routes'
import { dispatcherRoutes } from '@/roles/dispatcher/routes'
import { driverManagerRoutes } from '@/roles/driver-manager/routes'
import { customerServiceRoutes } from '@/roles/customer-service/routes'
import { billingRoutes } from '@/roles/billing/routes'
import { accountingRoutes } from '@/roles/accounting/routes'
import { managerRoutes } from '@/roles/manager/routes'
import { readOnlyRoutes } from '@/roles/read-only/routes'
import { reportOnlyRoutes } from '@/roles/report-only/routes'

const ROLE_ROUTE_TABLES = {
  [ROLES.SUPER_ADMIN]: superAdminRoutes,
  [ROLES.COMPANY_ADMIN]: companyAdminRoutes,
  [ROLES.DISPATCHER]: dispatcherRoutes,
  [ROLES.DRIVER_MANAGER]: driverManagerRoutes,
  [ROLES.CUSTOMER_SERVICE]: customerServiceRoutes,
  [ROLES.BILLING]: billingRoutes,
  [ROLES.ACCOUNTING]: accountingRoutes,
  [ROLES.MANAGER]: managerRoutes,
  [ROLES.READ_ONLY]: readOnlyRoutes,
  [ROLES.REPORT_ONLY]: reportOnlyRoutes,
}

function RootRedirect() {
  const { isAuthenticated, role } = useAuthStore()
  if (isAuthenticated && role) return <Navigate to={`/${role}/dashboard`} replace />
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <PermissionProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {Object.entries(ROLE_ROUTE_TABLES).map(([roleSlug, routeTable]) => (
              <Route
                key={roleSlug}
                path={`/${roleSlug}`}
                element={
                  <ProtectedRoute roleSlug={roleSlug}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                {routeTable.map((r) => (
                  <Route key={r.path} path={r.path} element={r.element} />
                ))}
              </Route>
            ))}

            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </NotificationProvider>
      </PermissionProvider>
    </BrowserRouter>
  )
}
