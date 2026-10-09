import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Button from '@/shared/components/Button'

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

// Exclusions as specified by user requirements (indicated by '-' in matrix mockup)
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

export default function CreateRole() {
  const navigate = useNavigate()
  const [roleName, setRoleName] = useState('')
  const [description, setDescription] = useState('')
  const [roleType, setRoleType] = useState('Custom Role')
  const [scope, setScope] = useState('Company')
  const [status, setStatus] = useState('Active')

  // Matrix state represent as nested object: matrix[module][action] = bool
  const [matrix, setMatrix] = useState(() => {
    const initial = {}
    MODULES.forEach(mod => {
      initial[mod] = {}
      ACTIONS.forEach(act => {
        const isExcluded = EXCLUSIONS[mod]?.includes(act)
        initial[mod][act] = isExcluded ? null : false
      })
    })
    return initial
  })

  const handleCheckboxChange = (module, action) => {
    if (matrix[module][action] === null) return
    setMatrix(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: !prev[module][action]
      }
    }))
  }

  const handleSelectAll = (checked) => {
    setMatrix(prev => {
      const updated = { ...prev }
      MODULES.forEach(mod => {
        updated[mod] = { ...prev[mod] }
        ACTIONS.forEach(act => {
          if (updated[mod][act] !== null) {
            updated[mod][act] = checked
          }
        })
      })
      return updated
    })
  }

  // Calculate if all available checkboxes are checked
  const isAllChecked = (() => {
    for (let mod of MODULES) {
      for (let act of ACTIONS) {
        if (matrix[mod][act] === false) return false
      }
    }
    return true
  })()

  const handleSave = (e) => {
    e.preventDefault()
    // Simulated Save
    navigate('/super-admin/roles')
  }

  return (
    <PageLayout
      title="Create Role"
      description="Configure a new user role with custom permission privileges."
      actions={
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/super-admin/roles')}>
          Back to List
        </Button>
      }
    >
      <form onSubmit={handleSave} className="space-y-6 max-w-6xl">
        
        {/* Basic Information */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-text-primary border-b border-border-subtle pb-2">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Role Name *"
              required
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Dispatch Manager"
            />
            <Select
              label="Role Type"
              value={roleType}
              onChange={(e) => setRoleType(e.target.value)}
              options={[
                { value: 'System Role', label: 'System Role (Built-in)' },
                { value: 'Custom Role', label: 'Custom Role (Flexible)' },
              ]}
            />
            <Select
              label="Scope"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              options={[
                { value: 'Platform', label: 'Platform (All companies)' },
                { value: 'Company', label: 'Company (Single company)' },
              ]}
            />
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
            />
            <Input
              label="Description"
              containerClassName="md:col-span-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the operations this role is authorized to perform..."
            />
          </div>
        </div>

        {/* Permission Matrix */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <h2 className="text-base font-bold text-text-primary">
              Permission Matrix
            </h2>
            <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary cursor-pointer hover:text-text-primary transition-colors">
              <input
                type="checkbox"
                checked={isAllChecked}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 rounded text-taxi-500 border-border-strong focus:ring-taxi-500"
              />
              [✓ Select All]
            </label>
          </div>

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
                    <td className="py-3.5 px-4 font-medium text-text-primary">{module}</td>
                    {ACTIONS.map(action => {
                      const isExcluded = matrix[module][action] === null
                      return (
                        <td key={action} className="py-3.5 px-4 text-center">
                          {isExcluded ? (
                            <span className="text-text-muted/40 font-mono">—</span>
                          ) : (
                            <input
                              type="checkbox"
                              checked={!!matrix[module][action]}
                              onChange={() => handleCheckboxChange(module, action)}
                              className="w-4 h-4 rounded text-taxi-500 border-border-strong focus:ring-taxi-500 cursor-pointer"
                            />
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

        {/* Submit Actions */}
        <div className="flex items-center gap-3 justify-end pt-4">
          <Button variant="secondary" type="button" onClick={() => navigate('/super-admin/roles')}>
            Cancel
          </Button>
          <Button type="submit" icon={Save}>
            Save Role
          </Button>
        </div>

      </form>
    </PageLayout>
  )
}
