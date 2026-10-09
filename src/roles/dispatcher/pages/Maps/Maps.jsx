import PageLayout from '@/layouts/PageLayout'
import LiveDriverMap from '../../components/LiveDriverMap'

export default function Maps() {
  return (
    <PageLayout title="Maps" description="Live positions of every driver currently on shift.">
      <LiveDriverMap height={480} />
    </PageLayout>
  )
}
