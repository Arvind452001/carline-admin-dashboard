import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, User, Mail, Phone, Loader2, Save, Plus } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Loading from '@/shared/components/Loading'
import ErrorState from '@/shared/components/ErrorState'
import { ROLE_LABELS, ROLES } from '@/access/roles'
import { isValidEmail } from '@/shared/utils/validation'
import { createCompanyUser, getCompanyUser, updateCompanyUser } from '@/roles/company-admin/services/companyUsersApi'

// The company owner may assign any of their own team's roles, but never
// Super Admin or Company Admin.
const companyRoleKeys = [
  ROLES.DISPATCHER,
  ROLES.DRIVER_MANAGER,
  ROLES.CUSTOMER_SERVICE,
  ROLES.BILLING,
  ROLES.ACCOUNTING,
  ROLES.MANAGER,
  ROLES.READ_ONLY,
  ROLES.REPORT_ONLY,
]

const roleOptions = companyRoleKeys.map((key) => ({ value: key, label: ROLE_LABELS[key] }))

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phoneNumber: '',
  role: companyRoleKeys[0],
  status: 'active',
}

export default function NewUser() {
  const navigate = useNavigate()
  const { userId } = useParams()
  const isEdit = Boolean(userId)

  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(isEdit)
  const [loadError, setLoadError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Edit mode prefills from GET /company/users/{id}.
  useEffect(() => {
    if (!isEdit) return undefined
    let active = true
    setLoading(true)
    setLoadError(null)
    getCompanyUser(userId)
      .then((user) => {
        if (!active) return
        if (!user) {
          setLoadError('That team member could not be found.')
          return
        }
        setForm({
          fullName: user.name === '?' ? '' : user.name,
          email: user.email === '?' ? '' : user.email,
          phoneNumber: user.phone === '?' ? '' : user.phone,
          role: user.role || companyRoleKeys[0],
          status: user.status === 'inactive' ? 'inactive' : 'active',
        })
      })
      .catch((err) => {
        if (active) setLoadError(err.message || 'Could not load this team member.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [isEdit, userId])

  const update = (field) => (event) => setForm((prev) => ({ ...prev, [field]: event.target.value }))

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!form.fullName.trim()) {
      setError('Enter the team member\'s full name.')
      return
    }
    if (!isValidEmail(form.email.trim())) {
      setError('Enter a valid email address.')
      return
    }

    setSaving(true)
    try {
      if (isEdit) await updateCompanyUser({ id: userId, ...form })
      else await createCompanyUser(form)
      navigate('/company-admin/users')
    } catch (err) {
      setError(err.message || `Could not ${isEdit ? 'save' : 'create'} this team member.`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <PageLayout title="Edit User">
        <Loading label="Loading team member..." />
      </PageLayout>
    )
  }

  if (loadError) {
    return (
      <PageLayout
        title="Edit User"
        actions={
          <Button variant="secondary" as={Link} to="/company-admin/users" icon={ArrowLeft}>
            Back to Users
          </Button>
        }
      >
        <ErrorState title="Could not load this team member" description={loadError} />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={isEdit ? 'Edit User' : 'Add New User'}
      description={
        isEdit
          ? 'Update this team member\'s details and access.'
          : 'Create a team member. Login credentials are emailed to them automatically.'
      }
      actions={
        <Button variant="secondary" as={Link} to="/company-admin/users" icon={ArrowLeft}>
          Back to Users
        </Button>
      }
    >
      <div className="max-w-2xl rounded-2xl border border-border-subtle bg-surface p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl border border-signal-red/30 bg-signal-red/10 px-3.5 py-2 text-xs text-signal-red">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input
              label="Full Name *"
              placeholder="e.g. Rahul Mehta"
              icon={User}
              required
              value={form.fullName}
              onChange={update('fullName')}
            />
            <Input
              label="Email Address *"
              type="email"
              placeholder="e.g. rahul@example.com"
              icon={Mail}
              required
              value={form.email}
              onChange={update('email')}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Input
              label="Phone Number"
              placeholder="e.g. +91 9876543210"
              icon={Phone}
              value={form.phoneNumber}
              onChange={update('phoneNumber')}
            />
            <Select label="Role *" options={roleOptions} value={form.role} onChange={update('role')} />
          </div>

          <Select label="Status" options={statusOptions} value={form.status} onChange={update('status')} />

          <div className="flex items-center justify-end gap-3 border-t border-border-subtle pt-4">
            <Button variant="secondary" as={Link} to="/company-admin/users">
              Cancel
            </Button>
            <Button type="submit" icon={saving ? Loader2 : isEdit ? Save : Plus} disabled={saving}>
              {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Add User'}
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  )
}
