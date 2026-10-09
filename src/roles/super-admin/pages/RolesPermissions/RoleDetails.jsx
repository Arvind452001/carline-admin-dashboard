import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, ShieldAlert, CheckCircle, Shield, Users as UsersIcon, Clock, ToggleLeft, ArrowRight, UserCheck } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import StatusBadge from '@/shared/components/StatusBadge'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Modal from '@/shared/components/Modal'

const MODULES = [
  'Companies',
  'Users',
  'Drivers',
  'Vehicles',
  'Customers',
  'Bookings',
  'Dispatch',
  'Pricing',
  'Payments',
  'Payouts',
  'Reports',
  'IVR',
  'AI Training',
  'Settings',
  'Audit Logs'
]

const ACTIONS = [
  'View',
  'Create',
  'Edit',
  'Delete',
  'Approve',
  'Override',
  'Export'
]

const EXCLUSIONS = {
  'Users': ['Override'],
  'Dispatch': ['Delete'],
  'Payments': ['Delete'],
  'Payouts': ['Delete'],
  'Reports': ['Create', 'Edit', 'Delete', 'Approve', 'Override'],
  'AI Training': ['Delete'],
  'Settings': ['Delete', 'Export'],
  'Audit Logs': ['Create', 'Edit', 'Delete', 'Approve', 'Override']
}

// Mock Permission setups for display
const MOCK_ROLE_PERMISSIONS = {
  'super-admin': {
    all: true
  },
  'dispatcher': {
    'Companies': ['View'],
    'Users': ['View', 'Create', 'Edit', 'Export'],
    'Drivers': ['View', 'Create', 'Edit', 'Approve', 'Override', 'Export'],
    'Vehicles': ['View', 'Create', 'Edit', 'Approve', 'Override', 'Export'],
    'Customers': ['View', 'Create', 'Edit', 'Approve', 'Override', 'Export'],
    'Bookings': ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Override', 'Export'],
    'Dispatch': ['View', 'Create', 'Edit', 'Approve', 'Override', 'Export'],
    'Pricing': ['View'],
    'Payments': ['View', 'Create', 'Edit', 'Approve', 'Override', 'Export'],
    'Payouts': ['View'],
    'Reports': ['View', 'Export'],
    'IVR': ['View', 'Create', 'Edit', 'Export'],
    'AI Training': ['View'],
    'Settings': ['View'],
    'Audit Logs': ['View']
  }
}

