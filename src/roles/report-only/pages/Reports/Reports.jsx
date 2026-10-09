import PageLayout from '@/layouts/PageLayout'
import Table from '@/shared/components/Table'
import Button from '@/shared/components/Button'
import { Download } from 'lucide-react'

const reports = [
  { id: 1, name: 'Daily trip summary', format: 'CSV', generated: '2h ago' },
  { id: 2, name: 'Driver performance', format: 'PDF', generated: '1d ago' },
  { id: 3, name: 'Revenue by zone', format: 'XLSX', generated: '3d ago' },
  { id: 4, name: 'Cancellation analysis', format: 'CSV', generated: '1w ago' },
]

export default function Reports() {
  return (
    <PageLayout title="Reports" description="Generated reports available for download.">
      <Table
        columns={[
          { key: 'name', label: 'Report' },
          { key: 'format', label: 'Format' },
          { key: 'generated', label: 'Generated' },
          { key: 'actions', label: '', render: () => <Button size="sm" variant="secondary" icon={Download}>Download</Button> },
        ]}
        rows={reports}
      />
    </PageLayout>
  )
}
