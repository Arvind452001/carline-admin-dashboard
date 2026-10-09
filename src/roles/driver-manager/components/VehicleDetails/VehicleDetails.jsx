export default function VehicleDetails({ driver }) {
  const fields = [
    ['Model', driver.vehicle],
    ['Plate number', driver.plate],
    ['Colour', 'White'],
    ['Year', '2022'],
    ['Fitness certificate', 'Valid till Dec 2026'],
  ]
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {fields.map(([label, value]) => (
        <div key={label}>
          <p className="text-xs text-text-muted">{label}</p>
          <p className="mt-0.5 text-sm text-text-secondary">{value}</p>
        </div>
      ))}
    </div>
  )
}