export default function RoleDetails() {
  const { roleSlug } = useParams()
  const navigate = useNavigate()

  const isSuperAdmin = roleSlug === 'super-admin'
  const roleName = isSuperAdmin ? 'Super Administrator' : 'Dispatcher'
  const [roleStatus, setRoleStatus] = useState('Active')
  const [activeTab, setActiveTab] = useState('Overview')

  // Users listing assigned to this role
  const [assignedUsers, setAssignedUsers] = useState([
    { name: 'John Mathew', email: 'john@abctaxi.com', company: 'ABC Taxi', status: 'Active' },
    { name: 'Mike Ross', email: 'mike@abctaxi.com', company: 'XYZ Cabs', status: 'Active' },
    { name: 'Alex Vance', email: 'alex@cityride.com', company: 'City Ride', status: 'Active' }
  ])

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([
    { id: 101, date: '20 Jun 2026', admin: 'Super Admin', action: 'Permission Updated', module: 'Bookings', permission: 'Export', previous: 'Disabled', next: 'Enabled' },
    { id: 102, date: '21 Jun 2026', admin: 'Admin John', action: 'Permission Updated', module: 'Payments', permission: 'Override', previous: 'Disabled', next: 'Enabled' },
    { id: 103, date: '21 Jun 2026', admin: 'Super Admin', action: 'Role Activated', module: 'All', permission: 'Status', previous: 'Suspended', next: 'Active' }
  ])

  // Modals / Drawers state
  const [selectedAudit, setSelectedAudit] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)

  // Form Assign state
  const [newUser, setNewUser] = useState({ name: '', email: '', company: 'ABC Taxi', status: 'Active' })

  const handleAssignUser = (e) => {
    e.preventDefault()
    if (!newUser.name || !newUser.email) return
    setAssignedUsers(prev => [...prev, newUser])
    setNewUser({ name: '', email: '', company: 'ABC Taxi', status: 'Active' })
    setShowAssignModal(false)
  }

  // Check if a permission is enabled
  const hasPermission = (module, action) => {
    if (isSuperAdmin) return true
    const roleMap = MOCK_ROLE_PERMISSIONS[roleSlug] || MOCK_ROLE_PERMISSIONS['dispatcher']
    return !!roleMap[module]?.includes(action)
  }

  return (
    <PageLayout
      title={roleName}
      description={`System Role Settings • ${scopeLabel(roleSlug)} Scope`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/super-admin/roles')}>
            Back
          </Button>
          <Button icon={Edit2} onClick={() => navigate(`/super-admin/roles/create`)}>
            Edit Role
          </Button>
          {roleSlug !== 'super-admin' && (
            <Button
              variant={roleStatus === 'Active' ? 'danger' : 'success'}
              icon={roleStatus === 'Active' ? ShieldAlert : CheckCircle}
              onClick={() => setRoleStatus(p => p === 'Active' ? 'Inactive' : 'Active')}
            >
              {roleStatus === 'Active' ? 'Deactivate' : 'Activate'}
            </Button>
          )}
        </div>
      }
    >
      {/* Role Profile Header */}
      <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-taxi-500/10 border border-border-strong flex items-center justify-center text-taxi-500">
            <Shield size={32} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-text-primary">{roleName}</h2>
              <StatusBadge status={roleStatus.toLowerCase()} />
            </div>
            <p className="text-xs text-text-muted mt-1">
              Description: <span className="font-medium text-text-secondary">
                {isSuperAdmin ? 'Full platform privileges override capability.' : 'Manage bookings, dispatch and live trips.'}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-surface px-6 py-3.5 rounded-xl border border-border-subtle text-center md:text-right">
          <p className="text-xs text-text-muted">Total Users Assigned</p>
          <p className="text-2xl font-black text-text-primary mt-0.5">{assignedUsers.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-strong overflow-x-auto pb-px mb-6 scrollbar-none">
        {['Overview', 'Permissions', 'Users', 'Audit History'].map(tab => (
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

      {/* Tab Panels */}
      <div className="space-y-6">
        {activeTab === 'Overview' && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Overview Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-xs text-text-muted">Role Name</p>
                <p className="font-semibold text-text-primary mt-0.5">{roleName}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Role Type</p>
                <p className="font-medium text-text-primary mt-0.5">{isSuperAdmin ? 'System Role' : 'Custom Role'}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Access Scope</p>
                <p className="font-medium text-text-primary mt-0.5">{scopeLabel(roleSlug)}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted">Status</p>
                <div className="mt-0.5"><StatusBadge status={roleStatus.toLowerCase()} /></div>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-text-muted">Permissions Summary</p>
                <p className="text-text-secondary mt-1">
                  {isSuperAdmin 
                    ? 'This role bypasses all safety restrictions and permission checks. Complete access is granted across all modules.'
                    : 'Authorized to dispatch vehicles, create bookings, manage driver status, and review customer listings. Surcharging rates and billing exports require additional override privileges.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Permissions' && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Read-Only Permission Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-primary border-collapse">
                <thead>
                  <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                    <th className="py-3 px-4 font-bold text-text-primary">Module</th>
                    {ACTIONS.map(action => (
                      <th key={action} className="py-3 px-4 text-center">{action}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {MODULES.map(module => (
                    <tr key={module} className="hover:bg-surface/40 transition-colors">
                      <td className="py-3 px-4 font-medium text-text-primary">{module}</td>
                      {ACTIONS.map(action => {
                        const isExcluded = EXCLUSIONS[module]?.includes(action)
                        const enabled = hasPermission(module, action)
                        
                        return (
                          <td key={action} className="py-3 px-4 text-center">
                            {isExcluded ? (
                              <span className="text-text-muted/40 font-mono">—</span>
                            ) : enabled ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs ring-1 ring-inset ring-emerald-500/20">✓</span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-5 h-5 text-red-500/20 font-bold text-xs">✗</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Users' && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <h3 className="text-sm font-bold text-text-primary">Assigned Users</h3>
              <Button icon={UserCheck} size="sm" onClick={() => setShowAssignModal(true)}>
                Assign Role to User
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-primary">
                <thead>
                  <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Company</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {assignedUsers.map((u, i) => (
                    <tr key={i} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-text-primary">{u.name}</td>
                      <td className="py-3 px-3 text-text-secondary">{u.email}</td>
                      <td className="py-3 px-3 font-medium text-text-primary">{u.company}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Audit History' && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Permission Change History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-primary">
                <thead>
                  <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Admin</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Module</th>
                    <th className="py-2.5 px-3">Permission</th>
                    <th className="py-2.5 px-3">Changed From</th>
                    <th className="py-2.5 px-3">Changed To</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {auditLogs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedAudit(log)}
                      className="hover:bg-surface/60 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-3 font-medium text-text-secondary">{log.date}</td>
                      <td className="py-3.5 px-3 font-semibold text-text-primary">{log.admin}</td>
                      <td className="py-3.5 px-3 text-taxi-500 font-medium">{log.action}</td>
                      <td className="py-3.5 px-3">{log.module}</td>
                      <td className="py-3.5 px-3">{log.permission}</td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center rounded-md bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 ring-1 ring-inset ring-red-500/20">
                          {log.previous} ❌
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 ring-1 ring-inset ring-emerald-500/20">
                          {log.next} ✓
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal Drawer for Audit Details */}
      {selectedAudit && (
        <Modal
          open={!!selectedAudit}
          onClose={() => setSelectedAudit(null)}
          title="Permission Change Details"
          footer={
            <Button onClick={() => setSelectedAudit(null)}>Close Details</Button>
          }
        >
          <div className="space-y-4 text-sm">
            <div className="bg-surface p-4 rounded-xl border border-border-subtle space-y-3">
              <div className="grid grid-cols-2 gap-2 border-b border-border-subtle pb-2.5">
                <div>
                  <p className="text-xs text-text-muted">Target Role</p>
                  <p className="font-bold text-text-primary mt-0.5">{roleName}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Module</p>
                  <p className="font-semibold text-text-primary mt-0.5">{selectedAudit.module}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 border-b border-border-subtle pb-2.5">
                <div>
                  <p className="text-xs text-text-muted">Permission Parameter</p>
                  <p className="font-semibold text-text-primary mt-0.5">{selectedAudit.permission}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">Changed By</p>
                  <p className="font-bold text-text-primary mt-0.5">{selectedAudit.admin}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-text-muted">Previous State</p>
                  <p className="font-semibold text-red-600 mt-0.5">{selectedAudit.previous}</p>
                </div>
                <div>
                  <p className="text-xs text-text-muted">New State</p>
                  <p className="font-semibold text-emerald-600 mt-0.5">{selectedAudit.next}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Audit ID: AUD-{selectedAudit.id}</span>
              <span>Logged on: {selectedAudit.date}</span>
            </div>
          </div>
        </Modal>
      )}

      {/* Assign User to Role Modal */}
      <Modal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title={`Assign ${roleName} Role to User`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
            <Button onClick={handleAssignUser}>Assign Role</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={newUser.name}
            onChange={(e) => setNewUser(p => ({ ...p, name: e.target.value }))}
            placeholder="User's Full Name"
          />
          <Input
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser(p => ({ ...p, email: e.target.value }))}
            placeholder="User's Email address"
          />
          <Select
            label="Company"
            value={newUser.company}
            onChange={(e) => setNewUser(p => ({ ...p, company: e.target.value }))}
            options={[
              { value: 'ABC Taxi', label: 'ABC Taxi' },
              { value: 'XYZ Cabs', label: 'XYZ Cabs' },
              { value: 'City Ride', label: 'City Ride' },
            ]}
          />
        </div>
      </Modal>

    </PageLayout>
  )
}

function scopeLabel(slug) {
  return slug === 'super-admin' ? 'Platform' : 'Company'
}
