import { Edit2, Trash2, MapPin, X } from 'lucide-react'
import Button from '@/shared/components/Button'
import StatusBadge from '@/shared/components/StatusBadge'
import Select from '@/shared/components/Select'
import Modal from '@/shared/components/Modal'
import Input from '@/shared/components/Input'

export default function ZonesTab({
  zones,
  setZones,
  selectedZone,
  setSelectedZone,
  detailTab,
  setDetailTab,
  restrictions,
  setRestrictions,
  auditLogs,
  showCreateModal,
  setShowCreateModal,
  isEditing,
  zoneForm,
  setZoneForm,
  handleMapClick,
  clearVertices,
  undoLastVertex,
  handleSaveZone,
  handleOpenEdit,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Dashboard Table */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-border-subtle pb-2">
            <h3 className="text-sm font-bold text-text-primary">Indore Operating Areas</h3>
            <div className="flex gap-2">
              <Select
                value="Indore"
                onChange={() => { }}
                options={[{ value: 'Indore', label: 'Indore' }]}
                className="w-32"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-primary">
              <thead>
                <tr className="border-b border-border-strong text-xs font-semibold text-text-secondary uppercase">
                  <th className="py-3 px-4">Zone Name</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Default Pricing</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-xs">
                {zones.map(z => (
                  <tr
                    key={z.id}
                    className={`hover:bg-surface/50 transition-colors cursor-pointer ${selectedZone?.id === z.id ? 'bg-taxi-500/5 border-l-2 border-taxi-500' : ''}`}
                    onClick={() => setSelectedZone(z)}
                  >
                    <td className="py-3.5 px-4 font-bold flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: z.color }}></span>
                      {z.name}
                    </td>
                    <td className="py-3.5 px-4 text-text-secondary">{z.city}</td>
                    <td className="py-3.5 px-4 font-semibold text-taxi-500">{z.pricing}</td>
                    <td className="py-3.5 px-4"><StatusBadge status={z.status} /></td>
                    <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1 items-center justify-end">
                        <button
                          onClick={() => handleOpenEdit(z)}
                          title="Edit Zone"
                          className="p-1 text-text-secondary hover:text-taxi-500 hover:bg-surface-hover rounded transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setZones(prev => prev.filter(item => item.id !== z.id))}
                          title="Delete Zone"
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick map visualization */}
        <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-text-primary border-b border-border-subtle pb-2">Geofence Visualizer Canvas</h3>
          <div className="relative w-full h-[320px] rounded-xl bg-slate-950 border border-border-strong overflow-hidden flex items-center justify-center">
            {/* SVG Visualizing all zones */}
            <svg className="absolute inset-0 w-full h-full">
              {/* Grid Lines */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ea9367" strokeWidth="0.5" opacity="0.1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Draw zones */}
              {zones.map(z => {
                const pointsStr = z.polygon.map(p => `${p.x},${p.y}`).join(' ')
                return (
                  <g key={z.id} className="cursor-pointer" onClick={() => setSelectedZone(z)}>
                    <polygon
                      points={pointsStr}
                      fill={z.color}
                      fillOpacity={selectedZone?.id === z.id ? 0.35 : 0.15}
                      stroke={z.color}
                      strokeWidth={selectedZone?.id === z.id ? 3 : 1.5}
                      strokeDasharray={z.status === 'inactive' ? '5,5' : '0'}
                    />
                    {/* Mapped center label */}
                    {z.polygon.length > 0 && (
                      <text
                        x={z.polygon.reduce((acc, p) => acc + p.x, 0) / z.polygon.length}
                        y={z.polygon.reduce((acc, p) => acc + p.y, 0) / z.polygon.length}
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="drop-shadow-md select-none pointer-events-none"
                      >
                        {z.name.split(' ')[0]}
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>
            <div className="absolute bottom-3 left-3 bg-slate-900/90 px-2.5 py-1 rounded text-[10px] text-text-secondary border border-border-subtle">
              🔍 Click on a zone polygon to inspect details.
            </div>
          </div>
        </div>
      </div>

      {/* Details Sidebar Panel */}
      <div className="bg-white p-6 rounded-2xl border border-border-subtle shadow-sm space-y-4">
        {selectedZone ? (
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-border-subtle pb-3">
              <div>
                <h3 className="text-base font-bold text-text-primary">{selectedZone.name}</h3>
                <p className="text-xs text-text-muted mt-0.5">{selectedZone.city} Service Zone</p>
              </div>
              <span className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: selectedZone.color }} />
            </div>

            {/* Tab layout inside details */}
            <div className="flex border-b border-border-subtle text-[11px] font-semibold gap-2 pb-px mb-3 overflow-x-auto scrollbar-none">
              {['Overview', 'Map', 'Pricing', 'Vehicles', 'Restrictions', 'History'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  className={`pb-1 px-1 transition-all ${detailTab === tab ? 'border-b-2 border-taxi-500 text-taxi-500' : 'text-text-muted hover:text-text-primary'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {detailTab === 'Overview' && (
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-border-subtle">
                  <span className="text-text-secondary">Zone Status</span>
                  <StatusBadge status={selectedZone.status} />
                </div>
                <div className="flex justify-between py-1.5 border-b border-border-subtle">
                  <span className="text-text-secondary">Area Size</span>
                  <span className="font-mono font-bold text-text-primary">{selectedZone.area} km²</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border-subtle">
                  <span className="text-text-secondary">Vehicles Permitted</span>
                  <span className="font-semibold text-text-primary">{selectedZone.vehicles.join(', ')}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border-subtle">
                  <span className="text-text-secondary">Linked Rule</span>
                  <span className="font-semibold text-taxi-500">{selectedZone.pricing}</span>
                </div>
                <div className="pt-2 flex gap-2">
                  <Button size="sm" className="w-full" icon={Edit2} onClick={() => handleOpenEdit(selectedZone)}>Edit Zone</Button>
                  <Button size="sm" variant="secondary" className="w-full" onClick={() => {
                    setZones(prev => prev.map(z => z.id === selectedZone.id ? { ...z, status: z.status === 'active' ? 'inactive' : 'active' } : z))
                    setSelectedZone(prev => ({ ...prev, status: prev.status === 'active' ? 'inactive' : 'active' }))
                  }}>
                    {selectedZone.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            )}

            {detailTab === 'Map' && (
              <div className="space-y-2">
                <p className="text-[11px] text-text-muted">Polygon Vertices Coordinate Details:</p>
                <div className="bg-slate-950 p-3 rounded-lg border border-border-strong font-mono text-[10px] text-emerald-400 max-h-44 overflow-y-auto space-y-1">
                  {selectedZone.polygon.map((p, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>Vertex {idx + 1}</span>
                      <span>X: {p.x}px, Y: {p.y}px</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detailTab === 'Pricing' && (
              <div className="space-y-3">
                <p className="text-xs text-text-secondary">This zone uses the pricing table rules configuration of: <strong className="text-text-primary">{selectedZone.pricing}</strong>.</p>
                <div className="bg-surface p-3 rounded-lg border border-border-subtle text-xs space-y-2">
                  <div className="flex justify-between">
                    <span>Base Fare</span>
                    <span className="font-bold text-text-primary">$10.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distance Charge</span>
                    <span className="font-bold text-text-primary">$1.50 / KM</span>
                  </div>
                </div>
              </div>
            )}

            {detailTab === 'Vehicles' && (
              <div className="space-y-2 text-xs">
                <p className="text-text-secondary mb-2">Permitted vehicle fleets on active duty inside geofence:</p>
                {['Sedan', 'SUV', 'Van', 'Hatchback'].map(v => {
                  const isAllowed = selectedZone.vehicles.includes(v)
                  return (
                    <label key={v} className="flex items-center gap-2 py-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAllowed}
                        onChange={(e) => {
                          const checked = e.target.checked
                          const updatedVehicles = checked
                            ? [...selectedZone.vehicles, v]
                            : selectedZone.vehicles.filter(x => x !== v)

                          setZones(prev => prev.map(z => z.id === selectedZone.id ? { ...z, vehicles: updatedVehicles } : z))
                          setSelectedZone(prev => ({ ...prev, vehicles: updatedVehicles }))
                        }}
                        className="w-4 h-4 text-taxi-500 focus:ring-taxi-500"
                      />
                      <span className={isAllowed ? 'font-semibold text-text-primary' : 'text-text-muted'}>{v}</span>
                    </label>
                  )
                })}
              </div>
            )}

            {detailTab === 'Restrictions' && (
              <div className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <span className="text-text-secondary block font-semibold">Active Dispatch Window</span>
                  <p className="font-mono text-text-primary bg-surface px-2.5 py-1 rounded border border-border-subtle">{restrictions.operatingHours}</p>
                </div>
                <div className="space-y-1.5 border-t border-border-subtle pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restrictions.airportPickup}
                      onChange={(e) => setRestrictions(prev => ({ ...prev, airportPickup: e.target.checked }))}
                      className="w-4 h-4 text-taxi-500 focus:ring-taxi-500"
                    />
                    <span>Restrict Airport Pickups</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restrictions.longDistance}
                      onChange={(e) => setRestrictions(prev => ({ ...prev, longDistance: e.target.checked }))}
                      className="w-4 h-4 text-taxi-500 focus:ring-taxi-500"
                    />
                    <span>Restrict Outstation Trips</span>
                  </label>
                </div>
              </div>
            )}

            {detailTab === 'History' && (
              <div className="space-y-3 text-[11px]">
                {auditLogs.filter(log => log.zone === selectedZone.name).map((log, idx) => (
                  <div key={idx} className="bg-surface p-2.5 rounded border border-border-subtle space-y-1">
                    <div className="flex justify-between text-text-muted">
                      <span>{log.date}</span>
                      <span className="font-bold text-text-secondary">{log.user}</span>
                    </div>
                    <p className="font-bold text-taxi-500">{log.action}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center space-y-2">
            <MapPin className="mx-auto text-text-muted" size={32} />
            <p className="text-xs text-text-muted font-medium">Select a zone from the dashboard list to inspect its configuration.</p>
          </div>
        )}
      </div>

      {/* Create / Edit Zone Modal & Polygon Canvas Draw */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={isEditing ? 'Modify Service Zone' : 'Create Service Zone'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleSaveZone}>Save Zone</Button>
          </>
        }
      >
        <div className="space-y-4 text-xs pr-1 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Zone Name *"
              required
              value={zoneForm.name}
              onChange={e => setZoneForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Vijay Nagar Bypass"
            />
            <Select
              label="City *"
              value={zoneForm.city}
              onChange={e => setZoneForm(prev => ({ ...prev, city: e.target.value }))}
              options={[{ value: 'Indore', label: 'Indore' }]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Pricing Configuration *"
              value={zoneForm.pricing}
              onChange={e => setZoneForm(prev => ({ ...prev, pricing: e.target.value }))}
              options={[
                { value: 'Standard Fare', label: 'Standard Fare' },
                { value: 'Airport Fare', label: 'Airport Fare' },
                { value: 'Night Fare', label: 'Night Fare' }
              ]}
            />
            <div>
              <label className="block text-text-secondary mb-1 font-semibold">Boundary Color Pin</label>
              <div className="flex gap-2.5 items-center mt-1">
                {['#3b82f6', '#eab308', '#10b981', '#ef4444', '#a855f7'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setZoneForm(prev => ({ ...prev, color: c }))}
                    className={`w-6 h-6 rounded-full border transition-all ${zoneForm.color === c ? 'ring-2 ring-white scale-110 border-white' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Polygon Drawing Canvas */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-text-secondary">Geofence Boundary Map Drawer</span>
              <div className="flex gap-1.5">
                <Button size="xs" variant="secondary" onClick={undoLastVertex} disabled={zoneForm.polygon.length === 0}>Undo Pin</Button>
                <Button size="xs" variant="secondary" onClick={clearVertices} disabled={zoneForm.polygon.length === 0}>Clear Canvas</Button>
              </div>
            </div>

            <div
              className="relative w-full h-[260px] rounded-lg bg-slate-900 border border-border-strong overflow-hidden cursor-crosshair"
              onClick={handleMapClick}
            >
              {/* Map grid simulation background */}
              <div className="absolute inset-0 bg-[radial-gradient(#ea9367_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />

              <svg className="absolute inset-0 w-full h-full">
                {/* Connect drawn coordinates */}
                {zoneForm.polygon.length > 0 && (
                  <polyline
                    points={zoneForm.polygon.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={zoneForm.color}
                    strokeWidth="2.5"
                  />
                )}
                {/* Connect last point back to first for closed shape preview */}
                {zoneForm.polygon.length > 2 && (
                  <line
                    x1={zoneForm.polygon[zoneForm.polygon.length - 1].x}
                    y1={zoneForm.polygon[zoneForm.polygon.length - 1].y}
                    x2={zoneForm.polygon[0].x}
                    y2={zoneForm.polygon[0].y}
                    stroke={zoneForm.color}
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                )}

                {/* Render pins on map */}
                {zoneForm.polygon.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#ffffff"
                    stroke={zoneForm.color}
                    strokeWidth="2"
                  />
                ))}
              </svg>

              {zoneForm.polygon.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-text-muted space-y-1">
                  <MapPin size={24} className="text-taxi-500" />
                  <p className="font-semibold text-[11px]">Click inside this panel to start drawing the geofence boundary.</p>
                  <p className="text-[10px]">Add at least 3 points to define a polygon segment.</p>
                </div>
              )}
            </div>
            <p className="text-[10px] text-text-muted italic">Coordinates recorded: {zoneForm.polygon.length} nodes registered.</p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
