import Dashboard from './pages/Dashboard'
import FinancialReports from './pages/FinancialReports'
import Reconciliation from './pages/Reconciliation'
import Payments from './pages/Payments'
import Payouts from './pages/Payouts'
import Revenue from './pages/Revenue'
import Logout from './pages/Logout'

export const accountingRoutes = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'financial-reports', element: <FinancialReports /> },
  { path: 'reconciliation', element: <Reconciliation /> },
  { path: 'payments', element: <Payments /> },
  { path: 'payouts', element: <Payouts /> },
  { path: 'revenue', element: <Revenue /> },
  { path: 'logout', element: <Logout /> },
]
