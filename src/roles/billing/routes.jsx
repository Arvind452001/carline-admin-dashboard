import Dashboard from './pages/Dashboard'
import Payments from './pages/Payments'
import Payouts from './pages/Payouts'
import Invoices from './pages/Invoices'
import PaymentDetails from './pages/PaymentDetails'
import PayoutDetails from './pages/PayoutDetails'
import Logout from './pages/Logout'

export const billingRoutes = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'payments', element: <Payments /> },
  { path: 'payouts', element: <Payouts /> },
  { path: 'invoices', element: <Invoices /> },
  { path: 'payment-details', element: <PaymentDetails /> },
  { path: 'payout-details', element: <PayoutDetails /> },
  { path: 'logout', element: <Logout /> },
]
