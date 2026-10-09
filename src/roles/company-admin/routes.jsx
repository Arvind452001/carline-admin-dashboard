import Dashboard from './pages/Dashboard'
import Trips from './pages/Trips'
import TripDetails from './pages/Trips/TripDetails'
import Drivers from './pages/Drivers'
import DriverDetails from '@/roles/driver-manager/pages/DriverList/DriverDetails'
import Customers from './pages/Customers'
import CustomerDetails from '@/roles/super-admin/pages/Customers/CustomerDetails'
import Pricing from './pages/Pricing'
import Areas from './pages/Areas'
import Zones from './pages/Zones'
import Maps from './pages/Maps'
import Payments from './pages/Payments'
import Payouts from './pages/Payouts'
import Invoices from './pages/Invoices'
import Reports from './pages/Reports'
import Analytics from './pages/Analytics'
import Broadcasts from './pages/Broadcasts'
import Notifications from './pages/Notifications'
import IVR from './pages/IVR'
import SMS from './pages/SMS'
import AITraining from './pages/AITraining'
import Users from './pages/Users'
import NewUser from './pages/Users/NewUser'
import RolesPermissions from './pages/RolesPermissions'
import Settings from './pages/Settings'
import AuditLogs from './pages/AuditLogs'
import Logout from './pages/Logout'

export const companyAdminRoutes = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'trips', element: <Trips /> },
  { path: 'trips/:tripId', element: <TripDetails /> },
  { path: 'drivers', element: <Drivers /> },
  { path: 'drivers/:driverId', element: <DriverDetails /> },
  { path: 'customers', element: <Customers /> },
  { path: 'customers/:customerId', element: <CustomerDetails /> },
  { path: 'pricing', element: <Pricing /> },
  { path: 'areas', element: <Areas /> },
  { path: 'zones', element: <Zones /> },
  { path: 'maps', element: <Maps /> },
  { path: 'payments', element: <Payments /> },
  { path: 'payouts', element: <Payouts /> },
  { path: 'invoices', element: <Invoices /> },
  { path: 'reports', element: <Reports /> },
  { path: 'analytics', element: <Analytics /> },
  { path: 'broadcasts', element: <Broadcasts /> },
  { path: 'notifications', element: <Notifications /> },
  { path: 'ivr', element: <IVR /> },
  { path: 'sms', element: <SMS /> },
  { path: 'ai-training', element: <AITraining /> },
  { path: 'users', element: <Users /> },
  { path: 'users/new', element: <NewUser /> },
  { path: 'users/:userId/edit', element: <NewUser /> },
  { path: 'roles-permissions', element: <RolesPermissions /> },
  { path: 'settings', element: <Settings /> },
  { path: 'audit-logs', element: <AuditLogs /> },
  { path: 'logout', element: <Logout /> },
]
