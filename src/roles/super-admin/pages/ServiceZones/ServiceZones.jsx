import { useState } from 'react'
import { Plus } from 'lucide-react'
import PageLayout from '@/layouts/PageLayout'
import Button from '@/shared/components/Button'
import ZonesTab from './components/ZonesTab'
import ZoneToZonePricingTab from './components/ZoneToZonePricingTab'
import ZoneRestrictionsTab from './components/ZoneRestrictionsTab'
import ZoneHistoryTab from './components/ZoneHistoryTab'

export default function ServiceZones() {
  const [activeTab, setActiveTab] = useState('Zones')
  const [zones, setZones] = useState([
    {
      id: 'SZ-001',
      name: 'Downtown Indore',
      city: 'Indore',
      pricing: 'Standard Fare',
      status: 'active',
      area: '25.4',
      vehicles: ['Sedan', 'SUV', 'Van'],
      color: '#3b82f6',
      polygon: [{ x: 120, y: 150 }, { x: 280, y: 110 }, { x: 340, y: 220 }, { x: 200, y: 310 }, { x: 90, y: 240 }]
    },
    {
      id: 'SZ-002',
      name: 'Devi Ahilya Bai Holkar Airport',
      city: 'Indore',
      pricing: 'Airport Fare',
      status: 'active',
      area: '12.8',
      vehicles: ['Sedan', 'SUV'],
      color: '#eab308',
      polygon: [{ x: 420, y: 80 }, { x: 530, y: 70 }, { x: 510, y: 190 }, { x: 400, y: 170 }]
    },
    {
      id: 'SZ-003',
      name: 'Super Corridor North Zone',
      city: 'Indore',
      pricing: 'Standard Fare',
      status: 'active',
      area: '34.2',
      vehicles: ['Sedan', 'SUV', 'Van'],
      color: '#10b981',
      polygon: [{ x: 50, y: 40 }, { x: 180, y: 30 }, { x: 160, y: 120 }, { x: 30, y: 100 }]
    }
  ])

  // Selected Zone for Details view
  const [selectedZone, setSelectedZone] = useState(null)
  const [detailTab, setDetailTab] = useState('Overview') // Overview, Map, Pricing, Vehicles, Restrictions, History

  // Create/Edit Zone States
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [zoneForm, setZoneForm] = useState({
    id: '',
    name: '',
    city: 'Indore',
    status: 'active',
    pricing: 'Standard Fare',
    color: '#3b82f6',
    polygon: []
  })

  // Zone Restrictions State
  const [restrictions, setRestrictions] = useState({
    Sedan: true,
    SUV: true,
    Van: false,
    operatingHours: '06:00 AM → 11:00 PM',
    airportPickup: false,
    longDistance: false
  })

  // Zone-to-zone state
  const [z2zRules, setZ2zRules] = useState([
    { from: 'Devi Ahilya Bai Holkar Airport', to: 'Downtown Indore', sedan: 30, suv: 40, surcharge: 5 },
    { from: 'Devi Ahilya Bai Holkar Airport', to: 'Super Corridor North Zone', sedan: 35, suv: 45, surcharge: 7 },
    { from: 'Downtown Indore', to: 'Devi Ahilya Bai Holkar Airport', sedan: 30, suv: 40, surcharge: 5 }
  ])
  const [newZ2z, setNewZ2z] = useState({
    from: 'Devi Ahilya Bai Holkar Airport',
    to: 'Downtown Indore',
    vehicle: 'Sedan',
    baseFare: '10',
    distanceFare: '15',
    zoneSurcharge: '5'
  })

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([
    { date: 'Aug 17, 2026 10:15 AM', user: 'Super Admin', action: 'Zone Created', zone: 'Downtown Indore' },
    { date: 'Aug 18, 2026 02:40 PM', user: 'Admin', action: 'Pricing Updated', zone: 'Devi Ahilya Bai Holkar Airport' },
    { date: 'Aug 19, 2026 11:05 AM', user: 'Manager', action: 'Zone Restrictions Modified', zone: 'Super Corridor North Zone' }
  ])

  // Handle map click when drawing
  const handleMapClick = (e) => {
    if (!showCreateModal) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(e.clientX - rect.left)
    const y = Math.round(e.clientY - rect.top)
    setZoneForm(prev => ({
      ...prev,
      polygon: [...prev.polygon, { x, y }]
    }))
  }

  // Clear polygon vertices
  const clearVertices = () => {
    setZoneForm(prev => ({ ...prev, polygon: [] }))
  }

  // Undo last vertex
  const undoLastVertex = () => {
    setZoneForm(prev => ({
      ...prev,
      polygon: prev.polygon.slice(0, -1)
    }))
  }

  // Create or Update Zone
  const handleSaveZone = (e) => {
    e.preventDefault()
    if (!zoneForm.name) {
      alert('Zone Name is required')
      return
    }

    if (isEditing) {
      setZones(prev => prev.map(z => z.id === zoneForm.id ? {
        ...z,
        name: zoneForm.name,
        city: zoneForm.city,
        status: zoneForm.status,
        pricing: zoneForm.pricing,
        color: zoneForm.color,
        polygon: zoneForm.polygon.length > 0 ? zoneForm.polygon : z.polygon,
        area: zoneForm.polygon.length > 0 ? (zoneForm.polygon.length * 4.3).toFixed(1) : z.area
      } : z))

      setAuditLogs(prev => [
        {
          date: new Date().toLocaleString(),
          user: 'Super Admin',
          action: 'Zone Modified',
          zone: zoneForm.name
        },
        ...prev
      ])
    } else {
      const newId = `SZ-00${zones.length + 1}`
      const newZone = {
        id: newId,
        name: zoneForm.name,
        city: zoneForm.city,
        pricing: zoneForm.pricing,
        status: zoneForm.status,
        color: zoneForm.color,
        polygon: zoneForm.polygon.length > 0 ? zoneForm.polygon : [{ x: 100, y: 100 }, { x: 200, y: 100 }, { x: 200, y: 200 }, { x: 100, y: 200 }],
        area: zoneForm.polygon.length > 0 ? (zoneForm.polygon.length * 4.3).toFixed(1) : '15.0',
        vehicles: ['Sedan', 'SUV']
      }
      setZones(prev => [...prev, newZone])

      setAuditLogs(prev => [
        {
          date: new Date().toLocaleString(),
          user: 'Super Admin',
          action: 'Zone Created',
          zone: zoneForm.name
        },
        ...prev
      ])
    }

    setShowCreateModal(false)
  }

  const handleOpenCreate = () => {
    setIsEditing(false)
    setZoneForm({
      id: '',
      name: '',
      city: 'Indore',
      status: 'active',
      pricing: 'Standard Fare',
      color: '#3b82f6',
      polygon: []
    })
    setShowCreateModal(true)
  }

  const handleOpenEdit = (z) => {
    setIsEditing(true)
    setZoneForm({
      id: z.id,
      name: z.name,
      city: z.city,
      status: z.status,
      pricing: z.pricing,
      color: z.color,
      polygon: z.polygon
    })
    setShowCreateModal(true)
  }

  const handleAddZ2z = (e) => {
    e.preventDefault()
    const total = parseFloat(newZ2z.baseFare) + parseFloat(newZ2z.distanceFare) + parseFloat(newZ2z.zoneSurcharge)
    const existing = z2zRules.find(r => r.from === newZ2z.from && r.to === newZ2z.to)

    if (existing) {
      setZ2zRules(prev => prev.map(r => {
        if (r.from === newZ2z.from && r.to === newZ2z.to) {
          return {
            ...r,
            sedan: newZ2z.vehicle === 'Sedan' ? total : r.sedan,
            suv: newZ2z.vehicle === 'SUV' ? total : r.suv,
            surcharge: parseFloat(newZ2z.zoneSurcharge)
          }
        }
        return r
      }))
    } else {
      setZ2zRules(prev => [
        ...prev,
        {
          from: newZ2z.from,
          to: newZ2z.to,
          sedan: newZ2z.vehicle === 'Sedan' ? total : 0,
          suv: newZ2z.vehicle === 'SUV' ? total : 0,
          surcharge: parseFloat(newZ2z.zoneSurcharge)
        }
      ])
    }
  }

  return (
    <PageLayout
      title="Service Zones & Geofences"
      description="Map out dispatch boundaries, enforce vehicle limitations, audit geofences, and configure zone-to-zone rates."
      actions={
        <Button icon={Plus} onClick={handleOpenCreate}>
          Create Zone
        </Button>
      }
    >
      {/* Navigation tabs */}
      <div className="flex border-b border-border-strong overflow-x-auto pb-px mb-6 scrollbar-none">
        {['Zones', 'Zone-to-Zone Pricing', 'Zone Restrictions', 'Zone History'].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-all ${activeTab === t
              ? 'border-taxi-500 text-taxi-500'
              : 'border-transparent text-text-secondary hover:text-text-primary hover:border-border-subtle'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab panel contents */}
      <div className="space-y-6">
        {activeTab === 'Zones' && (
          <ZonesTab
            zones={zones}
            setZones={setZones}
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
            detailTab={detailTab}
            setDetailTab={setDetailTab}
            restrictions={restrictions}
            setRestrictions={setRestrictions}
            auditLogs={auditLogs}
            showCreateModal={showCreateModal}
            setShowCreateModal={setShowCreateModal}
            isEditing={isEditing}
            zoneForm={zoneForm}
            setZoneForm={setZoneForm}
            handleMapClick={handleMapClick}
            clearVertices={clearVertices}
            undoLastVertex={undoLastVertex}
            handleSaveZone={handleSaveZone}
            handleOpenEdit={handleOpenEdit}
          />
        )}

        {activeTab === 'Zone-to-Zone Pricing' && (
          <ZoneToZonePricingTab
            z2zRules={z2zRules}
            setZ2zRules={setZ2zRules}
            newZ2z={newZ2z}
            setNewZ2z={setNewZ2z}
            zones={zones}
            handleAddZ2z={handleAddZ2z}
          />
        )}

        {activeTab === 'Zone Restrictions' && (
          <ZoneRestrictionsTab
            restrictions={restrictions}
            setRestrictions={setRestrictions}
          />
        )}

        {activeTab === 'Zone History' && (
          <ZoneHistoryTab
            auditLogs={auditLogs}
          />
        )}
      </div>
    </PageLayout>
  )
}
