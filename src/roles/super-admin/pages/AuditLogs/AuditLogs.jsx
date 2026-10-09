import GenericListPage from '@/shared/components/GenericListPage'
import { mockAuditLogs } from '@/shared/utils/mockData'

export default function AuditLogs() {
  return (
    <GenericListPage
      title="Audit Logs"
      description="A record of sensitive actions taken across the platform."
      rows={mockAuditLogs}
      searchKeys={['actor', 'action']}
      columns={[
        { key: 'actor', label: 'Actor' },
        { key: 'action', label: 'Action' },
        { key: 'time', label: 'When' },
      ]}
    />
  )
}
