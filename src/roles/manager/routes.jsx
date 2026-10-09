import Dashboard from './pages/Dashboard'
import Trips from './pages/Trips'
import Drivers from './pages/Drivers'
import Customers from './pages/Customers'
import Reports from './pages/Reports'
import Analytics from './pages/Analytics'
import Performance from './pages/Performance'
import Logout from './pages/Logout'

export const managerRoutes = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'trips', element: <Trips /> },
  { path: 'drivers', element: <Drivers /> },
  { path: 'customers', element: <Customers /> },
  { path: 'reports', element: <Reports /> },
  { path: 'analytics', element: <Analytics /> },
  { path: 'performance', element: <Performance /> },
  { path: 'logout', element: <Logout /> },
]
