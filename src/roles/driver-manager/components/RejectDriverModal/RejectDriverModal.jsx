import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import Modal from '@/shared/components/Modal'
import Button from '@/shared/components/Button'

// PATCH /driver/status takes an optional rejectionReason, which the DTO
// describes as "applicable when status is REJECTED". This dialog is the only
// place the panel sends it to the API.
export default function RejectDriverModal({ open, driver, onClose, onConfirm }) {
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open) return
    setReason('')
    setError(null)
    setSaving(false)
  }, [open])

  async function submit(event) {
    event.preventDefault()
    const trimmed = reason.trim()
    if (!trimmed) {
      setError('Enter a reason so the driver knows what to fix.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      // onConfirm rejects the driver and rethrows on failure, so the message
      // stays next to the field the user has to fix.
      await onConfirm(trimmed)
      onClose()
    } catch (err) {
      setError(err.message || 'Could not reject this driver.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={saving ? undefined : onClose}
      title={`Reject ${driver?.name || 'driver'}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" form="reject-driver-form" variant="danger" disabled={saving}>
            {saving ? 'Rejecting...' : 'Reject driver'}
          </Button>
        </>
      }
    >
      <form id="reject-driver-form" onSubmit={submit} className="space-y-3">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-signal-red/20 bg-signal-red/5 px-3 py-2 text-xs text-signal-red">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-text-secondary">Reason for rejection</span>
          <textarea
            rows="3"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Driver license copy is expired or illegible"
            className="w-full rounded-xl border border-border-subtle bg-surface p-2.5 text-sm text-text-primary placeholder:text-text-muted/70 focus:border-taxi-500 focus:outline-none"
          />
        </label>

        <p className="text-[11px] text-text-muted">
          The driver status is set to REJECTED and this text is sent as the rejectionReason.
        </p>
      </form>
    </Modal>
  )
}
