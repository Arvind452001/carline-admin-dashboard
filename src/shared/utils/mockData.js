export const mockCompanies = [
  { id: 'c1', name: 'ABC Taxi', city: 'Bhopal', drivers: 62, status: 'active', plan: 'Growth' },
  { id: 'c2', name: 'XYZ Taxi', city: 'Indore', drivers: 41, status: 'active', plan: 'Starter' },
  { id: 'c3', name: 'City Cab', city: 'Mumbai', drivers: 128, status: 'active', plan: 'Enterprise' },
  { id: 'c4', name: 'Metro Rides', city: 'Pune', drivers: 19, status: 'suspended', plan: 'Starter' },
]

const tripCities = ['Airport Rd', 'MP Nagar', 'Habibganj', 'New Market', 'Arera Colony', 'DB Mall']
const statuses = ['pending', 'dispatched', 'ongoing', 'completed', 'cancelled', 'scheduled']

export const mockTrips = Array.from({ length: 24 }).map((_, i) => ({
  id: `TRP-${2400 + i}`,
  customer: ['John Mathew', 'Priya Sharma', 'Aman Verma', 'Sara Khan', 'Rohit Iyer'][i % 5],
  pickup: tripCities[i % tripCities.length],
  dropoff: tripCities[(i + 2) % tripCities.length],
  driver: ['Mike', 'Sarah', 'Alex', 'Rahul', 'Neha', '—'][i % 6],
  fare: 180 + ((i * 37) % 420),
  status: statuses[i % statuses.length],
  time: `${8 + (i % 10)}:${(i * 7) % 60 < 10 ? '0' : ''}${(i * 7) % 60}`,
  company: ['ABC Taxi', 'XYZ Taxi', 'City Cab', 'Metro Rides'][i % 4],
}))

