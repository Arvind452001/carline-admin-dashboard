import PageLayout from '@/layouts/PageLayout'
import SupportPanel from '../../components/SupportPanel'
import Button from '@/shared/components/Button'
import { Plus } from 'lucide-react'

export default function Support() {
  return (
    <PageLayout title="Support" description="Open and resolved customer support tickets." actions={<Button icon={Plus}>New ticket</Button>}>
      <div className="rounded-xl border border-border-subtle bg-surface p-4">
        <SupportPanel />
      </div>
    </PageLayout>
  )
}
