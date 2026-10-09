import { useState } from 'react'
import { Coins, AlertCircle, FileText, CheckCircle, Search, Calendar, RefreshCw } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Table from '@/shared/components/Table'
import { mockPayments } from '@/shared/utils/mockData'

export default function Payments() {
  const [activeTab, setActiveTab] = useState('Transactions')
  const [searchQuery, setSearchQuery] = useState('')

  // Simulated state for refunds
  const [refunds, setRefunds] = useState([
    { id: 'REF-001', customer: 'Aman Verma', amount: '$45.00', date: '14 Aug 2026', status: 'Processed' },
    { id: 'REF-002', customer: 'Priya Sharma', amount: '$120.00', date: '16 Aug 2026', status: 'Pending Approval' }
  ])

  // Simulated invoices
  const [invoices, setInvoices] = useState([
    { id: 'INV-1029', period: '01 Aug - 15 Aug 2026', total: '$14,250.00', status: 'Due', date: '16 Aug 2026' },
    { id: 'INV-1028', period: '15 Jul - 31 Jul 2026', total: '$28,400.00', status: 'Paid', date: '01 Aug 2026' }
  ])

  const handleProcessRefund = (id) => {
    setRefunds(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, status: 'Processed' }
      }
      return r
    }))
  }

  const tabs = ['Transactions', 'Failed Payments', 'Refunds', 'Invoices', 'Reconciliation']

  return (
    <PageLayout
      title="Payments Dashboard"
      description="Track customer credit transactions, failed payments, process refunds, and download company invoices."
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

      {/* Main content blocks */}
      <div className="space-y-6">
        
        {activeTab === 'Transactions' && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Successful Transactions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-primary">
                <thead>
                  <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                    <th className="py-2.5 px-3">Transaction ID</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {mockPayments.filter(p => p.status === 'success').slice(0, 6).map((p) => (
                    <tr key={p.id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-text-primary">{p.id}</td>
                      <td className="py-3 px-3">{p.customer}</td>
                      <td className="py-3 px-3 font-bold text-taxi-500">${p.amount}</td>
                      <td className="py-3 px-3">{p.method}</td>
                      <td className="py-3 px-3">{p.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Failed Payments' && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Failed Credit Charges</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-primary">
                <thead>
                  <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                    <th className="py-2.5 px-3">Payment ID</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {mockPayments.filter(p => p.status === 'failed').slice(0, 3).map((p) => (
                    <tr key={p.id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-text-primary">{p.id}</td>
                      <td className="py-3 px-3">{p.customer}</td>
                      <td className="py-3 px-3 font-bold text-signal-red">${p.amount}</td>
                      <td className="py-3 px-3 flex items-center gap-1.5 text-text-muted"><AlertCircle size={13} className="text-signal-red" /> Insufficient balance / declined</td>
                      <td className="py-3 px-3">{p.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Refunds' && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Customer Refunds Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-primary">
                <thead>
                  <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                    <th className="py-2.5 px-3">Refund ID</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Refund Amount</th>
                    <th className="py-2.5 px-3">Request Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {refunds.map((r, idx) => (
                    <tr key={idx} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-text-primary">{r.id}</td>
                      <td className="py-3 px-3">{r.customer}</td>
                      <td className="py-3 px-3 font-bold text-taxi-500">{r.amount}</td>
                      <td className="py-3 px-3">{r.date}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          r.status === 'Processed' ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20' : 'bg-amber-500/10 text-amber-600 ring-amber-500/20'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {r.status !== 'Processed' && (
                          <Button size="xs" onClick={() => handleProcessRefund(r.id)}>Approve</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Invoices' && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Periodic Invoices</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-text-primary">
                <thead>
                  <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                    <th className="py-2.5 px-3">Invoice Code</th>
                    <th className="py-2.5 px-3">Billing Cycle</th>
                    <th className="py-2.5 px-3">Total Amount</th>
                    <th className="py-2.5 px-3">Issue Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-surface/50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-text-primary">{inv.id}</td>
                      <td className="py-3 px-3">{inv.period}</td>
                      <td className="py-3 px-3 font-bold text-text-primary">{inv.total}</td>
                      <td className="py-3 px-3">{inv.date}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          inv.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20' : 'bg-amber-500/10 text-amber-600 ring-amber-500/20'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Button size="xs" variant="secondary" icon={FileText}>PDF</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Reconciliation' && (
          <div className="glass-card rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border-subtle pb-2">
              <h3 className="text-sm font-bold text-text-primary">Bank & Account Reconciliation</h3>
              <Button size="sm" icon={RefreshCw}>Run Reconciler</Button>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-border-subtle text-xs text-text-secondary space-y-2">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle size={16} />
                <span className="font-semibold">Reconciliation completed up to 15 Aug 2026.</span>
              </div>
              <p>Total transaction mismatch detected: <strong>0</strong>. Stripe gateway balances match local databases perfectly.</p>
            </div>
          </div>
        )}

      </div>
    </PageLayout>
  )
}
