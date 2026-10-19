import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Award, Car, FileText, RefreshCw, ShieldCheck, ShieldOff, User, XCircle } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import Badge from '@/shared/components/Badge'
import StatusBadge from '@/shared/components/StatusBadge'
import Table from '@/shared/components/Table'
import Loading from '@/shared/components/Loading'
import ErrorState from '@/shared/components/ErrorState'
import ImageLightbox from '@/shared/components/ImageLightbox'
import RejectDriverModal from '@/roles/driver-manager/components/RejectDriverModal'
import AssignVehicleTypeModal from '@/roles/driver-manager/components/AssignVehicleTypeModal'
import { isImageUpload } from '@/shared/services/apiClient'
import { formatDate, formatDateTime } from '@/shared/utils/date'
import {
  DRIVER_ACTIVE_STATUS,
  DRIVER_INACTIVE_STATUS,
  DRIVER_REJECTED_STATUS,
  driverStatusActionLabel,
  getCompanyDriver,
  updateDriverStatus,
} from '@/roles/company-admin/services/driverApi'

// Only the tabs the Driver API can actually feed. The page used to also carry
// Trips, Earnings, Performance, Alerts, Restrictions, Schedule, Availability,
// History and Audit, but none of those have an endpoint behind them.
const TABS = ['Overview', 'License', 'Vehicle', 'Documents', 'Presence']

const DASH = '-'

const isBlank = (value) => value === undefined || value === null || value === ''
const show = (value) => (isBlank(value) ? DASH : value)

