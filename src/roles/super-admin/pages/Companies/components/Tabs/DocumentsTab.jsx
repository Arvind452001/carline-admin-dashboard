import { useState } from 'react'
import Button from '@/shared/components/Button'
import Modal from '@/shared/components/Modal'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import { Plus, FileText } from 'lucide-react'

export default function DocumentsTab({ docs, setDocs }) {
  const [showUploadDocModal, setShowUploadDocModal] = useState(false)
  const [newDoc, setNewDoc] = useState({ type: 'Business License', name: '', expiry: '' })

  const handleUploadDoc = (e) => {
    e.preventDefault()
    if (!newDoc.name || !newDoc.expiry) return

    const expiryDate = new Date(newDoc.expiry)
    const today = new Date()
    const diffTime = expiryDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    let status = 'Valid'
    if (diffDays < 0) status = 'Expired'
    else if (diffDays <= 30) status = 'Expiring Soon'

    setDocs((prev) => [...prev, { ...newDoc, status }])
    setNewDoc({ type: 'Business License', name: '', expiry: '' })
    setShowUploadDocModal(false)
  }

  return (
    <>
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border-subtle pb-2">
          <h3 className="text-sm font-bold text-text-primary">Company Documents</h3>
          <Button icon={Plus} size="sm" onClick={() => setShowUploadDocModal(true)}>
            Upload Document
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {docs.map((doc, idx) => (
            <div key={idx} className="bg-surface p-4 rounded-xl border border-border-subtle flex items-start gap-3">
              <div className="p-3 bg-taxi-500/10 text-taxi-500 rounded-xl">
                <FileText size={20} />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-sm font-bold text-text-primary">{doc.type}</h4>
                <p className="text-xs text-text-secondary">File: {doc.name}</p>
                <p className="text-xs text-text-muted">Expiry: {doc.expiry}</p>
                <div className="pt-1">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                    ['valid', 'approved', 'active'].includes(String(doc.status).toLowerCase())
                      ? 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 ring-amber-500/20'
                  }`}>
                    {doc.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Document Modal */}
      <Modal
        open={showUploadDocModal}
        onClose={() => setShowUploadDocModal(false)}
        title="Upload Document"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowUploadDocModal(false)}>Cancel</Button>
            <Button onClick={handleUploadDoc}>Upload</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Document Type"
            value={newDoc.type}
            onChange={(e) => setNewDoc((p) => ({ ...p, type: e.target.value }))}
            options={[
              { value: 'Business License', label: 'Business License' },
              { value: 'Insurance Certificate', label: 'Insurance Certificate' },
              { value: 'Tax Document', label: 'Tax Document' },
              { value: 'Operating Permit', label: 'Operating Permit' },
            ]}
          />
          <Input
            label="Document / File Name"
            value={newDoc.name}
            onChange={(e) => setNewDoc((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. business_permit_2026.pdf"
          />
          <Input
            label="Expiry Date"
            type="date"
            value={newDoc.expiry}
            onChange={(e) => setNewDoc((p) => ({ ...p, expiry: e.target.value }))}
          />
        </div>
      </Modal>
    </>
  )
}
