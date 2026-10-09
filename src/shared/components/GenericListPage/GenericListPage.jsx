import { useMemo, useState } from 'react'
import PageLayout from '@/layouts/PageLayout'
import Table from '@/shared/components/Table'
import Search from '@/shared/components/Search'
import Filter from '@/shared/components/Filter'
import Pagination from '@/shared/components/Pagination'
import { usePagination } from '@/shared/hooks/usePagination'
import { useDebounce } from '@/shared/hooks/useDebounce'

// A reusable list page: title + description + search + status filter + table + pagination.
// Pass `searchKeys` (fields to match against the query) and optional `filterOptions`
// keyed by the field to filter on (usually `status`).
export default function GenericListPage({
  title,
  description,
  rows,
  columns,
  searchKeys = [],
  filterField,
  filterOptions,
  actions,
}) {
  const [query, setQuery] = useState('')
  const [filterValue, setFilterValue] = useState('all')
  const debouncedQuery = useDebounce(query, 200)

  const filtered = useMemo(() => {
    let result = rows
    if (filterField && filterValue !== 'all') {
      result = result.filter((r) => r[filterField] === filterValue)
    }
    if (debouncedQuery && searchKeys.length) {
      const q = debouncedQuery.toLowerCase()
      result = result.filter((r) => searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(q)))
    }
    return result
  }, [rows, filterValue, debouncedQuery, filterField, searchKeys])

  const { page, setPage, totalPages, pageItems } = usePagination(filtered, 8)

  return (
    <PageLayout title={title} description={description} actions={actions}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {searchKeys.length > 0 && <Search value={query} onChange={setQuery} placeholder={`Search ${title.toLowerCase()}…`} />}
        {filterOptions && <Filter options={filterOptions} value={filterValue} onChange={setFilterValue} />}
      </div>
      <Table columns={columns} rows={pageItems} emptyLabel={`No ${title.toLowerCase()} found`} />
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </PageLayout>
  )
}
