import Dashboard from './pages/Dashboard'
import DriverList from './pages/DriverList'
import CreateDriver from './pages/DriverList/CreateDriver'
import DriverApplications from './pages/DriverList/DriverApplications'
import DriverDetails from './pages/DriverList/DriverDetails'
import Availability from './pages/Availability'
import Vehicles from './pages/Vehicles'
import Documents from './pages/Documents'
import Performance from './pages/Performance'
import Logout from './pages/Logout'

export const driverManagerRoutes = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'driver-list', element: <DriverList /> },
  { path: 'driver-list/create', element: <CreateDriver /> },
  { path: 'driver-list/applications', element: <DriverApplications /> },
  { path: 'driver-list/:driverId', element: <DriverDetails /> },
  { path: 'driver-profile', element: <DriverList /> }, // Fallback to list or general profile view
  { path: 'availability', element: <Availability /> },
  { path: 'vehicles', element: <Vehicles /> },
  { path: 'documents', element: <Documents /> },
  { path: 'performance', element: <Performance /> },
  { path: 'logout', element: <Logout /> },
]
