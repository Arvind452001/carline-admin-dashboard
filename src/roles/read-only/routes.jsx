import Dashboard from './pages/Dashboard'
import Trips from './pages/Trips'
import Drivers from './pages/Drivers'
import Customers from './pages/Customers'
import Payments from './pages/Payments'
import Reports from './pages/Reports'
import Logout from './pages/Logout'

export const readOnlyRoutes = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'trips', element: <Trips /> },
  { path: 'drivers', element: <Drivers /> },
  { path: 'customers', element: <Customers /> },
  { path: 'payments', element: <Payments /> },
  { path: 'reports', element: <Reports /> },
  { path: 'logout', element: <Logout /> },
]
