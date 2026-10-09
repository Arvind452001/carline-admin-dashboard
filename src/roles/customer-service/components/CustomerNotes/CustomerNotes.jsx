import { useState } from 'react'
import Button from '@/shared/components/Button'
import { Plus } from 'lucide-react'

const initialNotes = [
  { id: 1, text: 'Requested wheelchair-accessible vehicle for future rides.', author: 'Divya (CS)', time: '2d ago' },
  { id: 2, text: 'Reported a lost item — resolved, item returned.', author: 'Aman (CS)', time: '1w ago' },
]

export default function CustomerNotes() {
  const [notes, setNotes] = useState(initialNotes)
  const [draft, setDraft] = useState('')

  function addNote() {
    if (!draft.trim()) return
    setNotes([{ id: Date.now(), text: draft, author: 'You', time: 'just now' }, ...notes])
    setDraft('')
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add an internal note…"
          className="flex-1 rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-taxi-500 focus:outline-none"
        />
        <Button size="sm" icon={Plus} onClick={addNote}>Add</Button>
      </div>
      <div className="space-y-2">
        {notes.map((n) => (
          <div key={n.id} className="rounded-lg border border-border-subtle bg-surface px-3 py-2.5">
            <p className="text-sm text-text-secondary">{n.text}</p>
            <p className="mt-1 text-xs text-text-muted">{n.author} · {n.time}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
