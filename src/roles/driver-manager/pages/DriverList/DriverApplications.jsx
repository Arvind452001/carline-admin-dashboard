import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, FileText, ClipboardList } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import Modal from '@/shared/components/Modal'

export default function DriverApplications() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([
    { id: 'APP-101', name: 'Vikram Rao', date: '14 Aug 2026', vehicle: 'Toyota Camry', status: 'Pending Verification', license: 'DL-998822', email: 'vikram@yahoo.com' },
    { id: 'APP-102', name: 'Rohit Iyer', date: '15 Aug 2026', vehicle: 'Honda Civic', status: 'Pending Verification', license: 'DL-110022', email: 'rohit@gmail.com' }
  ])

  const [selectedApp, setSelectedApp] = useState(null)
  const [bgChecks, setBgChecks] = useState({
    identity: true,
    criminal: false,
    records: true
  })

  const handleReview = (app) => {
    setSelectedApp(app)
    setBgChecks({ identity: true, criminal: false, records: true })
  }

  const handleApprove = () => {
    setApplications(prev => prev.filter(a => a.id !== selectedApp.id))
    setSelectedApp(null)
  }

  const handleReject = () => {
    setApplications(prev => prev.filter(a => a.id !== selectedApp.id))
    setSelectedApp(null)
  }

  const handleRequestChanges = () => {
    setSelectedApp(null)
  }

  return (
    <PageLayout
      title="Pending Applications"
      description="Verify applicant document credentials, run background identity reports, and approve drivers to join the fleet."
      actions={
        <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/driver-manager/driver-list')}>
          Back to Drivers
        </Button>
      }
    >
      <div className="glass-card rounded-2xl overflow-hidden p-6 space-y-4">
        <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Onboarding Review Queue</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text-primary">
            <thead>
              <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                <th className="py-2.5 px-3">Driver Name</th>
                <th className="py-2.5 px-3">Applied Date</th>
                <th className="py-2.5 px-3">License Number</th>
                <th className="py-2.5 px-3">Vehicle Preference</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-3 font-semibold text-text-primary">{app.name}</td>
                  <td className="py-3 px-3">{app.date}</td>
                  <td className="py-3 px-3">{app.license}</td>
                  <td className="py-3 px-3">{app.vehicle}</td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center rounded-md bg-purple-500/10 px-2 py-0.5 text-xs font-medium text-signal-purple ring-1 ring-inset ring-purple-500/20">
                      {app.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Button size="xs" onClick={() => handleReview(app)}>Review Dossier</Button>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-text-muted">
                    No pending driver applications in queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Dossier Modal */}
      {selectedApp && (
        <Modal
          open={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Application Dossier: ${selectedApp.name}`}
          footer={
            <div className="flex gap-2 justify-end w-full">
              <Button variant="danger" size="sm" onClick={handleReject}>Reject Application</Button>
              <Button variant="secondary" size="sm" onClick={handleRequestChanges}>Request Changes</Button>
              <Button size="sm" onClick={handleApprove} icon={CheckCircle}>Approve & Onboard</Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs max-h-[70vh] overflow-y-auto pr-2">
            
            {/* Split Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Personal Details */}
              <div className="bg-surface p-4 rounded-xl border border-border-subtle space-y-2">
                <h4 className="font-bold text-text-primary flex items-center gap-1.5"><FileText size={14} className="text-taxi-500" /> Personal Details</h4>
                <div className="space-y-1.5 mt-2">
                  <p className="text-text-muted">Email: <span className="font-semibold text-text-primary">{selectedApp.email}</span></p>
                  <p className="text-text-muted">Phone: <span className="font-semibold text-text-primary">+91 98765 43210</span></p>
                  <p className="text-text-muted">Address: <span className="font-semibold text-text-primary">123, Ring Road, Indore, MP 452001</span></p>
                  <p className="text-text-muted">Emergency Contact: <span className="font-semibold text-text-primary">Asha Rao (+91 98765 43211)</span></p>
                </div>
              </div>

              {/* License Info */}
              <div className="bg-surface p-4 rounded-xl border border-border-subtle space-y-2">
                <h4 className="font-bold text-text-primary flex items-center gap-1.5"><FileText size={14} className="text-taxi-500" /> License Information</h4>
                <div className="space-y-1.5 mt-2">
                  <p className="text-text-muted">License Number: <span className="font-semibold text-text-primary">{selectedApp.license}</span></p>
                  <p className="text-text-muted">Class: <span className="font-semibold text-text-primary">Class A (Commercial)</span></p>
                  <p className="text-text-muted">Expiry Date: <span className="font-semibold text-text-primary">2031-08-15</span></p>
                  <p className="text-text-muted">Issuing Authority: <span className="font-semibold text-text-primary">RTO Indore</span></p>
                </div>
              </div>

              {/* Vehicle Preference */}
              <div className="bg-surface p-4 rounded-xl border border-border-subtle space-y-2">
                <h4 className="font-bold text-text-primary flex items-center gap-1.5"><ClipboardList size={14} className="text-taxi-500" /> Vehicle Preference</h4>
                <div className="space-y-1.5 mt-2">
                  <p className="text-text-muted">Preferred Model: <span className="font-semibold text-text-primary">{selectedApp.vehicle}</span></p>
                  <p className="text-text-muted">Ownership: <span className="font-semibold text-text-primary">Company Assigned</span></p>
                  <p className="text-text-muted">Priority Level: <span className="font-semibold text-text-primary">High</span></p>
                </div>
              </div>

              {/* Availability */}
              <div className="bg-surface p-4 rounded-xl border border-border-subtle space-y-2">
                <h4 className="font-bold text-text-primary flex items-center gap-1.5"><ClipboardList size={14} className="text-taxi-500" /> Availability & Hours</h4>
                <div className="space-y-1.5 mt-2">
                  <p className="text-text-muted">Preferred Shift: <span className="font-semibold text-text-primary">Day Shift (08:00 - 18:00)</span></p>
                  <p className="text-text-muted">Weekly Days: <span className="font-semibold text-text-primary">Mon, Tue, Wed, Thu, Fri</span></p>
                  <p className="text-text-muted">Status: <span className="font-semibold text-text-primary">Ready to Onboard</span></p>
                </div>
              </div>

              {/* Background verification */}
              <div className="bg-surface p-4 rounded-xl border border-border-subtle space-y-2.5 col-span-1 md:col-span-2">
                <h4 className="font-bold text-text-primary flex items-center gap-1.5"><ClipboardList size={14} className="text-taxi-500" /> Background checks</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-text-secondary">
                    <input
                      type="checkbox"
                      checked={bgChecks.identity}
                      onChange={(e) => setBgChecks(prev => ({ ...prev, identity: e.target.checked }))}
                      className="w-4 h-4 text-taxi-500 border-border-strong focus:ring-taxi-500"
                    />
                    Identity Verified (SSN / Aadhaar)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-text-secondary">
                    <input
                      type="checkbox"
                      checked={bgChecks.criminal}
                      onChange={(e) => setBgChecks(prev => ({ ...prev, criminal: e.target.checked }))}
                      className="w-4 h-4 text-taxi-500 border-border-strong focus:ring-taxi-500"
                    />
                    No Criminal Records Cleared
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-text-secondary">
                    <input
                      type="checkbox"
                      checked={bgChecks.records}
                      onChange={(e) => setBgChecks(prev => ({ ...prev, records: e.target.checked }))}
                      className="w-4 h-4 text-taxi-500 border-border-strong focus:ring-taxi-500"
                    />
                    Driving Violation Records Clean
                  </label>
                </div>
              </div>

              {/* Documents Verification List */}
              <div className="bg-surface p-4 rounded-xl border border-border-subtle space-y-2 col-span-1 md:col-span-2">
                <h4 className="font-bold text-text-primary flex items-center gap-1.5"><FileText size={14} className="text-taxi-500" /> Document Verification</h4>
                <div className="mt-2 space-y-3">
                  {[
                    { name: 'Driving License Scan', status: 'Pending Verification', file: 'dl_front_back.pdf' },
                    { name: 'Vehicle Insurance Copy', status: 'Pending Verification', file: 'insurance_policy.pdf' },
                    { name: 'Police Verification Clearance', status: 'Pending Verification', file: 'pcc_report.pdf' }
                  ].map((doc, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-background rounded-lg border border-border-subtle gap-2">
                      <div>
                        <p className="font-semibold text-text-primary">{doc.name}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">File: <span className="text-taxi-500 underline cursor-pointer">{doc.file}</span></p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-signal-purple ring-1 ring-inset ring-purple-500/20">
                          {doc.status}
                        </span>
                        <div className="flex gap-1">
                          <Button size="xs" variant="secondary" className="px-2 py-0.5 text-[10px]">Verify</Button>
                          <Button size="xs" variant="danger" className="px-2 py-0.5 text-[10px]">Reject</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </Modal>
      )}

    </PageLayout>
  )
}
