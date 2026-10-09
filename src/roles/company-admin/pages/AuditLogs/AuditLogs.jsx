import { useState, useMemo } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Table from '@/shared/components/Table'
import Pagination from '@/shared/components/Pagination'
import { usePagination } from '@/shared/hooks/usePagination'

const MOCK_AUDITS = [
  { id: 1, date: '20 Aug 2026', user: 'John Doe', module: 'Pricing', action: 'Updated', desc: 'Updated Indore base fare rules' },
  { id: 2, date: '21 Aug 2026', user: 'Mike Ross', module: 'Driver', action: 'Suspended', desc: 'Suspended driver DRV-104 due to policy' },
  { id: 3, date: '22 Aug 2026', user: 'Sarah Connor', module: 'Booking', action: 'Override', desc: 'Overrode fare surcharges on booking TRP-2411' },
  { id: 4, date: '23 Aug 2026', user: 'John Doe', module: 'Settings', action: 'Updated', desc: 'Changed brand color theme' },
  { id: 5, date: '24 Aug 2026', user: 'Sarah Connor', module: 'Users', action: 'Created', desc: 'Created dispatcher account for Mike Ross' }
]

export default function AuditLogs() {
  const [searchQuery, setSearchQuery] = useState('')
  const [moduleFilter, setModuleFilter] = useState('all')

  const filteredLogs = useMemo(() => {
    return MOCK_AUDITS.filter(log => {
      const matchesSearch = 
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.desc.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesModule = moduleFilter === 'all' || log.module === moduleFilter

      return matchesSearch && matchesModule
    })
  }, [searchQuery, moduleFilter])

  const { page, setPage, totalPages, pageItems } = usePagination(filteredLogs, 8)

  const columns = [
    { key: 'date', label: 'Date', render: (r) => <span className="text-text-muted">{r.date}</span> },
    { key: 'user', label: 'User', render: (r) => <span className="font-semibold text-text-primary">{r.user}</span> },
    { key: 'module', label: 'Module', render: (r) => (
      <span className="inline-flex items-center rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-signal-purple ring-1 ring-inset ring-purple-500/20">
        {r.module}
      </span>
    )},
    { key: 'action', label: 'Action', render: (r) => (
      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        r.action === 'Updated' ? 'bg-amber-500/10 text-taxi-600 ring-amber-500/20' : r.action === 'Suspended' ? 'bg-red-500/10 text-signal-red ring-red-500/20' : 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20'
      }`}>
        {r.action}
      </span>
    )},
    { key: 'desc', label: 'Description' }
  ]

  return (
    <PageLayout
      title="Company Audit Logs"
      description="Review critical configuration alterations, overrides, and administrative actions."
    >
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-end gap-3 glass-card p-4 rounded-2xl mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search audit logs by admin user or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={SearchIcon}
            containerClassName="w-full"
          />
        </div>
        <div className="w-full md:w-48">
          <Select
            label="Module"
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Modules' },
              { value: 'Pricing', label: 'Pricing' },
              { value: 'Driver', label: 'Driver' },
              { value: 'Booking', label: 'Booking' },
              { value: 'Settings', label: 'Settings' },
              { value: 'Users', label: 'Users' }
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden p-4">
        <Table columns={columns} rows={pageItems} keyField="id" emptyLabel="No audit logs recorded" />
        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </PageLayout>
  )
}
