import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageLayout from '@/layouts/PageLayout'
import Loading from '@/shared/components/Loading'
import ErrorState from '@/shared/components/ErrorState'
import { getCompany, updateCompanyStatus } from '@/roles/super-admin/services/superAdminApi'
import CompanyHeader from './components/CompanyHeader'
import CompanyStats from './components/CompanyStats'
import OverviewTab from './components/Tabs/OverviewTab'
import UsersTab from './components/Tabs/UsersTab'
import DocumentsTab from './components/Tabs/DocumentsTab'
import FilteredListTab from './components/Tabs/FilteredListTab'

export default function CompanyDetails() {
  const { companyId } = useParams()
  const navigate = useNavigate()

  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusSaving, setStatusSaving] = useState(false)
  const [statusError, setStatusError] = useState('')
  const [activeTab, setActiveTab] = useState('Overview')

  // Company users have no endpoint in the Super Admin tag yet, so that list
  // stays on local demo state. Documents arrive with the company payload.
  const [users, setUsers] = useState([
    { name: 'John Mathew', email: 'john@abctaxi.com', role: 'Company Admin', status: 'Active', lastLogin: 'Today' },
    { name: 'Mike Ross', email: 'mike@abctaxi.com', role: 'Dispatcher', status: 'Active', lastLogin: 'Today' },
    { name: 'Sarah Connor', email: 'sarah@abctaxi.com', role: 'Driver Manager', status: 'Inactive', lastLogin: 'Yesterday' }
  ])

  const [docs, setDocs] = useState([])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const loaded = await getCompany(companyId)
      setCompany(loaded)
      setDocs(
        (loaded?.documents || []).map((doc) => ({
          type: doc.type,
          name: doc.name,
          expiry: doc.expiryDate || '—',
          status: doc.status || '—',
        }))
      )
    } catch (err) {
      setError(err)
      setCompany(null)
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    load()
  }, [load])

  const toggleStatus = async () => {
    if (!company || statusSaving) return
    const next = company.status === 'active' ? 'suspended' : 'active'
    setStatusSaving(true)
    setStatusError('')
    try {
      await updateCompanyStatus(company.mongoId, next)
      setCompany((prev) => ({ ...prev, status: next }))
    } catch (err) {
      setStatusError(err.message || 'Could not update the company status.')
    } finally {
      setStatusSaving(false)
    }
  }

  const tabs = [
    'Overview',
    'Users',
    'Drivers',
    'Vehicles',
    'Customers',
    'Bookings',
    'Pricing',
    'Payments',
    'Documents',
    'IVR',
    'AI',
    'Reports',
    'Audit Logs'
  ]

  if (loading) {
    return (
      <PageLayout>
        <Loading label="Loading company..." />
      </PageLayout>
    )
  }

  if (error || !company) {
    return (
      <PageLayout>
        <ErrorState
          title="Could not load company"
          description={error?.message || 'This company could not be found.'}
          onRetry={load}
        />
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      {statusError && (
        <div className="mb-4 rounded-xl border border-signal-red/30 bg-signal-red/10 px-3.5 py-2 text-xs text-signal-red">
          {statusError}
        </div>
      )}

      {/* Company Header Card */}
      <CompanyHeader
        companyRaw={company}
        companyStatus={company.status}
        toggleStatus={toggleStatus}
        navigate={navigate}
      />

      {/* Grid of separate stats cards */}
      <CompanyStats />

      {/* Tabs Navigation */}
      <div className="flex border-b border-border-strong overflow-x-auto pb-px mb-6 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-all ${
              activeTab === tab
                ? 'border-taxi-500 text-taxi-500'
                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-subtle'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {activeTab === 'Overview' && (
          <OverviewTab companyRaw={company} companyStatus={company.status} />
        )}

        {activeTab === 'Users' && (
          <UsersTab users={users} setUsers={setUsers} />
        )}

        {activeTab === 'Documents' && (
          <DocumentsTab docs={docs} setDocs={setDocs} />
        )}

        {['Drivers', 'Vehicles', 'Customers', 'Bookings', 'Pricing', 'Payments', 'IVR', 'AI', 'Reports', 'Audit Logs'].includes(activeTab) && (
          <FilteredListTab activeTab={activeTab} companyRaw={company} />
        )}
      </div>
    </PageLayout>
  )
}