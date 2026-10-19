import PageLayout from '@/layouts/PageLayout'
import { useNotificationStore } from '@/store/notificationStore'
import Button from '@/shared/components/Button'
import { CheckCheck } from 'lucide-react'

export default function Notifications() {
  const { notifications, markAllRead } = useNotificationStore()
  return (
    <PageLayout title="Notifications" description="Alerts and events for your company." actions={<Button icon={CheckCheck} variant="secondary" onClick={markAllRead}>Mark all read</Button>}>
      <div className="divide-y divide-border-subtle rounded-xl border border-border-subtle bg-surface">
        {notifications.map((n) => (
          <div key={n.id} className="flex items-center gap-3 px-4 py-3">
            <span className={`h-2 w-2 rounded-full ${n.read ? 'bg-transparent' : 'bg-taxi-500'}`} />
            <div className="flex-1">
              <p className="text-sm text-text-primary">{n.title}</p>
              <p className="mt-0.5 text-xs text-text-muted">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
