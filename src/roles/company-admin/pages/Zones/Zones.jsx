import { useState } from 'react'
import { Plus, Edit2, Trash2, MapPin, ToggleLeft, ToggleRight, Coins } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import StatusBadge from '@/shared/components/StatusBadge'
import Input from '@/shared/components/Input'
import Select from '@/shared/components/Select'
import Modal from '@/shared/components/Modal'

export default function Zones() {
  const [zones, setZones] = useState([
    { id: 'Z-01', name: 'Indore City Core', status: 'active', surcharge: '$1.50', coordinates: '5 Points Polygon' },
    { id: 'Z-02', name: 'Bhopal Airport Zone', status: 'active', surcharge: '$4.00', coordinates: 'Circle (2km radius)' },
    { id: 'Z-03', name: 'Outer Industrial Bypass', status: 'inactive', surcharge: '$0.00', coordinates: '8 Points Polygon' }
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [selectedZone, setSelectedZone] = useState(null)

  // Form states
  const [newZoneName, setNewZoneName] = useState('')
  const [newZoneSurcharge, setNewZoneSurcharge] = useState('')

  const handleCreateZone = (e) => {
    e.preventDefault()
    if (!newZoneName) return
    setZones(prev => [
      ...prev,
      {
        id: `Z-0${prev.length + 1}`,
        name: newZoneName,
        status: 'active',
        surcharge: newZoneSurcharge ? `$${newZoneSurcharge}` : '$0.00',
        coordinates: 'Custom Polygon Mapping'
      }
    ])
    setNewZoneName('')
    setNewZoneSurcharge('')
    setShowCreateModal(false)
  }

  const handleUpdatePricing = (e) => {
    e.preventDefault()
    setZones(prev => prev.map(z => {
      if (z.id === selectedZone.id) {
        return { ...z, surcharge: selectedZone.surcharge }
      }
      return z
    }))
    setShowPricingModal(false)
  }

  const toggleStatus = (id) => {
    setZones(prev => prev.map(z => {
      if (z.id === id) {
        return { ...z, status: z.status === 'active' ? 'inactive' : 'active' }
      }
      return z
    }))
  }

  const handleDelete = (id) => {
    setZones(prev => prev.filter(z => z.id !== id))
  }

  return (
    <PageLayout
      title="Service Zones"
      description="Map and manage company operating zones, configure geo-fenced coordinates, and custom surcharges."
      actions={
        <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
          Create Zone
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map-based UI Visualization */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Geofence Visualizer Map</h3>
          
          <div className="relative w-full h-[400px] rounded-xl bg-slate-900 border border-border-strong overflow-hidden flex items-center justify-center">
            {/* Visual Grid representing map lines */}
            <div className="absolute inset-0 bg-[radial-gradient(#ea9367_1px,transparent_1px)] [background-size:20px_20px] opacity-15" />
            
            {/* Mock Geofence Shapes */}
            <div className="absolute top-1/4 left-1/4 w-36 h-36 border-2 border-dashed border-taxi-500 bg-taxi-500/10 rounded-full flex flex-col items-center justify-center animate-pulse">
              <span className="text-xs font-bold text-taxi-500">Bhopal Airport</span>
              <span className="text-[10px] text-text-primary">$4.00 Surcharge</span>
            </div>

            <div className="absolute bottom-1/4 right-1/4 w-48 h-32 border-2 border-dashed border-signal-blue bg-signal-blue/10 rounded-xl flex flex-col items-center justify-center">
              <span className="text-xs font-bold text-signal-blue">Indore City Core</span>
              <span className="text-[10px] text-text-primary">$1.50 Surcharge</span>
            </div>

            {/* Indicator Overlay */}
            <div className="absolute bottom-4 left-4 bg-ink/90 px-3 py-1.5 rounded-lg border border-border-subtle text-xs space-y-0.5 pointer-events-none">
              <p className="font-semibold text-text-primary flex items-center gap-1.5">
                <MapPin size={12} className="text-taxi-500" /> Map GPS Mock Active
              </p>
              <p className="text-[10px] text-text-muted">Click 'Create Zone' to define polygon vertices.</p>
            </div>
          </div>
        </div>

        {/* Zones List */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Active Geofences</h3>
          <div className="space-y-3">
            {zones.map((zone) => (
              <div key={zone.id} className="bg-surface p-4 rounded-xl border border-border-subtle space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">{zone.name}</h4>
                    <p className="text-[11px] text-text-muted mt-0.5">ID: {zone.id} • {zone.coordinates}</p>
                  </div>
                  <StatusBadge status={zone.status} />
                </div>

                <div className="flex justify-between items-center border-t border-border-subtle pt-2 text-xs">
                  <div>
                    <span className="text-text-muted">Zone Fee:</span>
                    <span className="font-semibold text-text-primary ml-1">{zone.surcharge}</span>
                  </div>
                  
                  {/* Actions row */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedZone(zone)
                        setShowPricingModal(true)
                      }}
                      title="Zone Pricing"
                      className="p-1 text-text-secondary hover:text-taxi-500 hover:bg-surface-hover rounded transition-colors"
                    >
                      <Coins size={14} />
                    </button>
                    <button
                      onClick={() => toggleStatus(zone.id)}
                      title={zone.status === 'active' ? 'Deactivate Zone' : 'Activate Zone'}
                      className="p-1 text-text-secondary hover:text-taxi-500 hover:bg-surface-hover rounded transition-colors"
                    >
                      {zone.status === 'active' ? <ToggleRight size={14} className="text-emerald-500" /> : <ToggleLeft size={14} />}
                    </button>
                    <button
                      onClick={() => handleDelete(zone.id)}
                      title="Delete Geofence"
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Create Zone Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Geofence Zone"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateZone}>Initialize Zone</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Zone Name *"
            value={newZoneName}
            onChange={(e) => setNewZoneName(e.target.value)}
            placeholder="e.g. Bhopal Industrial Area"
          />
          <Input
            label="Base Surcharge"
            value={newZoneSurcharge}
            onChange={(e) => setNewZoneSurcharge(e.target.value)}
            placeholder="e.g. 2.50"
            icon={Coins}
          />
          <div className="bg-surface p-3.5 rounded-lg border border-border-subtle text-xs text-text-muted">
            <p className="font-semibold text-text-primary mb-1">Geofence Coordinates Setup</p>
            You can draw a polygon directly on the map visualizer to map boundary coordinates. For this demo, preset GPS vertices will be configured.
          </div>
        </div>
      </Modal>

      {/* Zone Pricing Modal */}
      {selectedZone && (
        <Modal
          open={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          title={`Configure Pricing for ${selectedZone.name}`}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowPricingModal(false)}>Cancel</Button>
              <Button onClick={handleUpdatePricing}>Update Fee</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Zone Surcharge *"
              value={selectedZone.surcharge}
              onChange={(e) => setSelectedZone(prev => ({ ...prev, surcharge: e.target.value }))}
              icon={Coins}
            />
          </div>
        </Modal>
      )}

    </PageLayout>
  )
}