export const mockDrivers = Array.from({ length: 18 }).map((_, i) => {
  const firstName = ['Mike', 'Sarah', 'Alex', 'Rahul', 'Neha', 'Vikram'][i % 6]
  const lastName = ['Johnson', 'Lee', 'Kumar', 'Singh', 'Gupta', 'Rao'][i % 6]
  return {
    id: `DRV-${100 + i}`,
    name: `${firstName} ${lastName}`,
    phone: `+91 97${(20000000 + i * 243).toString().slice(0, 8)}`,
    vehicle: ['Swift Dzire', 'Toyota Etios', 'Hyundai Xcent', 'Wagon R'][i % 4],
    plate: `MP04 T ${1000 + i}`,
    status: ['online', 'offline', 'on-trip', 'suspended'][i % 4],
    rating: (4 + ((i % 10) / 10)).toFixed(1),
    trips: 120 + i * 13,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@abc.com`,
    street: `${45 + i}, Sector B`,
    city: 'Indore',
    zip: '452001',
    emergencyName: `Jane ${lastName}`,
    emergencyPhone: `+91 99${(90000000 - i * 137).toString().slice(0, 8)}`,
    bankName: 'State Bank of India',
    bankAccount: (10098811772 + i * 37).toString(),
    routingNumber: 'SBIN000109'
  }
})

export const mockCustomers = Array.from({ length: 16 }).map((_, i) => {
  const name = ['John Mathew', 'Priya Sharma', 'Aman Verma', 'Sara Khan', 'Rohit Iyer', 'Divya Nair'][i % 6]
  return {
    id: `CUS-${500 + i}`,
    name,
    phone: `+91 98${(10000000 + i * 137).toString().slice(0, 8)}`,
    trips: 4 + i,
    status: i % 7 === 0 ? 'restricted' : 'active',
    lastTrip: `${(i % 27) + 1} Aug 2026`,
    email: `${name.toLowerCase().replace(' ', '')}@gmail.com`,
    joinedDate: `${(i % 27) + 1} Jan 2026`,
    walletBalance: 150 + ((i * 125) % 800),
    preferredPayment: ['UPI', 'Card', 'Cash'][i % 3],
    rating: (4.2 + ((i % 8) / 10)).toFixed(1),
  }
})

export const mockPayments = Array.from({ length: 20 }).map((_, i) => ({
  id: `PAY-${900 + i}`,
  customer: mockCustomers[i % mockCustomers.length].name,
  amount: 150 + ((i * 53) % 500),
  method: ['UPI', 'Card', 'Wallet', 'Cash'][i % 4],
  status: ['success', 'pending', 'failed'][i % 3],
  date: `${(i % 27) + 1} Aug 2026`,
}))

export const mockPayouts = Array.from({ length: 12 }).map((_, i) => ({
  id: `PO-${300 + i}`,
  driver: mockDrivers[i % mockDrivers.length].name,
  amount: 2200 + ((i * 211) % 4000),
  status: ['processed', 'queued', 'held'][i % 3],
  date: `${(i % 27) + 1} Aug 2026`,
}))

export const mockInvoices = Array.from({ length: 10 }).map((_, i) => ({
  id: `INV-${7000 + i}`,
  company: mockCompanies[i % mockCompanies.length].name,
  amount: 12000 + ((i * 900) % 30000),
  status: ['paid', 'due', 'overdue'][i % 3],
  date: `${(i % 27) + 1} Aug 2026`,
}))

export const mockNotifications = [
  {
    id: 1,
    title: 'New Booking Awaiting Dispatch: TRP-BE1E',
    message: 'Passenger RiderPass1 booked a VIP Executive ride from Geeta Bhawan to Navlakha ($55.00).',
    category: 'trip',
    priority: 'high',
    time: '2m ago',
    timestamp: '2026-10-19T11:48:00.000Z',
    read: false,
    link: '/dispatcher/pending-trips',
    refId: 'TRP-BE1E',
  },
  {
    id: 2,
    title: 'Driver Accepted Live Trip: TRP-26B0',
    message: 'Driver Pratik Shukla accepted ride and is en route to pickup point (~15 mins ETA).',
    category: 'driver',
    priority: 'normal',
    time: '8m ago',
    timestamp: '2026-10-19T11:42:00.000Z',
    read: false,
    link: '/dispatcher/live-trips',
    refId: 'TRP-26B0',
  },
  {
    id: 3,
    title: 'Trip Cancelled by Passenger: TRP-2411',
    message: 'Passenger cancelled booking after 4 mins. Auto-cancellation fee of $5.00 assessed.',
    category: 'alert',
    priority: 'urgent',
    time: '18m ago',
    timestamp: '2026-10-19T11:32:00.000Z',
    read: false,
    link: '/dispatcher/cancelled-trips',
    refId: 'TRP-2411',
  },
  {
    id: 4,
    title: 'Fleet Driver Online: Amit Verma',
    message: 'Driver went online in Indore Central with VIP Executive vehicle (Plate: 12345673).',
    category: 'driver',
    priority: 'normal',
    time: '35m ago',
    timestamp: '2026-10-19T11:15:00.000Z',
    read: true,
    link: '/dispatcher/drivers',
    refId: 'DRV-102',
  },
  {
    id: 5,
    title: 'Scheduled Ride Upcoming: TRP-9021',
    message: 'Scheduled trip for 02:30 PM is ready for dispatch matching in 45 minutes.',
    category: 'trip',
    priority: 'normal',
    time: '1h ago',
    timestamp: '2026-10-19T10:50:00.000Z',
    read: true,
    link: '/dispatcher/scheduled-trips',
    refId: 'TRP-9021',
  },
  {
    id: 6,
    title: 'Automated Dispatch Queue Batch Processed',
    message: '14 pending bookings were successfully auto-assigned to nearest online drivers with 0 delays.',
    category: 'system',
    priority: 'info',
    time: '2h ago',
    timestamp: '2026-10-19T09:45:00.000Z',
    read: true,
    link: '/dispatcher/dispatch-board',
    refId: 'SYS-BATCH-401',
  },
  {
    id: 7,
    title: 'Driver Document Expiring Soon: Rajesh Kumar',
    message: 'Commercial driving permit expires in 7 days. Driver notified for document renewal.',
    category: 'driver',
    priority: 'high',
    time: '3h ago',
    timestamp: '2026-10-19T08:30:00.000Z',
    read: true,
    link: '/dispatcher/drivers',
    refId: 'DOC-551',
  },
  {
    id: 8,
    title: 'Daily Fleet GMV Reconciliation: #PO-308',
    message: 'Daily gross merchant volume batch completed: $819.00 reconciled successfully.',
    category: 'payment',
    priority: 'info',
    time: '4h ago',
    timestamp: '2026-10-19T07:15:00.000Z',
    read: true,
    link: '/dispatcher/completed-trips',
    refId: 'PO-308',
  },
]

export const mockAuditLogs = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  actor: ['super.admin@Carline.com', 'admin@abctaxi.com', 'dispatch1@abctaxi.com'][i % 3],
  action: ['Updated pricing rule', 'Suspended driver DRV-104', 'Created broadcast', 'Changed role permissions'][i % 4],
  time: `${(i % 12) + 1}h ago`,
}))

export function kpiTrend(seed) {
  return Array.from({ length: 7 }).map((_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    value: 30 + ((seed + i * 17) % 70),
  }))
}
