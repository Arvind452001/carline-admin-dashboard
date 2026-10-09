import Dashboard from './pages/Dashboard'
import CustomerList from './pages/CustomerList'
import CustomerProfile from './pages/CustomerProfile'
import Notes from './pages/Notes'
import Restrictions from './pages/Restrictions'
import TripHistory from './pages/TripHistory'
import BookingDetails from './pages/BookingDetails'
import Support from './pages/Support'
import Logout from './pages/Logout'

export const customerServiceRoutes = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'customer-list', element: <CustomerList /> },
  { path: 'customer-profile', element: <CustomerProfile /> },
  { path: 'notes', element: <Notes /> },
  { path: 'restrictions', element: <Restrictions /> },
  { path: 'trip-history', element: <TripHistory /> },
  { path: 'booking-details', element: <BookingDetails /> },
  { path: 'support', element: <Support /> },
  { path: 'logout', element: <Logout /> },
]
