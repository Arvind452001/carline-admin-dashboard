import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Plus, Trash2, Upload, Loader2 } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Button from '@/shared/components/Button'
import Loading from '@/shared/components/Loading'
import { createCompany, getCompany, updateCompany } from '@/roles/super-admin/services/superAdminApi'

// normalizeCompany() uses this placeholder for fields the API did not return.
const EMPTY = '—'
// Never re-submit junk such as "[object Object]" that older payloads stored.
const PLACEHOLDERS = new Set(['[object Object]', 'undefined', 'null', 'NaN'])
const clean = (value) => {
  if (!value || value === EMPTY) return ''
  const text = String(value)
  return PLACEHOLDERS.has(text.trim()) ? '' : text
}

// Form state -> CreateCompanyDto / UpdateCompanyDto field names.
function toCompanyValues(formData, documentMeta) {
  const first = documentMeta || {}
  return {
    legalName: formData.legalName,
    displayName: formData.displayName,
    companyCode: formData.companyCode,
    registrationNumber: formData.licenseNumber,
    status: formData.status,
    streetAddress: formData.street,
    city: formData.city,
    state: formData.state,
    zipCode: formData.zip,
    country: formData.country,
    timezone: formData.timezone,
    primaryContactName: formData.contactName,
    primaryContactEmail: formData.contactEmail,
    primaryContactPhone: formData.contactPhone,
    billingContactName: formData.billingContact,
    billingEmail: formData.billingEmail,
    billingPhone: formData.billingPhone,
    billingAddress: formData.billingAddress,
    brandColor: formData.brandColor,
    displayNameOverride: formData.brandDisplayName,
    documentType: first.type,
    documentName: first.name,
    issueDate: first.issueDate,
    expiryDate: first.expiryDate,
  }
}

// Company response -> form state.
function toFormValues(company) {
  return {
    legalName: clean(company.legalName),
    displayName: clean(company.displayName),
    companyCode: clean(company.companyCode),
    licenseNumber: clean(company.registrationNumber),
    status: company.status === 'unknown' ? 'active' : company.status,
    street: clean(company.streetAddress),
    city: clean(company.city),
    state: clean(company.state),
    zip: company.zipCode || '',
    country: company.country || 'India',
    timezone: clean(company.timezone),
    contactName: clean(company.primaryContactName),
    contactEmail: clean(company.primaryContactEmail),
    contactPhone: clean(company.primaryContactPhone),
    billingContact: clean(company.billingContactName),
    billingEmail: clean(company.billingEmail),
    billingPhone: clean(company.billingPhone),
    billingAddress: clean(company.billingAddress),
    brandColor: company.brandColor || '#F15A26',
    brandDisplayName: company.displayNameOverride || '',
  }
}

