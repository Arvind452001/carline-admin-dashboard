import { useEffect, useState } from 'react'
import { Upload, X } from 'lucide-react'
import Modal from '@/shared/components/Modal'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import {
  VEHICLE_TYPE_STATUS_OPTIONS,
  createVehicleType,
  updateVehicleType,
} from '@/roles/super-admin/services/vehicleTypeApi'

const EMPTY_FORM = {
  id: '',
  name: '',
  seats: '',
  basePrice: '',
  badge: '',
  etaText: '',
  perKmRate: '',
  perMinuteRate: '',
  sortOrder: '',
  description: '',
  status: 'Active',
  imageUrl: '',
}

// Optional numbers arrive from the API as null, which the inputs show as empty.
const asField = (value) => (value === null || value === undefined ? '' : String(value))

function toForm(vehicleType) {
  if (!vehicleType) return EMPTY_FORM
  return {
    id: vehicleType.id,
    name: vehicleType.name,
    seats: asField(vehicleType.seats),
    basePrice: asField(vehicleType.basePrice),
    badge: vehicleType.badge,
    etaText: vehicleType.etaText,
    perKmRate: asField(vehicleType.perKmRate),
    perMinuteRate: asField(vehicleType.perMinuteRate),
    sortOrder: asField(vehicleType.sortOrder),
    description: vehicleType.description,
    status: vehicleType.status,
    imageUrl: vehicleType.image,
  }
}

export default function VehicleTypeFormModal({ open, vehicleType, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFile, setImageFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const editing = Boolean(form.id)

  useEffect(() => {
    if (!open) return
    setForm(toForm(vehicleType))
    setImageFile(null)
    setPreview('')
    setError(null)
  }, [open, vehicleType])

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function pickImage(file) {
    setImageFile(file || null)
    if (!file) {
      setPreview('')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setPreview(String(reader.result || ''))
    reader.readAsDataURL(file)
  }

  function clearImage() {
    setImageFile(null)
    setPreview('')
    setField('imageUrl', '')
  }

  async function submit(event) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const values = { ...form, imageFile }
      if (editing) await updateVehicleType(values)
      else await createVehicleType(values)
      onSaved(editing ? 'Vehicle type updated.' : 'Vehicle type created.')
    } catch (err) {
      setError(err.message || 'Could not save this vehicle type.')
    } finally {
      setSaving(false)
    }
  }

  const imageSrc = preview || form.imageUrl

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      title={editing ? 'Edit vehicle type' : 'Add vehicle type'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="vehicle-type-form" disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Save changes' : 'Create'}
          </Button>
        </>
      }
    >
      <form id="vehicle-type-form" onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-signal-red/20 bg-signal-red/5 px-3 py-2 text-xs text-signal-red">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Vehicle class name *"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="Sedan Comfort"
          />
          <Input
            label="Seats *"
            type="number"
            min="1"
            value={form.seats}
            onChange={(e) => setField('seats', e.target.value)}
            placeholder="4"
          />
          <Input
            label="Base price *"
            type="number"
            step="0.01"
            value={form.basePrice}
            onChange={(e) => setField('basePrice', e.target.value)}
            placeholder="18.30"
          />
          <Input
            label="Per kilometre rate"
            type="number"
            step="0.01"
            value={form.perKmRate}
            onChange={(e) => setField('perKmRate', e.target.value)}
            placeholder="1.80"
          />
          <Input
            label="Per minute rate"
            type="number"
            step="0.01"
            value={form.perMinuteRate}
            onChange={(e) => setField('perMinuteRate', e.target.value)}
            placeholder="0.40"
          />
          <Input
            label="Badge"
            value={form.badge}
            onChange={(e) => setField('badge', e.target.value)}
            placeholder="POPULAR"
          />
          <Input
            label="ETA text"
            value={form.etaText}
            onChange={(e) => setField('etaText', e.target.value)}
            placeholder="3-5 min"
          />
          <Input
            label="Sort order"
            type="number"
            value={form.sortOrder}
            onChange={(e) => setField('sortOrder', e.target.value)}
            placeholder="1"
          />
          <Select
            label="Status"
            options={VEHICLE_TYPE_STATUS_OPTIONS}
            value={form.status}
            onChange={(e) => setField('status', e.target.value)}
          />
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-text-secondary">Description</span>
          <textarea
            rows="3"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder="Comfortable everyday sedan rides with AC"
            className="w-full rounded-xl border border-border-subtle bg-surface p-2.5 text-sm text-text-primary placeholder:text-text-muted/70 focus:border-taxi-500 focus:outline-none"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-text-secondary">Vehicle image</span>
            <div className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface p-2.5 transition-colors hover:bg-surface-hover">
              {imageSrc ? (
                <img src={imageSrc} alt="" className="h-9 w-12 rounded object-cover" />
              ) : (
                <Upload size={16} className="text-taxi-500" />
              )}
              <span className="truncate text-xs text-text-secondary">
                {imageFile ? imageFile.name : form.imageUrl ? 'Replace image' : 'Click to upload an image'}
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="sr-only"
                onChange={(e) => pickImage(e.target.files?.[0])}
              />
            </div>
          </label>

          <div className="flex items-end gap-2">
            <Input
              label="Or image URL"
              value={form.imageUrl}
              onChange={(e) => setField('imageUrl', e.target.value)}
              placeholder="https://example.com/sedan.jpg"
              containerClassName="flex-1"
            />
            {imageSrc && (
              <Button
                type="button"
                variant="secondary"
                icon={X}
                onClick={clearImage}
                title="Remove image"
                className="mb-0.5"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  )
}
