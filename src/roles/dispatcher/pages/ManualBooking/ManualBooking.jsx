import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowLeft, UserPlus } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Input from '@/shared/components/Input'
import LocationAutocomplete from '@/shared/components/LocationAutocomplete'
import Select from '@/shared/components/Select'
import Button from '@/shared/components/Button'
import Modal from '@/shared/components/Modal'
import { useAuthStore } from '@/store/authStore'

export default function ManualBooking() {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const [customerType] = useState('existing') // 'existing' | 'guest'
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customerOptions, setCustomerOptions] = useState([])
  const [vehicleOptions, setVehicleOptions] = useState([
    { value: 'Sedan', label: 'Standard Sedan' },
    { value: 'SUV', label: 'Premium SUV' },
    { value: 'Hatchback', label: 'Economy Hatch' }
  ])

  // Add Customer Modal State
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: ''
  })
  const [addingCustomer, setAddingCustomer] = useState(false)
  const [addCustomerError, setAddCustomerError] = useState('')

  // Booking Form State
  const [booking, setBooking] = useState({
    customerId: '',
    guestName: '',
    guestPhone: '',
    pickup: '',
    dest: '',
    stops: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    passengers: '2',
    vehicle: 'Sedan',
    paymentMethod: 'UPI',
    dispatchMode: 'Auto' // 'Auto' | 'Manual'
  })

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true)
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://node.aitechnotech.in/carlinee/api/v1'
      const headers = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${baseUrl}/company/customers/same-company`, { headers })
      const json = await res.json()

      const list = json?.data?.customers || (Array.isArray(json?.data) ? json.data : null)
      if (list && list.length > 0) {
        const formatted = list.map((c) => {
          const id = c._id || c.customerId || c.id
          const name = c.name || c.customer || c.fullName || 'Customer'
          const phone = c.phoneNumber || c.phone || c.mobileNumber || ''
          return {
            value: id,
            label: phone ? `${name} (${phone})` : name
          }
        })
        setCustomerOptions(formatted)
        if (formatted[0]?.value) {
          setBooking((prev) => ({ ...prev, customerId: prev.customerId || formatted[0].value }))
        }
      }
    } catch (err) {
      console.warn('Could not load company customers from API:', err)
    } finally {
      setLoadingCustomers(false)
    }
  }

  // Fetch live company customers and vehicle types from backend API
  useEffect(() => {
    async function fetchVehicleTypes() {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://node.aitechnotech.in/carlinee/api/v1'
        const res = await fetch(`${baseUrl}/driver/vehicle-types/all`)
        const json = await res.json()
        const list = Array.isArray(json?.data) ? json.data : null
        if (list && list.length > 0) {
          const formatted = list.map((vt) => ({
            value: vt.name || vt._id,
            label: vt.name + (vt.seats ? ` (${vt.seats} Seats)` : '')
          }))
          setVehicleOptions(formatted)
          if (formatted[0]?.value) {
            setBooking((prev) => ({ ...prev, vehicle: formatted[0].value }))
          }
        }
      } catch (err) {
        console.warn('Could not load vehicle types from API:', err)
      }
    }

    fetchCustomers()
    fetchVehicleTypes()
  }, [token])

  const handleInputChange = (field, val) => {
    setBooking(prev => ({ ...prev, [field]: val }))
  }

  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault()
    if (!newCustomer.firstName.trim() || !newCustomer.phoneNumber.trim()) {
      setAddCustomerError('First name and phone number are required.')
      return
    }

    try {
      setAddingCustomer(true)
      setAddCustomerError('')

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://node.aitechnotech.in/carlinee/api/v1'
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${baseUrl}/company/customers/same-company`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          firstName: newCustomer.firstName.trim(),
          lastName: newCustomer.lastName.trim(),
          phoneNumber: newCustomer.phoneNumber.trim(),
          email: newCustomer.email.trim() || undefined,
        })
      })

      const json = await res.json()
      if (res.ok && json?.statusCode < 400) {
        const addedCust = json?.data?.customer
        const newId = addedCust?._id || addedCust?.id
        const newName = addedCust?.name || addedCust?.customer || `${newCustomer.firstName} ${newCustomer.lastName}`.trim()
        const newPhone = addedCust?.phoneNumber || addedCust?.phone || newCustomer.phoneNumber

        const newOption = {
          value: newId,
          label: `${newName} (${newPhone})`
        }

        setCustomerOptions((prev) => [newOption, ...prev])
        setBooking((prev) => ({ ...prev, customerId: newId }))
        setNewCustomer({ firstName: '', lastName: '', phoneNumber: '', email: '' })
        setShowAddCustomerModal(false)
        await fetchCustomers()
      } else {
        setAddCustomerError(json?.message || 'Failed to add customer')
      }
    } catch (err) {
      console.error('Error creating company customer:', err)
      setAddCustomerError('Network error while adding customer')
    } finally {
      setAddingCustomer(false)
    }
  }

  const handleCreateBooking = async (e) => {
    e.preventDefault()

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://node.aitechnotech.in/carlinee/api/v1'
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const payload = {
        customerType,
        customerId: customerType === 'existing' ? booking.customerId : undefined,
        guestName: customerType === 'guest' ? booking.guestName : undefined,
        guestPhone: customerType === 'guest' ? booking.guestPhone : undefined,
        pickup: typeof booking.pickup === 'object' && booking.pickup?.address ? booking.pickup : {
          address: typeof booking.pickup === 'string' && booking.pickup.trim() ? booking.pickup.trim() : 'Pickup Location',
          latitude: (typeof booking.pickup === 'object' && booking.pickup?.latitude) ? booking.pickup.latitude : undefined,
          longitude: (typeof booking.pickup === 'object' && booking.pickup?.longitude) ? booking.pickup.longitude : undefined
        },
        dropoff: typeof booking.dest === 'object' && booking.dest?.address ? booking.dest : {
          address: typeof booking.dest === 'string' && booking.dest.trim() ? booking.dest.trim() : 'Dropoff Location',
          latitude: (typeof booking.dest === 'object' && booking.dest?.latitude) ? booking.dest.latitude : undefined,
          longitude: (typeof booking.dest === 'object' && booking.dest?.longitude) ? booking.dest.longitude : undefined
        },
        stops: booking.stops,
        date: booking.date,
        time: booking.time,
        passengerCount: parseInt(booking.passengers, 10) || 1,
        vehicleTypeName: booking.vehicle,
        paymentMethod: booking.paymentMethod ? booking.paymentMethod.toUpperCase() : 'CASH',
        dispatchMode: booking.dispatchMode
      }

      const res = await fetch(`${baseUrl}/ride/dispatcher-book`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })

      const json = await res.json()
      if (res.ok && json?.statusCode < 400) {
        navigate('/dispatcher/dispatch-board')
      } else {
        navigate('/dispatcher/dispatch-board')
      }
    } catch (err) {
      console.error('Error submitting booking:', err)
      navigate('/dispatcher/dispatch-board')
    }
  }

  return (
    <PageLayout
      title="Create Manual Booking"
      description="Configure a new ride booking for registered company customers."
      actions={
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/dispatcher/dashboard')}>
          Back
        </Button>
      }
    >
      <form onSubmit={handleCreateBooking} className="space-y-6 max-w-4xl">
        
        {/* Customer Information */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Customer Details</h3>
          
          <div className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 w-full">
              <Select
                label={loadingCustomers ? "Select Customer (Loading...)" : "Select Customer *"}
                value={booking.customerId}
                onChange={(e) => handleInputChange('customerId', e.target.value)}
                options={customerOptions.length > 0 ? customerOptions : [{ value: '', label: 'No registered customers found' }]}
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              icon={UserPlus}
              onClick={() => setShowAddCustomerModal(true)}
              className="whitespace-nowrap"
            >
              + Add New Customer
            </Button>
          </div>
        </div>

        {/* Route Details */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Route Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LocationAutocomplete
              label="Pickup Location *"
              required
              value={booking.pickup}
              placeholder="Search pickup location..."
              onChange={(val) => handleInputChange('pickup', val)}
              onSelectLocation={(locObj) => handleInputChange('pickup', locObj)}
            />
            <LocationAutocomplete
              label="Destination *"
              required
              value={booking.dest}
              placeholder="Search destination..."
              onChange={(val) => handleInputChange('dest', val)}
              onSelectLocation={(locObj) => handleInputChange('dest', locObj)}
            />
            <Input
              label="Additional Stops (Optional)"
              containerClassName="md:col-span-2"
              value={booking.stops}
              onChange={(e) => handleInputChange('stops', e.target.value)}
              placeholder="e.g. Stop 1: MP Nagar, Bhopal"
            />
            <Input
              label="Scheduled Date"
              type="date"
              value={booking.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
            <Input
              label="Scheduled Time"
              type="time"
              value={booking.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
            />
          </div>
        </div>

        {/* Vehicle & Payment Options */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Preferences & Payment</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Vehicle Category"
              value={booking.vehicle}
              onChange={(e) => handleInputChange('vehicle', e.target.value)}
              options={vehicleOptions}
            />
            <Input
              label="Passengers"
              type="number"
              value={booking.passengers}
              onChange={(e) => handleInputChange('passengers', e.target.value)}
            />
            <Select
              label="Payment Method"
              value={booking.paymentMethod}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              options={[
                { value: 'UPI', label: 'UPI QR Pay' },
                { value: 'Card', label: 'Credit/Debit Card' },
                { value: 'Cash', label: 'Cash Payment' }
              ]}
            />
          </div>
        </div>

        {/* Dispatch Settings */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Dispatch Controls</h3>
          <div className="flex gap-6 text-xs font-semibold">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={booking.dispatchMode === 'Auto'}
                onChange={() => handleInputChange('dispatchMode', 'Auto')}
                className="w-4 h-4 text-taxi-500 border-border-strong focus:ring-taxi-500"
              />
              Auto Dispatch (Matching best available driver)
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={booking.dispatchMode === 'Manual'}
                onChange={() => handleInputChange('dispatchMode', 'Manual')}
                className="w-4 h-4 text-taxi-500 border-border-strong focus:ring-taxi-500"
              />
              Manual Assignment (Open Dispatch Board)
            </label>
          </div>
        </div>

        {/* Save actions */}
        <div className="flex items-center gap-3 justify-end pt-4">
          <Button variant="secondary" type="button" onClick={() => navigate('/dispatcher/dashboard')}>
            Cancel
          </Button>
          <Button type="submit" icon={Plus}>
            Create Booking
          </Button>
        </div>

      </form>

      {/* Add Customer Modal */}
      <Modal
        open={showAddCustomerModal}
        onClose={() => setShowAddCustomerModal(false)}
        title="Add New Customer to Company"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddCustomerModal(false)} disabled={addingCustomer}>
              Cancel
            </Button>
            <Button icon={UserPlus} onClick={handleAddCustomerSubmit} disabled={addingCustomer}>
              {addingCustomer ? 'Adding...' : 'Add Customer'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
          {addCustomerError && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-500">
              {addCustomerError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name *"
              required
              value={newCustomer.firstName}
              onChange={(e) => setNewCustomer((prev) => ({ ...prev, firstName: e.target.value }))}
              placeholder="First Name"
            />
            <Input
              label="Last Name"
              value={newCustomer.lastName}
              onChange={(e) => setNewCustomer((prev) => ({ ...prev, lastName: e.target.value }))}
              placeholder="Last Name"
            />
          </div>
          <Input
            label="Phone Number *"
            required
            value={newCustomer.phoneNumber}
            onChange={(e) => setNewCustomer((prev) => ({ ...prev, phoneNumber: e.target.value }))}
            placeholder="+1234567890"
          />
          <Input
            label="Email Address"
            type="email"
            value={newCustomer.email}
            onChange={(e) => setNewCustomer((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="customer@example.com"
          />
        </form>
      </Modal>
    </PageLayout>
  )
}
