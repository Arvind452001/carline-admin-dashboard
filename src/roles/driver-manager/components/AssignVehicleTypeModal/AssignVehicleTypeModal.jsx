import { useEffect, useState } from 'react'
import { Car, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Modal from '@/shared/components/Modal'
import Button from '@/shared/components/Button'
import Select from '@/shared/components/Select'
import { listVehicleTypes, updateDriverVehicleType } from '../../services/driverManagerApi'

export default function AssignVehicleTypeModal({ open, driver, onClose, onSuccess }) {
  const [vehicleTypes, setVehicleTypes] = useState([])
  const [selectedType, setSelectedType] = useState('')
  const [loadingTypes, setLoadingTypes] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setSuccessMsg(null)
    setSaving(false)

    async function fetchTypes() {
      setLoadingTypes(true)
      try {
        const types = await listVehicleTypes()
        setVehicleTypes(types)
        // Find match with driver's current vehicle type
        const match = types.find(
          (t) =>
            t.id === driver?.vehicleTypeId ||
            t.name.toLowerCase() === (driver?.vehicleType || '').toLowerCase()
        )
        if (match) {
          setSelectedType(match.id)
        } else if (types.length > 0) {
          setSelectedType(types[0].id)
        }
      } catch (err) {
        setError(err.message || 'Could not load vehicle types list.')
      } finally {
        setLoadingTypes(false)
      }
    }

    fetchTypes()
  }, [open, driver])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedType) {
      setError('Please select a vehicle type.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      // Find the chosen vehicle type to send id or name
      const chosen = vehicleTypes.find((t) => t.id === selectedType)
      const vehicleTypeValue = chosen ? (chosen.id || chosen.name) : selectedType

      await updateDriverVehicleType({
        driverId: driver.id,
        vehicleType: vehicleTypeValue,
      })

      setSuccessMsg(`Vehicle type assigned to ${chosen?.name || 'selected class'} successfully!`)
      if (onSuccess) {
        onSuccess(chosen?.name || vehicleTypeValue)
      }
      setTimeout(() => {
        onClose()
      }, 700)
    } catch (err) {
      setError(err.message || 'Failed to update vehicle type.')
    } finally {
      setSaving(false)
    }
  }

  const selectedVehicleDetails = vehicleTypes.find((t) => t.id === selectedType)

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      title={`Assign Vehicle Type - ${driver?.name || 'Driver'}`}
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="assign-vehicle-form" disabled={saving || loadingTypes}>
            {saving ? 'Updating...' : 'Save Vehicle Type'}
          </Button>
        </div>
      }
    >
      <form id="assign-vehicle-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-signal-red/20 bg-signal-red/5 p-3 text-xs text-signal-red">
            <AlertTriangle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600">
            <CheckCircle2 size={15} className="mt-0.5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="rounded-xl border border-border-subtle bg-surface-raised p-3 text-xs space-y-1">
          <div className="flex justify-between text-text-secondary">
            <span>Driver ID:</span>
            <span className="font-semibold text-text-primary">{driver?.id}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Current Vehicle:</span>
            <span className="font-semibold text-text-primary">{driver?.plate || driver?.vehicle || 'Unassigned'}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>Current Vehicle Type:</span>
            <span className="font-semibold text-taxi-500">{driver?.vehicleType || 'None'}</span>
          </div>
        </div>

        <div>
          <Select
            label="Select Vehicle Class"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            disabled={loadingTypes || saving}
            options={
              loadingTypes
                ? [{ value: '', label: 'Loading vehicle types...' }]
                : vehicleTypes.map((t) => ({
                    value: t.id,
                    label: `${t.name} (${t.seats} seats${t.badge ? ` - ${t.badge}` : ''})`,
                  }))
            }
          />
        </div>

        {selectedVehicleDetails && (
          <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface p-3">
            {selectedVehicleDetails.image ? (
              <img
                src={selectedVehicleDetails.image}
                alt={selectedVehicleDetails.name}
                className="h-12 w-16 rounded-lg object-cover border border-border-subtle"
              />
            ) : (
              <div className="flex h-12 w-16 items-center justify-center rounded-lg bg-taxi-500/10 text-taxi-500">
                <Car size={24} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-text-primary text-sm flex items-center gap-2">
                {selectedVehicleDetails.name}
                {selectedVehicleDetails.badge && (
                  <span className="text-[10px] bg-taxi-500/15 text-taxi-600 font-semibold px-2 py-0.5 rounded-full">
                    {selectedVehicleDetails.badge}
                  </span>
                )}
              </p>
              <p className="text-[11px] text-text-muted mt-0.5">
                Seats: {selectedVehicleDetails.seats} | Base: ${selectedVehicleDetails.basePrice} | Rate: ${selectedVehicleDetails.perKmRate}/km
              </p>
            </div>
          </div>
        )}

        <p className="text-[11px] text-text-muted">
          Calls <code>PATCH /api/v1/driver/vehicle-type</code> to assign this vehicle class to the driver.
        </p>
      </form>
    </Modal>
  )
}
