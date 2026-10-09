import PageLayout from '@/layouts/PageLayout'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Button from '@/shared/components/Button'

export default function Settings() {
  return (
    <PageLayout title="Platform settings" description="Global configuration for the entire platform.">
      <div className="max-w-xl space-y-4 rounded-xl border border-border-subtle bg-surface p-5">
        <Input label="Platform name" defaultValue="Carline" />
        <Input label="Support email" defaultValue="support@Carline.com" />
        <Select
          label="Default currency"
          options={[
            { value: 'INR', label: 'Indian Rupee' },
            { value: 'USD', label: 'US Dollar' },
          ]}
        />
        <Select
          label="Default timezone"
          options={[
            { value: 'ist', label: 'Asia/Kolkata (IST)' },
            { value: 'utc', label: 'UTC' },
          ]}
        />
        <Button>Save changes</Button>
      </div>
    </PageLayout>
  )
}
