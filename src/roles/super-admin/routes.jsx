import { Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Companies from './pages/Companies'
import CreateCompany from './pages/Companies/CreateCompany'
import CompanyDetails from './pages/Companies/CompanyDetails'
import RolesPermissions from './pages/RolesPermissions'
import CreateRole from './pages/RolesPermissions/CreateRole'
import RoleDetails from './pages/RolesPermissions/RoleDetails'
import Trips from './pages/Trips'
import Drivers from './pages/Drivers'
import DriverDetails from '@/roles/driver-manager/pages/DriverList/DriverDetails'
import Customers from './pages/Customers'
import CustomerDetails from './pages/Customers/CustomerDetails'
import VehicleTypes from './pages/VehicleTypes'
import Pricing from './pages/Pricing'
import ServiceZones from './pages/ServiceZones'
import Payments from './pages/Payments'
import Reports from './pages/Reports'
import Broadcasts from './pages/Broadcasts'
import Notifications from './pages/Notifications'
import IVR from './pages/IVR'
import SMS from './pages/SMS'
import AITraining from './pages/AITraining'
import Settings from './pages/Settings'
import AuditLogs from './pages/AuditLogs'
import Logout from './pages/Logout'

export const superAdminRoutes = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'companies', element: <Companies /> },
  { path: 'companies/create', element: <CreateCompany /> },
  { path: 'companies/:companyId', element: <CompanyDetails /> },
  { path: 'companies/:companyId/edit', element: <CreateCompany /> },
  { path: 'roles-permissions', element: <Navigate to="../roles" replace /> },
  { path: 'roles', element: <RolesPermissions /> },
  { path: 'roles/create', element: <CreateRole /> },
  { path: 'roles/:roleSlug', element: <RoleDetails /> },
  { path: 'trips', element: <Trips /> },
  { path: 'drivers', element: <Drivers /> },
  { path: 'drivers/:driverId', element: <DriverDetails /> },
  { path: 'vehicle-types', element: <VehicleTypes /> },
  { path: 'customers', element: <Customers /> },
  { path: 'customers/:customerId', element: <CustomerDetails /> },
  { path: 'pricing', element: <Pricing /> },
  { path: 'service-zones', element: <ServiceZones /> },
  { path: 'payments', element: <Payments /> },
  { path: 'reports', element: <Reports /> },
  { path: 'broadcasts', element: <Broadcasts /> },
  { path: 'notifications', element: <Notifications /> },
  { path: 'ivr', element: <IVR /> },
  { path: 'sms', element: <SMS /> },
  { path: 'ai-training', element: <AITraining /> },
  { path: 'settings', element: <Settings /> },
  { path: 'audit-logs', element: <AuditLogs /> },
  { path: 'logout', element: <Logout /> },
]
