import Dashboard from './pages/Dashboard'
import LiveTrips from './pages/LiveTrips'
import PendingTrips from './pages/PendingTrips'
import ScheduledTrips from './pages/ScheduledTrips'
import CompletedTrips from './pages/CompletedTrips'
import CancelledTrips from './pages/CancelledTrips'
import ManualBooking from './pages/ManualBooking'
import DispatchBoard from './pages/DispatchBoard'
import TripDetails from './pages/TripDetails'
import Customers from './pages/Customers'
import Maps from './pages/Maps'
import Notifications from './pages/Notifications'
import Broadcasts from './pages/Broadcasts'
import Logout from './pages/Logout'

export const dispatcherRoutes = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'live-trips', element: <LiveTrips /> },
  { path: 'pending-trips', element: <PendingTrips /> },
  { path: 'scheduled-trips', element: <ScheduledTrips /> },
  { path: 'completed-trips', element: <CompletedTrips /> },
  { path: 'cancelled-trips', element: <CancelledTrips /> },
  { path: 'manual-booking', element: <ManualBooking /> },
  { path: 'dispatch-board', element: <DispatchBoard /> },
  { path: 'trip-details', element: <TripDetails /> },
  { path: 'customers', element: <Customers /> },
  { path: 'maps', element: <Maps /> },
  { path: 'notifications', element: <Notifications /> },
  { path: 'broadcasts', element: <Broadcasts /> },
  { path: 'logout', element: <Logout /> },
]
