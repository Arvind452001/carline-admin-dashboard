import { useState } from 'react'
import { Coins, Clock, CheckCircle, Calendar, ArrowRight, UserCheck } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import StatusBadge from '@/shared/components/StatusBadge'
import { mockPayouts } from '@/shared/utils/mockData'

export default function Payouts() {
  const [activeTab, setActiveTab] = useState('Driver Earnings')
  const [payoutsList, setPayoutsList] = useState([
    { id: 'PO-901', driver: 'Mike Johnson', amount: '$420.00', status: 'Pending Approval', date: '16 Aug 2026' },
    { id: 'PO-902', driver: 'Sarah Lee', amount: '$680.00', status: 'Approved', date: '15 Aug 2026' },
    { id: 'PO-903', driver: 'Alex Kumar', amount: '$310.00', status: 'Paid', date: '10 Aug 2026' }
  ])

  const handleApprove = (id) => {
    setPayoutsList(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: 'Approved' }
      }
      return p
    }))
  }

  const handlePay = (id) => {
    setPayoutsList(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: 'Paid' }
      }
      return p
    }))
  }

  const tabs = ['Driver Earnings', 'Pending Payouts', 'Approved', 'Paid']

  return (
    <PageLayout
      title="Payouts Engine"
      description="Manage driver weekly balances, review payout requests, and verify direct deposits."
    >
      {/* Tabs */}
      <div className="flex border-b border-border-strong overflow-x-auto pb-px mb-6 scrollbar-none">
        {tabs.map((tab) => (
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

      {/* Main Blocks */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">{activeTab} Details</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-primary">
            <thead>
              <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                <th className="py-2.5 px-3">Payout ID</th>
                <th className="py-2.5 px-3">Driver Name</th>
                <th className="py-2.5 px-3">Amount Due</th>
                <th className="py-2.5 px-3">Request Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {payoutsList
                .filter(p => {
                  if (activeTab === 'Pending Payouts') return p.status === 'Pending Approval'
                  if (activeTab === 'Approved') return p.status === 'Approved'
                  if (activeTab === 'Paid') return p.status === 'Paid'
                  return true // Driver Earnings shows all
                })
                .map((p, idx) => (
                  <tr key={idx} className="hover:bg-surface/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-text-primary">{p.id}</td>
                    <td className="py-3 px-3 font-medium">{p.driver}</td>
                    <td className="py-3 px-3 font-bold text-taxi-500">{p.amount}</td>
                    <td className="py-3 px-3">{p.date}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                        p.status === 'Paid' 
                          ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20' 
                          : p.status === 'Approved'
                          ? 'bg-purple-500/10 text-signal-purple ring-purple-500/20'
                          : 'bg-amber-500/10 text-amber-600 ring-amber-500/20'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex gap-2 items-center justify-end">
                        {p.status === 'Pending Approval' && (
                          <Button
                            size="sm"
                            icon={UserCheck}
                            onClick={() => handleApprove(p.id)}
                            className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 active:bg-emerald-500/30 border border-emerald-500/20 font-bold tracking-wide transition-all shadow-sm rounded-lg"
                          >
                            Approve
                          </Button>
                        )}
                        {p.status === 'Approved' && (
                          <Button
                            size="sm"
                            icon={Coins}
                            onClick={() => handlePay(p.id)}
                            className="bg-taxi-500 text-ink hover:bg-taxi-400 active:bg-taxi-600 font-bold tracking-wide transition-all shadow-sm rounded-lg"
                          >
                            Process Transfer
                          </Button>
                        )}
                        {p.status === 'Paid' && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                            <CheckCircle size={14} /> Completed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              {payoutsList.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-text-muted">
                    No payouts matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageLayout>
  )
}
