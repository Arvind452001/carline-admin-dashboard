import PageLayout from '@/layouts/PageLayout'
import Select from '@/shared/components/Select'
import Input from '@/shared/components/Input'
import Button from '@/shared/components/Button'

export default function ReportSettings() {
  return (
    <PageLayout title="Report settings" description="How and when your scheduled reports are delivered.">
      <div className="max-w-xl space-y-4 rounded-xl border border-border-subtle bg-surface p-5">
        <Select
          label="Default export format"
          options={[
            { value: 'csv', label: 'CSV' },
            { value: 'xlsx', label: 'Excel (XLSX)' },
            { value: 'pdf', label: 'PDF' },
          ]}
        />
        <Select
          label="Delivery frequency"
          options={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
          ]}
        />
        <Input label="Delivery email" defaultValue="reports@abctaxi.com" />
        <Button>Save preferences</Button>
      </div>
    </PageLayout>
  )
}