// Online seconds -> "3h 20m".
function duration(total) {
  const seconds = Number(total)
  if (!Number.isFinite(seconds) || seconds <= 0) return DASH
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`
}

// License dates arrive as MM/DD/YYYY, so they are shown and parsed by hand
// rather than handed to a parser that would read them as ISO.
function parseSlashDate(text) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(text ?? '').trim())
  if (!match) return null
  const [, month, day, year] = match
  const parsed = new Date(Number(year), Number(month) - 1, Number(day))
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function licenseValidity(expiry) {
  const date = parseSlashDate(expiry)
  if (!date) return null
  const days = Math.ceil((date.getTime() - Date.now()) / 86400000)
  if (days < 0) return { label: 'Expired', tone: 'red' }
  if (days <= 30) return { label: `Expires in ${days}d`, tone: 'amber' }
  return { label: 'Valid', tone: 'green' }
}

// normalizeDriver has already resolved each document to a URL. The preview is
// still best effort: an image the server does not serve falls back to a file
// icon, and anything that is not an image opens in a new tab instead of a lightbox.
function DocumentPreview({ file, onPreview }) {
  const [broken, setBroken] = useState(false)
  const stored = String(file ?? '').trim()

  if (isBlank(stored)) return <span className="text-text-muted">Not uploaded</span>

  const name = stored.split('/').pop()
  const previewable = isImageUpload(stored) && !broken
  const open = () => onPreview({ src: stored, title: name })

  return (
    <div className="flex items-center gap-3">
      {previewable ? (
        <button
          type="button"
          onClick={open}
          title="View larger"
          className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border-subtle bg-surface-hover"
        >
          <img src={stored} alt={name} onError={() => setBroken(true)} className="h-full w-full object-cover" />
        </button>
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-subtle bg-surface-hover">
          <FileText size={16} className="text-text-muted" />
        </span>
      )}

      {previewable ? (
        <button type="button" onClick={open} className="truncate text-left text-taxi-500 underline">
          {name}
        </button>
      ) : (
        <a href={stored} target="_blank" rel="noreferrer" className="truncate text-taxi-500 underline">
          {name}
        </a>
      )}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <span className="text-text-muted">{label}</span>
      <p className="mt-1 font-semibold text-text-primary">{children}</p>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">{title}</h3>
      {children}
    </div>
  )
}

export default function DriverDetails() {
  const { driverId } = useParams()
  const navigate = useNavigate()

  const [driver, setDriver] = useState(null)
  const [activeTab, setActiveTab] = useState('Overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [preview, setPreview] = useState(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [assignVehicleOpen, setAssignVehicleOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setDriver(await getCompanyDriver(driverId))
    } catch (err) {
      setDriver(null)
      setError(err.message || 'Could not load this driver.')
    } finally {
      setLoading(false)
    }
  }, [driverId])

  useEffect(() => {
    load()
  }, [load])

  const toggleStatus = useCallback(async () => {
    if (!driver) return
    const next = driver.status === DRIVER_ACTIVE_STATUS ? DRIVER_INACTIVE_STATUS : DRIVER_ACTIVE_STATUS
    setSaving(true)
    setActionError(null)
    try {
      await updateDriverStatus({ driverId: driver.id, status: next })
      await load()
    } catch (err) {
      setActionError(err.message || 'Could not update this driver.')
    } finally {
      setSaving(false)
    }
  }, [driver, load])

  // The reason is the whole point of this call, so failures are rethrown for the
  // dialog to show next to the field instead of in the page banner.
  const rejectDriver = useCallback(
    async (reason) => {
      if (!driver) return
      setSaving(true)
      try {
        await updateDriverStatus({
          driverId: driver.id,
          status: DRIVER_REJECTED_STATUS,
          rejectionReason: reason,
        })
        await load()
      } finally {
        setSaving(false)
      }
    },
    [driver, load]
  )

  // The same page is reachable from every panel, so Back stays in-role.
  function goBack() {
    const { pathname } = window.location
    if (pathname.includes('/dispatcher')) navigate('/dispatcher/drivers')
    else if (pathname.includes('/company-admin')) navigate('/company-admin/drivers')
    else if (pathname.includes('/super-admin')) navigate('/super-admin/drivers')
    else navigate('/driver-manager/driver-list')
  }

  const backAction = (
    <Button variant="secondary" icon={ArrowLeft} onClick={goBack}>
      Back
    </Button>
  )

  if (loading) {
    return (
      <PageLayout title="Driver profile" actions={backAction}>
        <Loading label="Loading driver..." />
      </PageLayout>
    )
  }

  if (error || !driver) {
    return (
      <PageLayout title="Driver profile" actions={backAction}>
        <ErrorState title="Could not load this driver" description={error} onRetry={load} />
      </PageLayout>
    )
  }

  const isActive = driver.status === DRIVER_ACTIVE_STATUS
  const validity = licenseValidity(driver.licenseExpiryDate)
  const documents = [
    { id: 'governmentId', label: 'Government ID', file: driver.governmentIdUrl },
    { id: 'licenseCopy', label: 'Driving license copy', file: driver.licenseCopyUrl },
    { id: 'vehicleRegistration', label: 'Vehicle registration', file: driver.vehicleRegistrationDocUrl },
    { id: 'insuranceProof', label: 'Insurance proof', file: driver.insuranceProofUrl },
  ]

  const actions = (
    <div className="flex gap-2">
      {backAction}
      <Button variant="secondary" icon={RefreshCw} onClick={load} disabled={saving}>
        Refresh
      </Button>
      <Button variant="danger" icon={XCircle} onClick={() => setRejectOpen(true)} disabled={saving}>
        Reject
      </Button>
      <Button
        variant={isActive ? 'secondary' : 'success'}
        icon={isActive ? ShieldOff : ShieldCheck}
        onClick={toggleStatus}
        disabled={saving}
      >
        {saving ? 'Saving...' : `${driverStatusActionLabel(driver.status)} Driver`}
      </Button>
    </div>
  )

  return (
    <PageLayout title={driver.name} description={`Driver profile - ${driver.id}`} actions={actions}>
      {actionError && (
        <div className="flex items-start gap-2 rounded-xl border border-signal-red/20 bg-signal-red/5 px-4 py-3 text-xs text-text-secondary">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-signal-red" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="glass-card rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {driver.avatar ? (
            <img src={driver.avatar} alt={driver.name} className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-taxi-500/10 flex items-center justify-center text-taxi-500">
              <User size={32} />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-text-primary">{driver.name}</h2>
              <StatusBadge status={driver.statusSlug} />
              {driver.isVerified && <Badge tone="green">Verified</Badge>}
            </div>
            <p className="text-xs text-text-muted mt-1">
              {show(driver.phone)} - {show(driver.email)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface p-2 px-4 rounded-xl border border-border-subtle text-center">
            <p className="text-[10px] uppercase font-bold text-text-muted">Rating</p>
            <p className="text-sm font-black text-text-primary mt-0.5 flex items-center justify-center gap-1">
              <Award size={13} className="text-amber-500" /> {show(driver.rating)}
            </p>
          </div>
          <div className="bg-surface p-2 px-4 rounded-xl border border-border-subtle text-center">
            <p className="text-[10px] uppercase font-bold text-text-muted">Online</p>
            <p className="text-sm font-black text-text-primary mt-0.5">{driver.isOnline ? 'Yes' : 'No'}</p>
          </div>
          <div className="bg-surface p-2 px-4 rounded-xl border border-border-subtle text-center">
            <p className="text-[10px] uppercase font-bold text-text-muted">Joined</p>
            <p className="text-sm font-black text-text-primary mt-0.5">
              {driver.createdAt ? formatDate(driver.createdAt) : DASH}
            </p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-border-strong overflow-x-auto pb-px scrollbar-none">
        {TABS.map((tab) => (
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

      <div className="space-y-6">
        {activeTab === 'Overview' && (
          <>
            {driver.rejectionReason && (
              <div className="flex items-start gap-2 rounded-xl border border-signal-red/20 bg-signal-red/5 px-4 py-3 text-xs text-text-secondary">
                <AlertTriangle size={15} className="mt-0.5 shrink-0 text-signal-red" />
                <span>
                  <span className="font-semibold text-text-primary">Rejected:</span> {driver.rejectionReason}
                </span>
              </div>
            )}
            <Card title="Personal & Contact">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <Field label="Full name">{show(driver.name)}</Field>
                <Field label="Email address">{show(driver.email)}</Field>
                <Field label="Phone number">{show(driver.phone)}</Field>
                <Field label="Date of birth">{show(driver.dateOfBirth)}</Field>
                <Field label="Gender">{show(driver.gender)}</Field>
                <Field label="Employment type">{show(driver.employmentType)}</Field>
                <Field label="Preferred service area">{show(driver.serviceArea)}</Field>
                <Field label="Rating">{show(driver.rating)}</Field>
              </div>
            </Card>

            <Card title="Account">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <Field label="Status">
                  <StatusBadge status={driver.statusSlug} />
                </Field>
                <Field label="Verified">{driver.isVerified ? 'Yes' : 'No'}</Field>
                <Field label="Account active">{driver.isActive ? 'Yes' : 'No'}</Field>
                <Field label="Documents accepted">{driver.termsAccepted ? 'Yes' : 'No'}</Field>
                <Field label="Created">{driver.createdAt ? formatDateTime(driver.createdAt) : DASH}</Field>
                <Field label="Last updated">{driver.updatedAt ? formatDateTime(driver.updatedAt) : DASH}</Field>
              </div>
            </Card>
          </>
        )}

        {activeTab === 'License' && (
          <Card title="Driving License">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <Field label="License number">{show(driver.licenseNumber)}</Field>
              <Field label="License class">{show(driver.licenseClass)}</Field>
              <Field label="Issue date">{show(driver.licenseIssueDate)}</Field>
              <Field label="Expiry date">
                <span className="flex items-center gap-2">
                  {show(driver.licenseExpiryDate)}
                  {validity && <Badge tone={validity.tone}>{validity.label}</Badge>}
                </span>
              </Field>
            </div>
          </Card>
        )}

        {activeTab === 'Vehicle' && (
          <Card title="Vehicle">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-text-muted">Vehicle specifications and assigned class</span>
              <Button size="xs" variant="secondary" icon={Car} onClick={() => setAssignVehicleOpen(true)}>
                Change Vehicle Class
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <Field label="Vehicle type">{show(driver.vehicleType)}</Field>
              <Field label="Registration number">{show(driver.plate)}</Field>
              <Field label="Make">{show(driver.make)}</Field>
              <Field label="Model & year">{show(driver.modelAndYear)}</Field>
              <Field label="Fuel type">{show(driver.fuelType)}</Field>
              <Field label="Transmission">{show(driver.transmission)}</Field>
            </div>
          </Card>
        )}

        {activeTab === 'Documents' && (
          <Card title="Driver Verification Documents">
            <Table
              columns={[
                { key: 'label', label: 'Document' },
                { key: 'file', label: 'Uploaded file', render: (row) => <DocumentPreview file={row.file} onPreview={setPreview} /> },
                {
                  key: 'status',
                  label: 'Status',
                  render: (row) =>
                    isBlank(row.file) ? <Badge tone="slate">Missing</Badge> : <Badge tone="green">Uploaded</Badge>,
                },
              ]}
              rows={documents}
              emptyLabel="No documents on file"
            />
            <p className="text-[11px] text-text-muted">
              Click a thumbnail to open it full size. The API stores these as file names, so a preview appears
              only when the server serves that path; there is no document approval endpoint, so documents are
              listed for review only.
            </p>
          </Card>
        )}

        {activeTab === 'Presence' && (
          <Card title="Presence & Location">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <Field label="Online">
                <StatusBadge status={driver.isOnline ? 'online' : 'offline'} />
              </Field>
              <Field label="Online since">
                {driver.onlineSince ? formatDateTime(driver.onlineSince) : DASH}
              </Field>
              <Field label="Online time today">{duration(driver.onlineStatsSeconds)}</Field>
              <Field label="Last location at">
                {driver.lastLocationAt ? formatDateTime(driver.lastLocationAt) : DASH}
              </Field>
              <Field label="Latitude">{show(driver.latitude)}</Field>
              <Field label="Longitude">{show(driver.longitude)}</Field>
            </div>
          </Card>
        )}
      </div>

      <ImageLightbox
        open={Boolean(preview)}
        src={preview?.src}
        title={preview?.title}
        onClose={() => setPreview(null)}
      />

      <RejectDriverModal
        open={rejectOpen}
        driver={driver}
        onClose={() => setRejectOpen(false)}
        onConfirm={rejectDriver}
      />

      <AssignVehicleTypeModal
        open={assignVehicleOpen}
        driver={driver}
        onClose={() => setAssignVehicleOpen(false)}
        onSuccess={() => load()}
      />
    </PageLayout>
  )
}
