import { useCallback, useEffect, useMemo, useState } from 'react'
import { Building, Loader2, RefreshCw, Save, Shield, Upload } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Loading from '@/shared/components/Loading'
import ErrorState from '@/shared/components/ErrorState'
import { useAuthStore } from '@/store/authStore'
import {
  profileToForm,
  resolveCompanyProfile,
  saveCompanyProfile,
} from '@/roles/company-admin/services/companyProfileApi'

const TIMEZONE_OPTIONS = [
  { value: 'IST (UTC+5:30)', label: 'India Standard Time (IST)' },
  { value: 'EST (UTC-5:00)', label: 'Eastern Standard Time (EST)' },
  { value: 'GMT (UTC+0:00)', label: 'Greenwich Mean Time (GMT)' },
]

export default function Settings() {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)

  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState(null)
  const [logoFile, setLogoFile] = useState(null)

  // Object URLs must be revoked or every render leaks one.
  const logoPreview = useMemo(() => (logoFile ? URL.createObjectURL(logoFile) : ''), [logoFile])
  useEffect(() => () => { if (logoPreview) URL.revokeObjectURL(logoPreview) }, [logoPreview])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const profile = await resolveCompanyProfile(user, token)
      if (!profile) {
        setError(
          'This account is not linked to a company record, so there is nothing to edit. Ask a Super Admin to check the company for this login.'
        )
      } else {
        setForm(profileToForm(profile))
        setLogoFile(null)
      }
    } catch (err) {
      setError(err.message || 'Could not load the company profile.')
    } finally {
      setLoading(false)
    }
  }, [user, token])

  useEffect(() => {
    load()
  }, [load])

  function setField(field, value) {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  async function handleSave(e) {
    e?.preventDefault()
    if (!form || saving) return
    setNotice('')
    setActionError(null)
    setSaving(true)
    try {
      const updated = await saveCompanyProfile(form, { logo: logoFile })
      if (updated) setForm(profileToForm(updated))
      setLogoFile(null)
      setNotice('Company profile saved.')
    } catch (err) {
      setActionError(err.message || 'Could not save the company profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageLayout
      title="Company Settings"
      description="Manage the company profile, registration details, and corporate branding values."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={RefreshCw} onClick={load} disabled={loading || saving}>
            Refresh
          </Button>
          <Button icon={saving ? Loader2 : Save} onClick={handleSave} disabled={loading || saving || !form}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      }
    >
      {notice && (
        <div className="mb-4 rounded-xl border border-signal-green/25 bg-signal-green/10 px-3.5 py-2 text-xs text-signal-green">
          {notice}
        </div>
      )}

      {actionError && (
        <div className="mb-4 rounded-xl border border-signal-red/30 bg-signal-red/10 px-3.5 py-2 text-xs text-signal-red">
          {actionError}
        </div>
      )}

      {loading ? (
        <Loading label="Loading company profile..." />
      ) : error ? (
        <ErrorState title="Could not load the company profile" description={error} onRetry={load} />
      ) : (
        <form onSubmit={handleSave} className="max-w-4xl space-y-6">
          <div className="glass-card space-y-4 rounded-2xl p-6">
            <h3 className="flex items-center gap-1.5 border-b border-border-subtle pb-2 text-sm font-bold text-text-primary">
              <Building size={16} /> Basic Profile
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Company Name *"
                required
                value={form.legalName}
                onChange={(e) => setField('legalName', e.target.value)}
              />
              <Input
                label="License / Registration Number"
                value={form.registrationNumber}
                onChange={(e) => setField('registrationNumber', e.target.value)}
              />
              <Input
                label="Support Contact Name *"
                required
                value={form.primaryContactName}
                onChange={(e) => setField('primaryContactName', e.target.value)}
              />
              <Input
                label="Support Contact Email *"
                required
                type="email"
                value={form.primaryContactEmail}
                onChange={(e) => setField('primaryContactEmail', e.target.value)}
              />
              <Input
                label="Support Contact Phone *"
                required
                value={form.primaryContactPhone}
                onChange={(e) => setField('primaryContactPhone', e.target.value)}
              />
              <Select
                label="Timezone"
                value={form.timezone}
                onChange={(e) => setField('timezone', e.target.value)}
                options={TIMEZONE_OPTIONS}
              />
              <Input
                label="Corporate Address *"
                required
                containerClassName="md:col-span-2"
                value={form.streetAddress}
                onChange={(e) => setField('streetAddress', e.target.value)}
              />
              <Input
                label="Registered City *"
                required
                value={form.city}
                onChange={(e) => setField('city', e.target.value)}
              />
              <Input
                label="State *"
                required
                value={form.state}
                onChange={(e) => setField('state', e.target.value)}
              />
              <Input
                label="ZIP Code"
                value={form.zipCode}
                onChange={(e) => setField('zipCode', e.target.value)}
              />
              <Input
                label="Country"
                value={form.country}
                onChange={(e) => setField('country', e.target.value)}
              />
            </div>
          </div>

          <div className="glass-card space-y-4 rounded-2xl p-6">
            <h3 className="flex items-center gap-1.5 border-b border-border-subtle pb-2 text-sm font-bold text-text-primary">
              <Shield size={16} /> Brand Identity
            </h3>
            <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-text-secondary">Company Logo</span>
                <div className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface p-2.5 transition-colors hover:bg-surface-hover">
                  {logoPreview || form.logoUrl ? (
                    <img
                      src={logoPreview || form.logoUrl}
                      alt="Company logo"
                      className="h-6 w-6 rounded object-contain"
                    />
                  ) : (
                    <Upload size={16} className="text-taxi-500" />
                  )}
                  <span className="truncate text-xs text-text-secondary">
                    {logoFile ? logoFile.name : form.logoUrl ? 'Replace logo' : 'Click to upload logo'}
                  </span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="sr-only"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  />
                </div>
              </label>
              <div className="flex items-center gap-3">
                <label className="block flex-1">
                  <span className="mb-1.5 block text-xs font-medium text-text-secondary">Brand Color</span>
                  <input
                    type="color"
                    value={form.brandColor}
                    onChange={(e) => setField('brandColor', e.target.value)}
                    className="h-[40px] w-full cursor-pointer rounded-xl border border-border-subtle bg-surface p-1"
                  />
                </label>
                <div
                  className="h-10 w-10 rounded-xl border border-border-strong shadow-inner"
                  style={{ backgroundColor: form.brandColor }}
                />
              </div>
              <Input
                label="Branding Display Name"
                value={form.displayNameOverride}
                onChange={(e) => setField('displayNameOverride', e.target.value)}
              />
            </div>
          </div>
        </form>
      )}
    </PageLayout>
  )
}