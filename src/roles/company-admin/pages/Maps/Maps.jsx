import PageLayout from '@/layouts/PageLayout'
import LiveDriverMap from '@/roles/dispatcher/components/LiveDriverMap'

export default function Maps() {
  return (
    <PageLayout title="Maps" description="Live view of drivers and demand across your service area.">
      <LiveDriverMap height={520} />
    </PageLayout>
  )
}
