import Badge from '@/shared/components/Badge'
import { TRIP_STATUS } from '@/shared/constants/tripStatus'
import { PAYMENT_STATUS } from '@/shared/constants/paymentStatus'

const MAPS = {
  ...TRIP_STATUS,
  ...PAYMENT_STATUS,
  active: { label: 'Active', tone: 'green' },
  inactive: { label: 'Inactive', tone: 'red' },
  restricted: { label: 'Restricted', tone: 'red' },
  online: { label: 'Online', tone: 'green' },
  offline: { label: 'Offline', tone: 'slate' },
  'on-trip': { label: 'On Trip', tone: 'purple' },
  suspended: { label: 'Suspended', tone: 'red' },
  live: { label: 'Live', tone: 'green' },
}

export default function StatusBadge({ status }) {
  const normalized = typeof status === 'string' ? status.trim() : ''
  const entry = MAPS[normalized] || MAPS[normalized.toLowerCase()] || { label: status, tone: 'slate' }
  return (
    <Badge tone={entry.tone} dot>
      {entry.label}
    </Badge>
  )
}
