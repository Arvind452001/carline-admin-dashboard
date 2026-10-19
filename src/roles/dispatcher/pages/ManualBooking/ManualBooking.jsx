import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowLeft, AlertCircle } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Button from '@/shared/components/Button'
import { useAuthStore } from '@/store/authStore'
import { dispatcherApi } from '../../services/dispatcherApi'

export default function ManualBooking() {
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const authUser = useAuthStore((s) => s.user)

  // Booking Type: 'existing' | 'guest'
  const [customerType, setCustomerType] = useState('existing')
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [customersList, setCustomersList] = useState([])
  const [customerOptions, setCustomerOptions] = useState([])

  // Available Vehicle Types
  const [vehicleTypesList, setVehicleTypesList] = useState([])
  const [vehicleOptions, setVehicleOptions] = useState([
    { value: 'Sedan', label: 'Standard Sedan' },
    { value: 'SUV', label: 'Premium SUV' },
    { value: 'Hatchback', label: 'Economy Hatch' }
  ])

  // Form Submission Status
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Booking Form State matching lower UI
  const [booking, setBooking] = useState({
    customerId: '',
    userId: '',
    guestName: '',
    guestPhone: '',
    passengerFirstName: '',
    passengerLastName: '',
    passengerPhone: '',
    passengerEmail: '',
    pickup: '',
    dest: '',
    stops: '',
    date: new Date().toISOString().split('T')[0],
    time: '12:00 PM',
    passengers: '2',
    vehicle: 'Sedan',
    vehicleTypeId: '',
    vehicleTypeName: 'Sedan',
    paymentMethod: 'UPI',
    dispatchMode: 'Auto' // 'Auto' | 'Manual'
  })

  // 1. Fetch Registered Customers from API
  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true)
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://node.aitechnotech.in/carlinee/api/v1'
      const headers = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${baseUrl}/company/customers/same-company`, { headers })
      const json = await res.json()

      const list = json?.data?.customers || (Array.isArray(json?.data) ? json.data : null)
      if (list && list.length > 0) {
        setCustomersList(list)
        const formatted = list.map((c) => {
          const id = String(c._id || c.customerId || c.id)
          const fName = c.firstName || c.name?.split(' ')[0] || ''
          const lName = c.lastName || c.name?.split(' ').slice(1).join(' ') || ''
          const fullName = c.name || `${fName} ${lName}`.trim() || 'Customer'
          const phone = c.phoneNumber || c.phone || c.mobileNumber || ''
          return {
            value: id,
            label: phone ? `${fullName} (${phone})` : fullName
          }
        })
        setCustomerOptions(formatted)

        // Select first customer if none chosen
        const first = list[0]
        const fId = String(first._id || first.customerId || first.id)
        const fName = first.firstName || first.name?.split(' ')[0] || ''
        const lName = first.lastName || first.name?.split(' ').slice(1).join(' ') || ''
        const fullName = first.name || `${fName} ${lName}`.trim() || 'Customer'
        const phone = first.phoneNumber || first.phone || first.mobileNumber || ''
        const email = first.email || ''

        setBooking((prev) => ({
          ...prev,
          customerId: prev.customerId || fId,
          userId: prev.userId || first.userId || fId,
          passengerFirstName: prev.passengerFirstName || fName,
          passengerLastName: prev.passengerLastName || lName,
          guestName: prev.guestName || fullName,
          passengerPhone: prev.passengerPhone || phone,
          guestPhone: prev.guestPhone || phone,
          passengerEmail: prev.passengerEmail || email
        }))
      }
    } catch (err) {
      console.warn('Could not load company customers from API:', err)
    } finally {
      setLoadingCustomers(false)
    }
  }

  // 2. Fetch Vehicle Types from API
  const fetchVehicleTypes = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://node.aitechnotech.in/carlinee/api/v1'
      const res = await fetch(`${baseUrl}/driver/vehicle-types/all`)
      const json = await res.json()
      const list = Array.isArray(json?.data) ? json.data : null
      if (list && list.length > 0) {
        setVehicleTypesList(list)
        const formatted = list.map((vt) => ({
          value: vt.name,
          label: vt.name + (vt.seats ? ` (${vt.seats} Seats)` : ''),
          id: vt._id || vt.id,
          name: vt.name
        }))
        setVehicleOptions(formatted)

        if (formatted[0]) {
          setBooking((prev) => ({
            ...prev,
            vehicle: prev.vehicle || formatted[0].value,
            vehicleTypeId: prev.vehicleTypeId || formatted[0].id,
            vehicleTypeName: prev.vehicleTypeName || formatted[0].name
          }))
        }
      }
    } catch (err) {
      console.warn('Could not load vehicle types from API:', err)
    }
  }

  useEffect(() => {
    fetchCustomers()
    fetchVehicleTypes()
  }, [token])

  // Handle Customer Selection
  const handleCustomerSelect = (custId) => {
    const selected = customersList.find((c) => String(c._id || c.customerId || c.id) === String(custId))
    if (selected) {
      const fName = selected.firstName || selected.name?.split(' ')[0] || ''
      const lName = selected.lastName || selected.name?.split(' ').slice(1).join(' ') || ''
      const fullName = selected.name || `${fName} ${lName}`.trim() || 'Customer'
      const phone = selected.phoneNumber || selected.phone || selected.mobileNumber || ''
      const email = selected.email || ''

      setBooking((prev) => ({
        ...prev,
        customerId: custId,
        userId: selected.userId || custId,
        passengerFirstName: fName,
        passengerLastName: lName,
        guestName: fullName,
        passengerPhone: phone,
        guestPhone: phone,
        passengerEmail: email
      }))
    } else {
      setBooking((prev) => ({ ...prev, customerId: custId }))
    }
  }

  // Handle Vehicle Selection
  const handleVehicleSelect = (val) => {
    const found = vehicleTypesList.find((vt) => vt.name === val || (vt._id || vt.id) === val)
    setBooking((prev) => ({
      ...prev,
      vehicle: val,
      vehicleTypeId: found ? (found._id || found.id) : prev.vehicleTypeId,
      vehicleTypeName: found ? found.name : val
    }))
  }

  const handleInputChange = (field, val) => {
    setBooking((prev) => ({ ...prev, [field]: val }))
  }

  // Create Manual Booking via API
  const handleCreateBooking = async (e) => {
    e.preventDefault()
    setSubmitError('')

    const pickupAddress = (booking.pickup || '').trim()
    const dropoffAddress = (booking.dest || '').trim()

    if (!pickupAddress) {
      setSubmitError('Pickup location is required.')
      return
    }
    if (!dropoffAddress) {
      setSubmitError('Destination is required.')
      return
    }

    const isGuest = customerType === 'guest'
    let fullName = ''
    let firstName = ''
    let lastName = ''
    let phone = ''
    let email = ''

    if (isGuest) {
      fullName = (booking.guestName || '').trim()
      phone = (booking.guestPhone || '').trim()

      if (!fullName) {
        setSubmitError('Guest Name is required.')
        return
      }
      if (!phone) {
        setSubmitError('Guest Phone is required.')
        return
      }

      const parts = fullName.split(' ')
      firstName = parts[0] || 'Guest'
      lastName = parts.slice(1).join(' ') || ''
    } else {
      if (!booking.customerId) {
        setSubmitError('Please select a customer or switch to Guest Customer.')
        return
      }
      const selectedCust = customersList.find(
        (c) => String(c._id || c.customerId || c.id) === String(booking.customerId)
      )
      firstName = selectedCust?.firstName || booking.passengerFirstName || ''
      lastName = selectedCust?.lastName || booking.passengerLastName || ''
      fullName = selectedCust?.name || `${firstName} ${lastName}`.trim() || booking.guestName || 'Customer'
      phone = selectedCust?.phoneNumber || selectedCust?.phone || booking.guestPhone || ''
      email = selectedCust?.email || booking.passengerEmail || ''
    }

    try {
      setSubmitting(true)

      const pickupObj = {
        address: pickupAddress,
        latitude: 0,
        longitude: 0
      }

      const dropoffObj = {
        address: dropoffAddress,
        latitude: 0,
        longitude: 0
      }

      let scheduledAt = ''
      if (booking.date && booking.time) {
        try {
          const parsed = new Date(`${booking.date} ${booking.time}`)
          if (!isNaN(parsed.getTime())) {
            scheduledAt = parsed.toISOString()
          } else {
            scheduledAt = new Date(`${booking.date}T${booking.time}`).toISOString()
          }
        } catch {
          scheduledAt = `${booking.date} ${booking.time}`
        }
      } else {
        scheduledAt = new Date().toISOString()
      }

      const passengerCountNum = parseInt(booking.passengers, 10) || 1

      const matchedVt = vehicleTypesList.find(
        (vt) => vt.name === booking.vehicle || (vt._id || vt.id) === booking.vehicleTypeId
      )
      const vehicleTypeId = matchedVt?._id || matchedVt?.id || booking.vehicleTypeId || ''
      const vehicleName = matchedVt?.name || booking.vehicle || 'Sedan'

      const payload = {
        userId: isGuest ? '' : String(booking.userId || booking.customerId || ''),
        customerId: isGuest ? '' : String(booking.customerId || ''),
        customerType: isGuest ? 'GUEST' : 'REGISTERED',
        guestName: fullName,
        passengerFirstName: firstName,
        passengerLastName: lastName,
        guestPhone: phone,
        passengerPhone: phone,
        passengerEmail: email,
        pickup: pickupObj,
        dropoff: dropoffObj,
        dest: dropoffObj,
        vehicleTypeId: vehicleTypeId,
        vehicle: vehicleName,
        vehicleTypeName: vehicleName,
        passengerCount: passengerCountNum,
        passengers: passengerCountNum,
        rideType: 'SCHEDULED',
        scheduledAt: scheduledAt,
        date: booking.date,
        time: booking.time,
        paymentMethod: (booking.paymentMethod || 'UPI').toUpperCase(),
        notes: (booking.stops ? `Stops: ${booking.stops}` : '').trim(),
        stops: (booking.stops || '').trim(),
        dispatchMode: (booking.dispatchMode || 'Auto').toUpperCase(),
        promoCode: '',
        driverId: '',
        companyId: String(authUser?.companyId || authUser?.company?._id || authUser?.company || '')
      }

      console.log('Sending Manual Booking payload:', payload)
      await dispatcherApi.bookTrip(payload)
      navigate('/dispatcher/dispatch-board')
    } catch (err) {
      console.error('Error submitting booking:', err)
      setSubmitError(err?.message || 'Failed to create booking. Please check required fields.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageLayout
      title="Create Manual Booking"
      description="Configure a new ride booking for corporate customers or guest walk-ins."
      actions={
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/dispatcher/dashboard')}>
          Back
        </Button>
      }
    >
      {submitError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{submitError}</span>
          </div>
          <button type="button" onClick={() => setSubmitError('')} className="font-bold hover:text-red-400">✕</button>
        </div>
      )}

      <form onSubmit={handleCreateBooking} className="space-y-6 max-w-4xl">
        
        {/* Customer Information */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Customer Details</h3>
          
          <div className="flex gap-4 text-xs font-semibold pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={customerType === 'existing'}
                onChange={() => setCustomerType('existing')}
                className="w-4 h-4 text-taxi-500 border-border-strong focus:ring-taxi-500"
              />
              Existing Platform Customer
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={customerType === 'guest'}
                onChange={() => setCustomerType('guest')}
                className="w-4 h-4 text-taxi-500 border-border-strong focus:ring-taxi-500"
              />
              Guest Customer (Walk-in)
            </label>
          </div>

          {customerType === 'existing' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={loadingCustomers ? 'Select Customer (Loading...)' : 'Select Customer *'}
                value={booking.customerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                options={customerOptions.length > 0 ? customerOptions : [{ value: '', label: 'No registered customers found' }]}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Guest Name *"
                required
                value={booking.guestName}
                onChange={(e) => handleInputChange('guestName', e.target.value)}
                placeholder="Full Name"
              />
              <Input
                label="Guest Phone *"
                required
                value={booking.guestPhone}
                onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                placeholder="+1 XXX XXX XXXX"
              />
            </div>
          )}
        </div>

        {/* Route Details */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Route Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Pickup Location *"
              required
              value={booking.pickup}
              onChange={(e) => handleInputChange('pickup', e.target.value)}
              placeholder="e.g. Airport Terminal 1"
            />
            <Input
              label="Destination *"
              required
              value={booking.dest}
              onChange={(e) => handleInputChange('dest', e.target.value)}
              placeholder="e.g. Downtown Hotel"
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
              value={booking.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              placeholder="e.g. 12:00 PM"
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
              onChange={(e) => handleVehicleSelect(e.target.value)}
              options={vehicleOptions}
            />
            <Input
              label="Passengers"
              type="number"
              min="1"
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
          <Button
            variant="secondary"
            type="button"
            disabled={submitting}
            onClick={() => navigate('/dispatcher/dashboard')}
          >
            Cancel
          </Button>
          <Button type="submit" icon={Plus} disabled={submitting}>
            {submitting ? 'Creating Booking...' : 'Create Booking'}
          </Button>
        </div>

      </form>
    </PageLayout>
  )
}
