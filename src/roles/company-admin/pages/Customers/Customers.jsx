import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import GenericListPage from '@/shared/components/GenericListPage'
import StatusBadge from '@/shared/components/StatusBadge'
import Button from '@/shared/components/Button'
import Modal from '@/shared/components/Modal'
import Input from '@/shared/components/Input'
import { useAuthStore } from '@/store/authStore'
import { mockCustomers } from '@/shared/utils/mockData'

export default function Customers() {
  const token = useAuthStore((s) => s.token)
  const [customers, setCustomers] = useState(mockCustomers)
  const [loading, setLoading] = useState(false)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://node.aitechnotech.in/carlinee/api/v1'
      const headers = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${baseUrl}/company/customers/same-company`, { headers })
      const json = await res.json()

      const list = json?.data?.customers || (Array.isArray(json?.data) ? json.data : null)
      if (list && list.length > 0) {
        setCustomers(list)
      }
    } catch (err) {
      console.warn('Could not fetch live company customers:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [token])

  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault()
    if (!newCustomer.firstName.trim() || !newCustomer.phoneNumber.trim()) {
      setErrorMsg('First name and phone number are required.')
      return
    }

    try {
      setSubmitting(true)
      setErrorMsg('')

      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://node.aitechnotech.in/carlinee/api/v1'
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${baseUrl}/company/customers/add`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          firstName: newCustomer.firstName.trim(),
          lastName: newCustomer.lastName.trim(),
          phoneNumber: newCustomer.phoneNumber.trim(),
          email: newCustomer.email.trim() || undefined,
        })
      })

      const json = await res.json()
      if (res.ok && json?.statusCode < 400) {
        setNewCustomer({ firstName: '', lastName: '', phoneNumber: '', email: '' })
        setShowModal(false)
        await fetchCustomers()
      } else {
        setErrorMsg(json?.message || 'Failed to add customer')
      }
    } catch (err) {
      console.error('Error adding customer:', err)
      setErrorMsg('Network error while adding customer')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <GenericListPage
        title="Company Customers"
        description="Customers and riders belonging to your company."
        rows={customers}
        searchKeys={['name', 'customer', 'phone', 'phoneNumber']}
        filterField="status"
        filterOptions={[
          { value: 'all', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'restricted', label: 'Restricted' },
        ]}
        actions={
          <Button icon={UserPlus} onClick={() => setShowModal(true)}>
            Add Customer
          </Button>
        }
        columns={[
          { key: 'name', label: 'Customer', render: (r) => r.name || r.customer },
          { key: 'phone', label: 'Phone', render: (r) => r.phone || r.phoneNumber },
          { key: 'trips', label: 'Trips', render: (r) => r.trips ?? r.totalTrips ?? 0 },
          { key: 'lastTrip', label: 'Last trip', render: (r) => r.lastTrip || '-' },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status || 'Active'} /> },
          {
            key: 'action',
            label: 'Action',
            render: (r) => (
              <Link to={`/company-admin/customers/${r._id || r.id}`}>
                <Button size="sm" variant="secondary">
                  View More
                </Button>
              </Link>
            ),
          },
        ]}
      />

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Add New Customer"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button icon={UserPlus} onClick={handleAddCustomerSubmit} disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Customer'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
          {errorMsg && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-500">
              {errorMsg}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name *"
              required
              value={newCustomer.firstName}
              onChange={(e) => setNewCustomer((prev) => ({ ...prev, firstName: e.target.value }))}
              placeholder="First Name"
            />
            <Input
              label="Last Name"
              value={newCustomer.lastName}
              onChange={(e) => setNewCustomer((prev) => ({ ...prev, lastName: e.target.value }))}
              placeholder="Last Name"
            />
          </div>
          <Input
            label="Phone Number *"
            required
            value={newCustomer.phoneNumber}
            onChange={(e) => setNewCustomer((prev) => ({ ...prev, phoneNumber: e.target.value }))}
            placeholder="+1234567890"
          />
          <Input
            label="Email Address"
            type="email"
            value={newCustomer.email}
            onChange={(e) => setNewCustomer((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="customer@example.com"
          />
        </form>
      </Modal>
    </>
  )
}
