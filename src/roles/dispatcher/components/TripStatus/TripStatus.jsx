import StatusBadge from '@/shared/components/StatusBadge'

const STEPS = ['pending', 'dispatched', 'ongoing', 'completed']

export default function TripStatus({ status }) {
  const idx = STEPS.indexOf(status)
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={
              'h-2 w-2 rounded-full ' + (i <= idx ? 'bg-taxi-500' : 'bg-border-strong')
            }
          />
          {i < STEPS.length - 1 && <div className={'h-px w-6 ' + (i < idx ? 'bg-taxi-500' : 'bg-border-strong')} />}
        </div>
      ))}
      <span className="ml-2">
        <StatusBadge status={status} />
      </span>
    </div>
  )
}
