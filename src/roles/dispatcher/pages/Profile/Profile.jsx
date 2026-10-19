import { useState, useEffect } from 'react'
import {
  User, Building2, Phone, Mail, MapPin, Calendar, Clock,
  ShieldCheck, RefreshCw, Copy, Check, CheckCircle2, AlertCircle,
  FileText, ExternalLink, Sparkles, Navigation, Globe, CreditCard,
  Building, Radio, CheckCircle, Car, Users
} from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import { dispatcherProfileApi } from '../../services/dispatcherProfileApi'

function formatDate(isoStr) {
  if (!isoStr) return '—'
  try {
    const d = new Date(isoStr)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return String(isoStr)
  }
}

export default function DispatcherProfile() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [copiedKey, setCopiedKey] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [logoError, setLogoError] = useState(false)

  const fetchProfile = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const data = await dispatcherProfileApi.getProfile()
      setProfile(data)
    } catch (err) {
      console.error('Error fetching dispatcher profile:', err)
      setErrorMsg(err?.message || 'Failed to load profile data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleCopy = (key, text) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(''), 2000)
  }

  const p = profile?.personal
  const c = profile?.company

  return (
    <PageLayout
      title="Dispatcher Profile"
      description="Manage your dispatcher account credentials, personal contact, and affiliated fleet company details."
      actions={
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          onClick={() => {
            fetchProfile()
            setSuccessMsg('Profile data re-synchronized.')
            setTimeout(() => setSuccessMsg(''), 3000)
          }}
          disabled={loading}
        >
          Refresh Data
        </Button>
      }
    >
      {/* Toast Notifications */}
      {successMsg && (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-xs font-semibold text-emerald-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="hover:opacity-75 cursor-pointer">✕</button>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-xs font-semibold text-rose-600">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="hover:opacity-75 cursor-pointer">✕</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-44 rounded-2xl bg-surface border border-border-subtle" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-80 rounded-2xl bg-surface border border-border-subtle" />
            <div className="h-80 rounded-2xl bg-surface border border-border-subtle" />
          </div>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Top Hero Banner */}
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden border border-border-subtle shadow-sm bg-gradient-to-r from-surface via-surface to-slate-50/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              
              {/* User Avatar + Core Info */}
              <div className="flex items-start sm:items-center gap-5">
                <div className="relative">
                  {p?.avatar ? (
                    <img
                      src={p.avatar}
                      alt={p?.fullName || 'Avatar'}
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md bg-surface-raised"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-taxi-500 to-amber-600 text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-white">
                      {(p?.fullName?.[0] || 'D').toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white" title="Active & Verified">
                    <Check size={11} strokeWidth={3} />
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl font-bold font-display text-text-primary capitalize">
                      {p?.fullName || 'Dispatcher'}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-taxi-500/10 text-taxi-600 border border-taxi-500/20">
                      <ShieldCheck size={12} />
                      {p?.role || 'DISPATCHER'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {p?.status || 'ACTIVE'}
                    </span>
                  </div>

                  <p className="text-xs text-text-muted flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 text-text-secondary">
                      <Building size={13} className="text-taxi-500" />
                      <strong>{c?.displayName || 'ABC Taxi'}</strong> ({c?.companyId || 'CMP-003'})
                    </span>
                    <span>•</span>
                    <span>Indore Operations Center</span>
                  </p>

                  {/* ID Chip */}
                  <div className="pt-1 flex items-center gap-2 text-xs">
                    <span className="text-text-muted text-[11px]">Dispatcher ID:</span>
                    <code className="bg-surface-raised px-2 py-0.5 rounded text-[11px] font-mono text-text-secondary border border-border-subtle">
                      {p?.id}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy('userId', p?.id)}
                      className="p-1 rounded hover:bg-slate-100 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                      title="Copy ID"
                    >
                      {copiedKey === 'userId' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    </button>
                    {copiedKey === 'userId' && <span className="text-[11px] text-emerald-600 font-semibold">Copied!</span>}
                  </div>
                </div>
              </div>

              {/* Quick Contacts Actions */}
              <div className="flex flex-wrap md:flex-col gap-2.5 items-start md:items-end">
                {p?.phone && (
                  <a
                    href={`tel:${p.phone}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors shadow-2xs"
                  >
                    <Phone size={13} />
                    <span>{p.phone}</span>
                  </a>
                )}
                {p?.email && (
                  <a
                    href={`mailto:${p.email}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface hover:bg-slate-50 text-text-secondary hover:text-text-primary border border-border-subtle text-xs font-medium transition-colors shadow-2xs"
                  >
                    <Mail size={13} />
                    <span>{p.email}</span>
                  </a>
                )}
              </div>

            </div>
          </div>

          {/* 2-Column Main Section: Personal Info & Company Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left Card: Personal & Account Profile */}
            <div className="glass-card rounded-2xl p-5 border border-border-subtle shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <h3 className="font-display text-sm font-bold text-text-primary flex items-center gap-2">
                  <User size={16} className="text-taxi-500" />
                  Personal & Dispatcher Credentials
                </h3>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={11} /> Verified Account
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-surface rounded-xl border border-border-subtle">
                    <span className="text-[10px] text-text-muted uppercase font-bold block">First Name</span>
                    <span className="font-semibold text-text-primary text-sm mt-0.5 block">{p?.firstName || p?.fullName || '—'}</span>
                  </div>
                  <div className="p-3 bg-surface rounded-xl border border-border-subtle">
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Last Name</span>
                    <span className="font-semibold text-text-primary text-sm mt-0.5 block">{p?.lastName || '—'}</span>
                  </div>
                </div>

                <div className="p-3 bg-surface rounded-xl border border-border-subtle flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Official Email</span>
                    <span className="font-semibold text-text-primary text-xs mt-0.5 block">{p?.email || '—'}</span>
                  </div>
                  <button
                    onClick={() => handleCopy('email', p?.email)}
                    className="p-1.5 rounded hover:bg-surface-raised text-text-muted hover:text-text-primary cursor-pointer"
                    title="Copy Email"
                  >
                    {copiedKey === 'email' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                </div>

                <div className="p-3 bg-surface rounded-xl border border-border-subtle flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Phone Number</span>
                    <span className="font-semibold text-text-primary text-xs mt-0.5 block">{p?.phone || '—'}</span>
                  </div>
                  <button
                    onClick={() => handleCopy('phone', p?.phone)}
                    className="p-1.5 rounded hover:bg-surface-raised text-text-muted hover:text-text-primary cursor-pointer"
                    title="Copy Phone"
                  >
                    {copiedKey === 'phone' ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-surface rounded-xl border border-border-subtle">
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Account Created</span>
                    <span className="font-semibold text-text-primary text-xs mt-0.5 block">{formatDate(p?.createdAt)}</span>
                  </div>
                  <div className="p-3 bg-surface rounded-xl border border-border-subtle">
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Last Synchronized</span>
                    <span className="font-semibold text-text-primary text-xs mt-0.5 block">{formatDate(p?.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Affiliated Company Profile */}
            <div className="glass-card rounded-2xl p-5 border border-border-subtle shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <h3 className="font-display text-sm font-bold text-text-primary flex items-center gap-2">
                  <Building2 size={16} className="text-taxi-500" />
                  Affiliated Company Profile
                </h3>
                <span className="text-[11px] font-semibold text-text-secondary bg-surface border border-border-subtle px-2 py-0.5 rounded-full">
                  ID: {c?.companyId || 'CMP-003'}
                </span>
              </div>

              {c ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-surface rounded-xl border border-border-subtle flex items-center gap-4">
                    {c?.branding?.logo && !logoError ? (
                      <img
                        src={c.branding.logo}
                        alt="Company Logo"
                        onError={() => setLogoError(true)}
                        className="w-12 h-12 rounded-xl object-contain bg-surface-raised p-1 border border-border-subtle shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-taxi-500/10 text-taxi-600 border border-taxi-500/20 flex items-center justify-center shrink-0">
                        <Building2 size={22} />
                      </div>
                    )}
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="font-bold text-sm text-text-primary truncate">{c?.legalName}</h4>
                      <p className="text-[11px] text-text-muted">
                        Trade Name: <strong>{c?.displayName}</strong> • Code: <strong>{c?.companyCode}</strong>
                      </p>
                      <p className="text-[10px] text-text-secondary">
                        Registration: <code>{c?.registrationNumber}</code>
                      </p>
                    </div>
                  </div>

                  {/* Company Address */}
                  <div className="p-3.5 bg-surface rounded-xl border border-border-subtle space-y-1">
                    <span className="text-[10px] text-text-muted uppercase font-bold flex items-center gap-1">
                      <MapPin size={12} className="text-rose-500" /> Official Operational Headquarters
                    </span>
                    <p className="font-semibold text-text-primary text-xs pt-0.5">
                      {c?.address?.streetAddress}, {c?.address?.city}, {c?.address?.state} {c?.address?.zipCode}, {c?.address?.country}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      Timezone: {c?.address?.timezone || 'IST (UTC+5:30)'}
                    </p>
                  </div>

                  {/* Primary Contact Person */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-surface rounded-xl border border-border-subtle space-y-1">
                      <span className="text-[10px] text-text-muted uppercase font-bold block">Primary Company Contact</span>
                      <p className="font-semibold text-text-primary text-xs">{c?.primaryContact?.name || 'John Does'}</p>
                      <p className="text-[11px] text-text-muted flex items-center gap-1">
                        <Phone size={10} /> {c?.primaryContact?.phone || '+91 9988776655'}
                      </p>
                    </div>

                    <div className="p-3 bg-surface rounded-xl border border-border-subtle space-y-1">
                      <span className="text-[10px] text-text-muted uppercase font-bold block">Accounts & Billing</span>
                      <p className="font-semibold text-text-primary text-xs">{c?.billing?.contactName || 'Accounts Dept'}</p>
                      <p className="text-[11px] text-text-muted flex items-center gap-1">
                        <Mail size={10} /> {c?.billing?.email || 'billing@abctaxi.com'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-text-muted">
                  Company details unavailable.
                </div>
              )}
            </div>

          </div>

          {/* Bottom Card: Dispatcher Privileges & Access Scope */}
          <div className="glass-card rounded-2xl p-5 border border-border-subtle shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="font-display text-sm font-bold text-text-primary flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500" />
                Active Dispatcher Capabilities & Operational Scope
              </h3>
              <span className="text-[11px] font-mono text-text-muted">Role: DISPATCHER</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
              <div className="p-3 rounded-xl bg-surface border border-border-subtle flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  <Radio size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-text-primary text-xs">Live Dispatch & Queue</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">Real-time ride dispatching, re-routing, and instant driver assignments.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-border-subtle flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                  <Car size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-text-primary text-xs">Fleet & Driver Profiles</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">Full access to company fleet drivers, documents, vehicle plates, and ratings.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-border-subtle flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <Navigation size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-text-primary text-xs">Live GPS Map Tracking</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">Interactive Google Maps radar with active vehicle telemetry and status.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-border-subtle flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                  <Calendar size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-text-primary text-xs">Scheduled Bookings</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">Manage advance bookings, scheduled dispatches, and route pre-allocations.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-border-subtle flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                  <Users size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-text-primary text-xs">Customer Inquiries</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">Access passenger contact details and quick telephone links for rider assistance.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-border-subtle flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0">
                  <CreditCard size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-text-primary text-xs">Fare & Payment Review</h4>
                  <p className="text-[11px] text-text-muted mt-0.5">Inspect fare calculations, wallet payments, base rates, and distance charges.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </PageLayout>
  )
}
