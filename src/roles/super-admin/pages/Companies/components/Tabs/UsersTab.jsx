import { useState } from 'react'
import Button from '@/shared/components/Button'
import Modal from '@/shared/components/Modal'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import { Plus } from 'lucide-react'

export default function UsersTab({ users, setUsers }) {
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Company Admin' })

  const handleAddUser = (e) => {
    e.preventDefault()
    if (!newUser.name || !newUser.email) return
    setUsers((prev) => [...prev, { ...newUser, status: 'Active', lastLogin: 'Never' }])
    setNewUser({ name: '', email: '', role: 'Company Admin' })
    setShowAddUserModal(false)
  }

  return (
    <>
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2">
          <h3 className="text-sm font-bold text-text-primary">Company Users</h3>
          <Button icon={Plus} size="sm" onClick={() => setShowAddUserModal(true)}>
            Add Company User
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-primary">
            <thead>
              <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Last Login</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {users.map((u, i) => (
                <tr key={i} className="hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-3 font-medium">{u.name}</td>
                  <td className="py-3 px-3">{u.email}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center rounded-md bg-purple-500/10 px-2 py-1 text-xs font-medium text-signal-purple ring-1 ring-inset ring-purple-500/20">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20' : 'bg-slate-500/10 text-text-muted ring-slate-500/20'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">{u.lastLogin}</td>
                  <td className="py-3 px-3 text-right">
                    <Button size="xs" variant="secondary">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Company User Modal */}
      <Modal
        open={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        title="Add Company User"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddUserModal(false)}>Cancel</Button>
            <Button onClick={handleAddUser}>Create User</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={newUser.name}
            onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. John Mathew"
          />
          <Input
            label="Email"
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
            placeholder="e.g. john@abctaxi.com"
          />
          <Select
            label="Role"
            value={newUser.role}
            onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}
            options={[
              { value: 'Company Admin', label: 'Company Admin' },
              { value: 'Dispatcher', label: 'Dispatcher' },
              { value: 'Driver Manager', label: 'Driver Manager' },
              { value: 'Billing', label: 'Billing' },
            ]}
          />
        </div>
      </Modal>
    </>
  )
}