export default function CreateCompany() {
  const navigate = useNavigate()
  const { companyId } = useParams()
  const isEdit = Boolean(companyId)

  // Form State
  const [formData, setFormData] = useState({
    legalName: '',
    displayName: '',
    companyCode: '',
    licenseNumber: '',
    status: 'active',

    // Address
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
    timezone: 'IST (UTC+5:30)',

    // Contact
    contactName: '',
    contactEmail: '',
    contactPhone: '',

    // Billing
    billingContact: '',
    billingEmail: '',
    billingPhone: '',
    billingAddress: '',

    // Branding
    brandColor: '#F15A26',
    brandDisplayName: '',
  })

  // Documents state. Rows loaded from an existing company are marked `existing`
  // so only documents entered in this session are submitted to the API.
  const [documents, setDocuments] = useState([])

  // New Document Temp Form
  const [newDoc, setNewDoc] = useState({
    type: 'Business License',
    name: '',
    issueDate: '',
    expiryDate: '',
  })
  const [showDocForm, setShowDocForm] = useState(false)

  // Files travel as multipart/form-data next to the fields above.
  const [logoFile, setLogoFile] = useState(null)
  const [documentFiles, setDocumentFiles] = useState([])

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Edit mode loads the existing company into the form.
  useEffect(() => {
    if (!isEdit) return
    let active = true
    setLoading(true)
    getCompany(companyId)
      .then((company) => {
        if (!active || !company) return
        setFormData(toFormValues(company))
        setDocuments(
          (company.documents || []).map((doc, index) => ({
            id: doc.id || `existing-${index}`,
            type: doc.type,
            name: doc.name,
            issueDate: doc.issueDate || '',
            expiryDate: doc.expiryDate || '',
            status: doc.status || 'Saved',
            existing: true,
          }))
        )
      })
      .catch((err) => {
        if (active) setError(err.message || 'Could not load this company.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [companyId, isEdit])

  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }))
  }

  const handleAddDocument = (e) => {
    e.preventDefault()
    if (!newDoc.name || !newDoc.expiryDate) return

    setDocuments(prev => [
      ...prev,
      {
        id: Date.now(),
        ...newDoc,
        status: new Date(newDoc.expiryDate) < new Date() ? 'Expired' : 'Valid'
      }
    ])
    setNewDoc({
      type: 'Business License',
      name: '',
      issueDate: '',
      expiryDate: '',
    })
    setShowDocForm(false)
  }

  const handleDeleteDocument = (id) => {
    setDocuments(prev => prev.filter(d => d.id !== id))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      // Documents already stored server-side are not re-sent; only a document
      // the user just entered carries metadata with the request.
      const values = toCompanyValues(formData, documents.find((doc) => !doc.existing))
      const files = { logo: logoFile, documents: documentFiles }
      if (isEdit) await updateCompany(companyId, values, files)
      else await createCompany(values, files)
      navigate('/super-admin/companies')
    } catch (err) {
      setError(err.message || 'Could not save the company.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <PageLayout title={isEdit ? 'Edit Company' : 'Add Company'}>
        <Loading label="Loading company..." />
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title={isEdit ? 'Edit Company' : 'Add Company'}
      description={isEdit ? 'Update this company record' : 'Register a new taxi company on the platform'}
      actions={
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/super-admin/companies')}>
          Back to List
        </Button>
      }
    >
      <form onSubmit={handleSave} className="space-y-6 max-w-5xl">

        {error && (
          <div className="rounded-xl border border-signal-red/30 bg-signal-red/10 px-3.5 py-2 text-xs text-signal-red">
            {error}
          </div>
        )}

        {/* Section A — Basic Information */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-text-primary border-b border-border-subtle pb-2">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Legal Name *"
              required
              value={formData.legalName}
              onChange={(e) => handleInputChange('legalName', e.target.value)}
              placeholder="e.g. ABC Taxi Services Private Limited"
            />
            <Input
              label="Display Name *"
              required
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              placeholder="e.g. ABC Taxi"
            />
            <Input
              label="Company Code *"
              required
              value={formData.companyCode}
              onChange={(e) => handleInputChange('companyCode', e.target.value)}
              placeholder="e.g. ABCTX"
            />
            <Input
              label="Registration / License Number"
              value={formData.licenseNumber}
              onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
              placeholder="e.g. L-99283-IND"
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'suspended', label: 'Suspended' },
              ]}
            />
          </div>
        </div>

        {/* Section B — Address */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-text-primary border-b border-border-subtle pb-2">
            Address Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Street Address *"
              required
              containerClassName="md:col-span-2"
              value={formData.street}
              onChange={(e) => handleInputChange('street', e.target.value)}
              placeholder="e.g. 102 Royal Park Building"
            />
            <Input
              label="City *"
              required
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="e.g. Indore"
            />
            <Input
              label="State *"
              required
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="e.g. Madhya Pradesh"
            />
            <Input
              label="ZIP / Postal Code *"
              required
              value={formData.zip}
              onChange={(e) => handleInputChange('zip', e.target.value)}
              placeholder="e.g. 452001"
            />
            <Input
              label="Country *"
              required
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              placeholder="e.g. India"
            />
            <Input
              label="Timezone *"
              required
              value={formData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              placeholder="e.g. IST (UTC+5:30)"
            />
          </div>
        </div>

        {/* Section C — Contact */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-text-primary border-b border-border-subtle pb-2">
            Primary Contact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Contact Name *"
              required
              value={formData.contactName}
              onChange={(e) => handleInputChange('contactName', e.target.value)}
              placeholder="e.g. John Doe"
            />
            <Input
              label="Email *"
              type="email"
              required
              value={formData.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              placeholder="e.g. john@company.com"
            />
            <Input
              label="Phone *"
              required
              value={formData.contactPhone}
              onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              placeholder="e.g. +91 9999999999"
            />
          </div>
        </div>

        {/* Section D — Billing */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-text-primary border-b border-border-subtle pb-2">
            Billing Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Billing Contact Name"
              value={formData.billingContact}
              onChange={(e) => handleInputChange('billingContact', e.target.value)}
              placeholder="e.g. Accounts Dept"
            />
            <Input
              label="Billing Email"
              type="email"
              value={formData.billingEmail}
              onChange={(e) => handleInputChange('billingEmail', e.target.value)}
              placeholder="e.g. billing@company.com"
            />
            <Input
              label="Billing Phone"
              value={formData.billingPhone}
              onChange={(e) => handleInputChange('billingPhone', e.target.value)}
              placeholder="e.g. +91 9888888888"
            />
            <Input
              label="Billing Address"
              containerClassName="md:col-span-3"
              value={formData.billingAddress}
              onChange={(e) => handleInputChange('billingAddress', e.target.value)}
              placeholder="Full billing address (if different)"
            />
          </div>
        </div>

        {/* Section E — Branding */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-text-primary border-b border-border-subtle pb-2">
            Branding
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-text-secondary">Company Logo</span>
              <div className="flex items-center gap-3 border border-dashed border-border-strong bg-surface p-2.5 rounded-xl cursor-pointer hover:bg-surface-hover transition-colors">
                <Upload size={16} className="text-taxi-500" />
                <span className="truncate text-xs text-text-secondary">
                  {logoFile ? logoFile.name : 'Click to upload logo'}
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="sr-only"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                />
              </div>
            </label>
            <div className="flex gap-3 items-center">
              <label className="block flex-1">
                <span className="mb-1.5 block text-xs font-medium text-text-secondary">Brand Color</span>
                <input
                  type="color"
                  value={formData.brandColor}
                  onChange={(e) => handleInputChange('brandColor', e.target.value)}
                  className="w-full h-[40px] p-1 bg-surface border border-border-subtle rounded-xl cursor-pointer"
                />
              </label>
              <div
                className="w-10 h-10 rounded-xl border border-border-strong shadow-inner"
                style={{ backgroundColor: formData.brandColor }}
              />
            </div>
            <Input
              label="Branding Display Name Override"
              value={formData.brandDisplayName}
              onChange={(e) => handleInputChange('brandDisplayName', e.target.value)}
              placeholder="e.g. ABC Go"
            />
          </div>
        </div>

        {/* Section F — Documents */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2">
            <h2 className="text-base font-bold text-text-primary">
              Company Documents
            </h2>
            <Button
              type="button"
              variant="secondary"
              icon={Plus}
              onClick={() => setShowDocForm(!showDocForm)}
            >
              {showDocForm ? 'Cancel Add' : 'Add Document'}
            </Button>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-text-secondary">
              Verification Files (PDF, DOCX, PNG, JPG)
            </span>
            <div className="flex items-center gap-3 border border-dashed border-border-strong bg-surface p-2.5 rounded-xl cursor-pointer hover:bg-surface-hover transition-colors">
              <Upload size={16} className="text-taxi-500" />
              <span className="truncate text-xs text-text-secondary">
                {documentFiles.length
                  ? `${documentFiles.length} file(s) selected: ${documentFiles.map((f) => f.name).join(', ')}`
                  : 'Click to attach document files'}
              </span>
              <input
                type="file"
                multiple
                accept="application/pdf,.doc,.docx,image/png,image/jpeg"
                className="sr-only"
                onChange={(e) => setDocumentFiles(Array.from(e.target.files || []))}
              />
            </div>
          </label>

          {showDocForm && (
            <div className="bg-surface p-4 rounded-xl space-y-4 border border-border-subtle max-w-lg transition-all animate-fadeIn">
              <h3 className="text-sm font-semibold text-text-primary">New Document Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Document Type"
                  value={newDoc.type}
                  onChange={(e) => setNewDoc(prev => ({ ...prev, type: e.target.value }))}
                  options={[
                    { value: 'Business License', label: 'Business License' },
                    { value: 'Insurance', label: 'Insurance' },
                    { value: 'Registration', label: 'Registration' },
                    { value: 'Tax Document', label: 'Tax Document' },
                    { value: 'Operating Permit', label: 'Operating Permit' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />
                <Input
                  label="Document Name / File"
                  required
                  value={newDoc.name}
                  onChange={(e) => setNewDoc(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. License_2026.pdf"
                />
                <Input
                  label="Issue Date"
                  type="date"
                  value={newDoc.issueDate}
                  onChange={(e) => setNewDoc(prev => ({ ...prev, issueDate: e.target.value }))}
                />
                <Input
                  label="Expiry Date"
                  type="date"
                  required
                  value={newDoc.expiryDate}
                  onChange={(e) => setNewDoc(prev => ({ ...prev, expiryDate: e.target.value }))}
                />
              </div>
              <Button type="button" onClick={handleAddDocument} className="w-full">
                Add Document to List
              </Button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-primary">
              <thead>
                <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                  <th className="py-2.5 px-3">Document Type</th>
                  <th className="py-2.5 px-3">File / Document Name</th>
                  <th className="py-2.5 px-3">Issue Date</th>
                  <th className="py-2.5 px-3">Expiry Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3 px-3 font-medium">{doc.type}</td>
                    <td className="py-3 px-3">{doc.name}</td>
                    <td className="py-3 px-3">{doc.issueDate || '—'}</td>
                    <td className="py-3 px-3">{doc.expiryDate}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${['valid', 'approved', 'active'].includes(String(doc.status).toLowerCase()) ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20' : 'bg-red-500/10 text-red-600 ring-red-500/20'
                        }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {doc.existing ? (
                        <span className="text-[11px] text-text-muted">Saved</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {documents.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-text-muted">
                      No documents added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center gap-3 justify-end pt-4">
          <Button variant="secondary" type="button" onClick={() => navigate('/super-admin/companies')}>
            Cancel
          </Button>
          <Button type="submit" icon={saving ? Loader2 : Save} disabled={saving}>
            {saving ? 'Saving...' : isEdit ? 'Update Company' : 'Save Company'}
          </Button>
        </div>

      </form>
    </PageLayout>
  )
}
