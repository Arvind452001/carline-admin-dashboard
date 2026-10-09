import { useState } from 'react'
import { Calendar, Download, FileText, ArrowUpRight, TrendingUp, Users, Car, CheckCircle } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'

export default function Reports() {
  const [reportType, setReportType] = useState('Revenue')
  const [startDate, setStartDate] = useState('2026-08-01')
  const [endDate, setEndDate] = useState('2026-08-15')
  const [exportFormat, setExportFormat] = useState('PDF')

  const reportOptions = [
    { value: 'Revenue', label: 'Revenue Report' },
    { value: 'Trips', label: 'Trips Summary' },
    { value: 'Drivers', label: 'Driver Activity' },
    { value: 'Customers', label: 'Customer Growth' },
    { value: 'Dispatch', label: 'Dispatch Performance' },
    { value: 'Payments', label: 'Payments Report' },
    { value: 'Payouts', label: 'Payouts Summary' },
    { value: 'Vehicles', label: 'Vehicle Logs' },
    { value: 'Cancellations', label: 'Trip Cancellations' },
    { value: 'Unassigned Trips', label: 'Unassigned Bookings' },
    { value: 'Driver Performance', label: 'Driver Performance Scores' },
    { value: 'Customer Activity', label: 'Active Customers' }
  ]

  const handleExport = (e) => {
    e.preventDefault()
    // Trigger mock download
    alert(`Exporting ${reportType} report from ${startDate} to ${endDate} in ${exportFormat} format.`)
  }

  return (
    <PageLayout
      title="Company Reports"
      description="Compile operational indicators, financial statements, and driver metrics for your company."
    >
      {/* Filtering Header Card */}
      <form onSubmit={handleExport} className="glass-card p-5 rounded-2xl space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <Select
              label="Report Category"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              options={reportOptions}
            />
          </div>
          <div>
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <Select
              label="Export Format"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              options={[
                { value: 'PDF', label: 'Acrobat PDF (.pdf)' },
                { value: 'Excel', label: 'Microsoft Excel (.xlsx)' },
                { value: 'CSV', label: 'Comma Separated Value (.csv)' }
              ]}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" icon={Download}>Export Report</Button>
        </div>
      </form>

      {/* Report Insights Visualizer */}
      <div className="glass-card rounded-2xl p-6 space-y-6">
        <div className="border-b border-border-subtle pb-3 flex justify-between items-center">
          <h3 className="text-sm font-bold text-text-primary">{reportType} Analytics Insights</h3>
          <span className="text-xs text-text-muted">Range: {startDate} to {endDate}</span>
        </div>

        {/* Dynamic Card Grids based on report category */}
        {reportType === 'Revenue' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface p-4 rounded-xl border border-border-subtle">
              <p className="text-xs text-text-muted uppercase font-bold">Total Fare Bookings</p>
              <p className="text-2xl font-black text-text-primary mt-1">$45,280.00</p>
              <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 mt-1 font-medium"><ArrowUpRight size={10} /> +12.4% vs last period</span>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-border-subtle">
              <p className="text-xs text-text-muted uppercase font-bold">Company Commission (15%)</p>
              <p className="text-2xl font-black text-taxi-500 mt-1">$6,792.00</p>
              <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 mt-1 font-medium"><ArrowUpRight size={10} /> +10.2% vs last period</span>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-border-subtle">
              <p className="text-xs text-text-muted uppercase font-bold">Promotions Discounted</p>
              <p className="text-2xl font-black text-signal-red mt-1">-$2,120.00</p>
              <span className="text-[10px] text-text-muted mt-1 block">Active promo codes: 4</span>
            </div>
          </div>
        )}

        {reportType === 'Trips' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface p-4 rounded-xl border border-border-subtle">
              <p className="text-xs text-text-muted uppercase font-bold">Total Trips Completed</p>
              <p className="text-2xl font-black text-text-primary mt-1">1,842</p>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-border-subtle">
              <p className="text-xs text-text-muted uppercase font-bold">Average Trip Distance</p>
              <p className="text-2xl font-black text-text-primary mt-1">8.4 km</p>
            </div>
            <div className="bg-surface p-4 rounded-xl border border-border-subtle">
              <p className="text-xs text-text-muted uppercase font-bold">Average Trip Duration</p>
              <p className="text-2xl font-black text-text-primary mt-1">18.5 mins</p>
            </div>
          </div>
        )}

        {/* Fallback metrics for other reports */}
        {!['Revenue', 'Trips'].includes(reportType) && (
          <div className="bg-surface p-6 rounded-xl border border-border-subtle flex flex-col items-center justify-center text-center space-y-3">
            <FileText size={40} className="text-taxi-500 animate-bounce" />
            <div>
              <h4 className="text-sm font-bold text-text-primary">{reportType} Report Compiled Successfully</h4>
              <p className="text-xs text-text-muted mt-1">Click the 'Export Report' button above to download full spreadsheet analysis.</p>
            </div>
          </div>
        )}

      </div>
    </PageLayout>
  )
}
