import Button from '@/shared/components/Button'

export default function VersionHistoryTab({ versionHistory, setVersionHistory }) {
  return (
    <div className="glass-card p-6 rounded-2xl space-y-4">
      <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Fare Configuration Audit Trail</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-text-primary">
          <thead>
            <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
              <th className="py-2.5 px-3">Version</th>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Updated By</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Change Description</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-xs">
            {versionHistory.map((vh, idx) => (
              <tr key={idx} className="hover:bg-surface/50 transition-colors">
                <td className="py-3 px-3 font-bold text-taxi-500 font-mono">{vh.version}</td>
                <td className="py-3 px-3 text-text-muted font-semibold">{vh.date}</td>
                <td className="py-3 px-3 font-medium">{vh.author}</td>
                <td className="py-3 px-3">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${vh.status === 'Current' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-surface text-text-muted border border-border-subtle'}`}>
                    {vh.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-text-secondary italic">{vh.description}</td>
                <td className="py-3 px-3 text-right">
                  <div className="flex gap-1.5 justify-end">
                    <Button size="xs" variant="secondary" onClick={() => alert(`Previewing version ${vh.version}`)}>Preview</Button>
                    <Button size="xs" variant="secondary" onClick={() => alert(`Comparing current configuration with version ${vh.version}`)}>Compare</Button>
                    {vh.status !== 'Current' && (
                      <Button size="xs" variant="secondary" onClick={() => {
                        setVersionHistory(prev => prev.map(x => x.version === vh.version ? { ...x, status: 'Current' } : { ...x, status: 'Previous' }))
                        alert(`Restored to version ${vh.version}!`)
                      }}>Restore</Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
