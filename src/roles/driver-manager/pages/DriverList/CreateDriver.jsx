import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Upload } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Button from '@/shared/components/Button'

export default function CreateDriver() {
  const navigate = useNavigate()

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    emergencyName: '',
    emergencyPhone: '',
    licenseNumber: '',
    licenseClass: 'Class A',
    licenseExpiry: '',
    company: 'ABC Taxi',
    vehicleId: '',
    priority: 'Normal',
    bankName: '',
    bankAccount: '',
    routingNumber: '',
    availability: 'Available',
    
    // Restrictions checkboxes
    restrictAirport: false,
    restrictLongDistance: false,
    restrictVIP: false,
    restrictCertainVehicles: false,

    // Schedule
    scheduleMon: '08:00 - 18:00',
    scheduleTue: '08:00 - 18:00',
    scheduleWed: '08:00 - 18:00',
    scheduleThu: '08:00 - 18:00',
    scheduleFri: '08:00 - 18:00',
    scheduleSat: '',
    scheduleSun: '',
  })

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    // Simulated Save
    navigate('/driver-manager/driver-list')
  }

  return (
    <PageLayout
      title="Add Driver"
      description="Register a new driver, set company affiliation, vehicle assignments, schedules, and priorities."
      actions={
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/driver-manager/driver-list')}>
          Back to List
        </Button>
      }
    >
      <form onSubmit={handleSave} className="space-y-6 max-w-5xl">
        
        {/* Section A — Personal & Contact */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-text-primary border-b border-border-subtle pb-2">
            Personal & Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="First Name *"
              required
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="First Name"
            />
            <Input
              label="Last Name *"
              required
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Last Name"
            />
            <Input
              label="Email Address *"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="driver@company.com"
            />
            <Input
              label="Phone Number *"
              required
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+91 9999999999"
            />
          </div>
        </div>

        {/* Section B — Address & Emergency */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-text-primary border-b border-border-subtle pb-2">
            Address & Emergency Contacts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Street Address *"
              required
              value={formData.street}
              onChange={(e) => handleInputChange('street', e.target.value)}
              placeholder="Street"
            />
            <Input
              label="City *"
              required
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Indore"
            />
            <Input
              label="ZIP Code *"
              required
              value={formData.zip}
              onChange={(e) => handleInputChange('zip', e.target.value)}
              placeholder="452001"
            />
            <Input
              label="Emergency Contact Name *"
              required
              value={formData.emergencyName}
              onChange={(e) => handleInputChange('emergencyName', e.target.value)}
              placeholder="Emergency Contact Name"
            />
            <Input
              label="Emergency Phone *"
              required
              value={formData.emergencyPhone}
              onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
              placeholder="+91 9888888888"
            />
          </div>
        </div>

        {/* Section C — Driving License */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-text-primary border-b border-border-subtle pb-2">
            Driving License
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="License Number *"
              required
              value={formData.licenseNumber}
              onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
              placeholder="DL-88220019"
            />
            <Select
              label="License Class"
              value={formData.licenseClass}
              onChange={(e) => handleInputChange('licenseClass', e.target.value)}
              options={[
                { value: 'Class A', label: 'Class A (Commercial)' },
                { value: 'Class B', label: 'Class B (Heavy vehicle)' },
                { value: 'Class C', label: 'Class C (Standard Passenger)' }
              ]}
            />
            <Input
              label="Expiry Date *"
              type="date"
              required
              value={formData.licenseExpiry}
              onChange={(e) => handleInputChange('licenseExpiry', e.target.value)}
            />
          </div>
        </div>

        {/* Section D — Vehicle Assignment */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-text-primary border-b border-border-subtle pb-2">
            Vehicle Configuration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Vehicle Assignment"
              value={formData.vehicleId}
              onChange={(e) => handleInputChange('vehicleId', e.target.value)}
              options={[
                { value: '', label: 'None (Unassigned)' },
                { value: 'Toyota Camry', label: 'Toyota Camry (ABC-123)' },
                { value: 'Hyundai Sonata', label: 'Hyundai Sonata (XYZ-998)' }
              ]}
            />
            <Select
              label="Default Availability"
              value={formData.availability}
              onChange={(e) => handleInputChange('availability', e.target.value)}
              options={[
                { value: 'Available', label: 'Available' },
                { value: 'Offline', label: 'Offline (Off Duty)' }
              ]}
            />
            <Select
              label="Dispatch Priority"
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              options={[
                { value: 'High', label: 'High Priority' },
                { value: 'Normal', label: 'Normal' },
                { value: 'Low', label: 'Low' }
              ]}
            />
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-xs font-medium text-text-secondary block">Restrictions</span>
            <div className="flex flex-wrap gap-4 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={formData.restrictAirport}
                  onChange={(e) => handleInputChange('restrictAirport', e.target.checked)}
                  className="w-4 h-4 rounded text-taxi-500 border-border-strong focus:ring-taxi-500"
                />
                Airport Trips Restricted
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={formData.restrictLongDistance}
                  onChange={(e) => handleInputChange('restrictLongDistance', e.target.checked)}
                  className="w-4 h-4 rounded text-taxi-500 border-border-strong focus:ring-taxi-500"
                />
                Long Distance Restricted
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={formData.restrictVIP}
                  onChange={(e) => handleInputChange('restrictVIP', e.target.checked)}
                  className="w-4 h-4 rounded text-taxi-500 border-border-strong focus:ring-taxi-500"
                />
                VIP Trips Restricted
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={formData.restrictCertainVehicles}
                  onChange={(e) => handleInputChange('restrictCertainVehicles', e.target.checked)}
                  className="w-4 h-4 rounded text-taxi-500 border-border-strong focus:ring-taxi-500"
                />
                Certain Vehicle Types Restricted
              </label>
            </div>
          </div>
        </div>

        {/* Section E — Working Schedule */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-text-primary border-b border-border-subtle pb-2">
            Working Schedule
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <Input
                key={day}
                label={`${day} Hours`}
                value={formData[`schedule${day}`]}
                onChange={(e) => handleInputChange(`schedule${day}`, e.target.value)}
                placeholder="e.g. 08:00 - 18:00"
              />
            ))}
          </div>
        </div>

        {/* Section F — Payout & Schedule */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-text-primary border-b border-border-subtle pb-2">
            Payout Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Bank Name"
              value={formData.bankName}
              onChange={(e) => handleInputChange('bankName', e.target.value)}
              placeholder="e.g. State Bank of India"
            />
            <Input
              label="Account Number"
              value={formData.bankAccount}
              onChange={(e) => handleInputChange('bankAccount', e.target.value)}
              placeholder="e.g. 10098811772"
            />
            <Input
              label="IFSC / Routing Code"
              value={formData.routingNumber}
              onChange={(e) => handleInputChange('routingNumber', e.target.value)}
              placeholder="e.g. SBIN000109"
            />
          </div>
        </div>

        {/* Document uploads */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-text-primary border-b border-border-subtle pb-2">
            Document Uploads
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-text-secondary">Driving License Copy (PDF/JPG)</span>
              <div className="flex items-center gap-3 border border-dashed border-border-strong bg-surface p-2.5 rounded-xl cursor-pointer hover:bg-surface-hover transition-colors">
                <Upload size={16} className="text-taxi-500" />
                <span className="text-xs text-text-secondary">Click to upload license copy</span>
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-text-secondary">Vehicle Insurance Proof</span>
              <div className="flex items-center gap-3 border border-dashed border-border-strong bg-surface p-2.5 rounded-xl cursor-pointer hover:bg-surface-hover transition-colors">
                <Upload size={16} className="text-taxi-500" />
                <span className="text-xs text-text-secondary">Click to upload insurance copy</span>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center gap-3 justify-end pt-4">
          <Button variant="secondary" type="button" onClick={() => navigate('/driver-manager/driver-list')}>
            Cancel
          </Button>
          <Button type="submit" icon={Save}>
            Save Driver Profile
          </Button>
        </div>

      </form>
    </PageLayout>
  )
}
