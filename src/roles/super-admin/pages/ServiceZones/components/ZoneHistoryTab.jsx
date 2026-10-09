export default function ZoneHistoryTab({ auditLogs }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Geofence Modification History Logs</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-text-primary">
          <thead>
            <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">User Role</th>
              <th className="py-2.5 px-3">Geofence Zone</th>
              <th className="py-2.5 px-3 text-right">Action Recorded</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-xs">
            {auditLogs.map((log, idx) => (
              <tr key={idx} className="hover:bg-surface/50 transition-colors">
                <td className="py-3 px-3 font-semibold text-text-muted">{log.date}</td>
                <td className="py-3 px-3">{log.user}</td>
                <td className="py-3 px-3 font-bold text-text-primary">{log.zone}</td>
                <td className="py-3 px-3 text-right font-semibold text-taxi-500">{log.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
