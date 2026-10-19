import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '@/layouts/PageLayout'
import KpiCard from '@/shared/components/Kpi'
import Button from '@/shared/components/Button'
import Table from '@/shared/components/Table'
import StatusBadge from '@/shared/components/StatusBadge'
import { kpiTrend, mockDrivers } from '@/shared/utils/mockData'
import { Clock, Users, Car, ShieldAlert, Award, ArrowRight } from 'lucide-react'
import {
  listCompanyDrivers,
  getWaitingChargesPolicy,
  DRIVER_STATUS_ENUM
} from '../../services/driverManagerApi'

export default function Dashboard() {
  const navigate = useNavigate()
  const [drivers, setDrivers] = useState([])
  const [totalDrivers, setTotalDrivers] = useState(mockDrivers.length)
  const [pendingCount, setPendingCount] = useState(0)
  const [onlineCount, setOnlineCount] = useState(0)
  const [waitingPolicy, setWaitingPolicy] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true)
      try {
        const [driversRes, policyRes] = await Promise.all([
          listCompanyDrivers({ page: 1, limit: 10 }),
          getWaitingChargesPolicy().catch(() => null),
        ])

        if (driversRes?.drivers && driversRes.drivers.length > 0) {
          setDrivers(driversRes.drivers)
          setTotalDrivers(driversRes.total || driversRes.drivers.length)
          setPendingCount(driversRes.drivers.filter(d => d.status === DRIVER_STATUS_ENUM.PENDING_APPROVAL).length)
          setOnlineCount(driversRes.drivers.filter(d => d.isOnline).length)
        } else {
          setDrivers(mockDrivers.slice(0, 6))
        }

        if (policyRes) {
          setWaitingPolicy(policyRes)
        }
      } catch (err) {
        setDrivers(mockDrivers.slice(0, 6))
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const columns = [
    {
      key: 'name',
      label: 'Driver',
      render: (r) => (
        <div>
          <span className="font-bold text-text-primary text-xs">{r.name}</span>
          <span className="block text-[10px] text-text-muted">{r.phone || r.email || r.id}</span>
        </div>
      ),
    },
    {
      key: 'vehicleType',
      label: 'Vehicle Class',
      render: (r) => (
        <span className="inline-flex items-center gap-1 rounded bg-taxi-500/10 text-taxi-600 px-2 py-0.5 text-[11px] font-semibold">
          <Car size={11} />
          {r.vehicleType || 'Sedan'}
        </span>
      ),
    },
    {
      key: 'plate',
      label: 'Plate',
      render: (r) => <span className="font-mono text-xs">{r.plate || '-'}</span>,
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (r) => (
        <span className="flex items-center gap-1 text-xs font-semibold">
          <Award size={12} className="text-amber-500" /> {r.rating || '4.8'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <StatusBadge status={r.statusSlug || r.status} />,
    },
  ]

  return (
    <PageLayout
      title="Driver Operations Dashboard"
      description="Fleet management, driver approvals, vehicle classifications, and waiting charges policy."
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        <KpiCard
          label="Total Fleet Drivers"
          value={totalDrivers}
          delta={5.2}
          trend={kpiTrend(5)}
          tone="taxi"
        />
        <KpiCard
          label="Pending Applications"
          value={pendingCount || '2'}
          delta={-1}
          trend={kpiTrend(9)}
          tone="amber"
        />
        <KpiCard
          label="Online on Shift"
          value={onlineCount || mockDrivers.filter((d) => d.status === 'online').length}
          delta={2.4}
          trend={kpiTrend(14)}
          tone="green"
        />
        <KpiCard
          label="Waiting Grace / Rate"
          value={waitingPolicy ? `${waitingPolicy.gracePeriodMinutes}m / $${waitingPolicy.waitingChargePerMinute}` : '5m / $0.30'}
          delta={0}
          trend={kpiTrend(2)}
          tone="blue"
        />
      </div>

      {/* Quick Action Banner */}
      <div className="glass-card rounded-2xl p-5 mb-6 border border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-taxi-500/10 text-taxi-500 flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <h3 className="font-bold text-text-primary text-sm">Company Waiting Charges & Ride Waivers</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Review company waiting policy ({waitingPolicy?.gracePeriodMinutes || 5} min grace period, ${waitingPolicy?.waitingChargePerMinute || '0.30'}/min) or adjust/waive ride waiting fees.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={ArrowRight}
            onClick={() => navigate('/driver-manager/waiting-charges')}
          >
            Manage Waiting Charges
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/driver-manager/driver-list')}
          >
            View Driver Roster
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-sm font-semibold text-text-primary">Recently Active Drivers</h2>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => navigate('/driver-manager/driver-list')}
          >
            View All Drivers
          </Button>
        </div>
        <Table columns={columns} rows={drivers.slice(0, 6)} keyField="id" />
      </div>
    </PageLayout>
  )
}
