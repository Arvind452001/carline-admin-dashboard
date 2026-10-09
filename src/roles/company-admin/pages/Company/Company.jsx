import PageLayout from '@/layouts/PageLayout'
import Input from '@/shared/components/Input'
import Button from '@/shared/components/Button'

export default function Company() {
  return (
    <PageLayout title="Company profile" description="Details shown to riders and used for billing.">
      <div className="max-w-xl space-y-4 rounded-xl border border-border-subtle bg-surface p-5">
        <Input label="Company name" defaultValue="ABC Taxi" />
        <Input label="Registered city" defaultValue="Bhopal, Madhya Pradesh" />
        <Input label="Support phone" defaultValue="+91 90000 00000" />
        <Input label="VAT number" defaultValue="23AAAAA0000A1Z5" />
        <Button>Save changes</Button>
      </div>
    </PageLayout>
  )
}
