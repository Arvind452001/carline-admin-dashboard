import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import Analytics from './pages/Analytics'
import ReportHistory from './pages/ReportHistory'
import ReportSettings from './pages/ReportSettings'
import Logout from './pages/Logout'

export const reportOnlyRoutes = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'reports', element: <Reports /> },
  { path: 'analytics', element: <Analytics /> },
  { path: 'report-history', element: <ReportHistory /> },
  { path: 'report-settings', element: <ReportSettings /> },
  { path: 'logout', element: <Logout /> },
]
