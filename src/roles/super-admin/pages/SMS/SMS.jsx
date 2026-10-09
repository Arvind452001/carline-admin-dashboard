import PageLayout from '@/layouts/PageLayout'
import Table from '@/shared/components/Table'
import Badge from '@/shared/components/Badge'

const templates = [
  { id: 1, name: 'Booking confirmed', trigger: 'Trip dispatched', status: 'active' },
  { id: 2, name: 'Driver arriving', trigger: 'Driver 2 min away', status: 'active' },
  { id: 3, name: 'Trip receipt', trigger: 'Trip completed', status: 'active' },
  { id: 4, name: 'OTP verification', trigger: 'Login attempt', status: 'active' },
]

export default function SMS() {
  return (
    <PageLayout title="SMS" description="Automated text message templates sent to riders and drivers.">
      <Table
        columns={[
          { key: 'name', label: 'Template' },
          { key: 'trigger', label: 'Trigger' },
          { key: 'status', label: 'Status', render: (r) => <Badge tone="green" dot>{r.status}</Badge> },
        ]}
        rows={templates}
      />
    </PageLayout>
  )
}
