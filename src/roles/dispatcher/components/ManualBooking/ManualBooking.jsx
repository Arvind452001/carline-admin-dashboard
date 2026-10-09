import { useState } from 'react'
import { MapPin, Navigation, User, Send } from 'lucide-react'
import Input from '@/shared/components/Input'
import Button from '@/shared/components/Button'
import { useBookingStore } from '@/store/bookingStore'

export default function ManualBookingForm({ onBooked }) {
  const { draft, updateDraft, resetDraft } = useBookingStore()
  const [submitting, setSubmitting] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      onBooked?.(draft)
      resetDraft()
    }, 600)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input label="Customer" icon={User} placeholder="Name or phone number" value={draft.customer} onChange={(e) => updateDraft({ customer: e.target.value })} required />
      <Input label="Pickup location" icon={MapPin} placeholder="e.g. MP Nagar" value={draft.pickup} onChange={(e) => updateDraft({ pickup: e.target.value })} required />
      <Input label="Drop-off location" icon={Navigation} placeholder="e.g. Habibganj Station" value={draft.dropoff} onChange={(e) => updateDraft({ dropoff: e.target.value })} required />
      <Input label="Notes (optional)" placeholder="e.g. Has luggage" value={draft.notes} onChange={(e) => updateDraft({ notes: e.target.value })} />
      <Button type="submit" icon={Send} className="w-full" disabled={submitting}>
        {submitting ? 'Booking…' : 'Create booking'}
      </Button>
    </form>
  )
}
