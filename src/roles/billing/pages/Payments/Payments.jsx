import PageLayout from '@/layouts/PageLayout'
import PaymentTable from '../../components/PaymentTable'
import Search from '@/shared/components/Search'
import Filter from '@/shared/components/Filter'
import Pagination from '@/shared/components/Pagination'
import { usePagination } from '@/shared/hooks/usePagination'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { mockPayments } from '@/shared/utils/mockData'
import { useMemo, useState } from 'react'

export default function Payments() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const debounced = useDebounce(query, 200)

  const filtered = useMemo(() => {
    let r = mockPayments
    if (status !== 'all') r = r.filter((p) => p.status === status)
    if (debounced) r = r.filter((p) => p.customer.toLowerCase().includes(debounced.toLowerCase()) || p.id.toLowerCase().includes(debounced.toLowerCase()))
    return r
  }, [status, debounced])

  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 8)

  return (
    <PageLayout title="Payments" description="Every customer payment processed.">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Search value={query} onChange={setQuery} placeholder="Search payments…" />
        <Filter
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'All' },
            { value: 'success', label: 'Success' },
            { value: 'pending', label: 'Pending' },
            { value: 'failed', label: 'Failed' },
          ]}
        />
      </div>
      <PaymentTable payments={pageItems} />
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </PageLayout>
  )
}
