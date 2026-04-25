import { useState } from 'react'
import './DispatchForm.css'

const AUTO_DATA = {
  hsnCode: 'N/A',
  lesseeId: 'TLR254874',
  minecode: 'TLRN0067',
  lesseeName: 'K LAKSHMI NARAYANAN REDDY',
  lesseeAddress: '2-53, Near stage, Basaracheruvu, Anantapur, Mahabubnagar',
  leaseAreaDetails: '',
  districtName: 'Thiruvallur',
  talukName: 'Tiruttani',
  village: 'Arungulam',
  sfNoExtent: '379/3B.,/00002.30.00',
  mineralName: 'Earth',
  bulkPermitNo: 'TLR260000060',
  classification: 'undefined',
  orderRef: '',
  leasePeriod: '11-03-2026 to 10-03-2027',
  withinTamilNadu: 'Yes',
  deliveredTo: 'SUTHER',
  quantityMT: '19',
  lesseeAuthorizedName: 'K LAKSHMI NARAYANAN REDDY',
}

function nowLocalISO() {
  const d = new Date()
  d.setSeconds(0, 0)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// caps: auto-uppercase text, numeric: digits only, phone: digits only max 10
const EDITABLE_FIELDS = [
  { label: 'Serial No', name: 'serialNo', icon: '🔢', required: true, caps: true },
  { label: 'Dispatch Slip No', name: 'dispatchSlipNo', icon: '📄', required: true, caps: true },
  { label: 'Date & Time of Dispatch', name: 'dispatchDateTime', type: 'datetime-local', icon: '📅', full: true, required: true },
  { label: 'Vehicle No', name: 'vehicleNo', icon: '🚗', required: true, caps: true },
  { label: 'Vehicle Type', name: 'vehicleType', icon: '🚚', required: true, caps: true },
  { label: 'Total Distance In (Kms)', name: 'totalDistance', icon: '📏', numeric: true },
  { label: 'Travelling Date', name: 'travellingDate', type: 'date', icon: '🗓️' },
  { label: 'Required Time', name: 'requiredTime', type: 'time', icon: '⏱️' },
  { label: 'Driver License No', name: 'driverLicenseNo', icon: '🪪', caps: true },
  { label: 'Driver Phone No', name: 'driverPhoneNo', icon: '📞', phone: true },
  { label: 'Driver Name', name: 'driverName', icon: '👨✈️', caps: true },
  { label: 'Via', name: 'via', icon: '🛣️', titleCase: true },
  { label: 'Destination Address', name: 'destinationAddress', icon: '📍', full: true, titleCase: true },
]

const defaultEditable = EDITABLE_FIELDS.reduce((acc, f) => {
  acc[f.name] = f.name === 'dispatchDateTime' ? nowLocalISO() : ''
  return acc
}, {})

export default function DispatchForm({ initialData, onSubmit }) {
  const [form, setForm] = useState(() => ({
    ...defaultEditable,
    ...(initialData
      ? Object.fromEntries(EDITABLE_FIELDS.map(f => [f.name, initialData[f.name] ?? defaultEditable[f.name]]))
      : {}),
  }))

  const handleChange = (e, field) => {
    let val = e.target.value
    if (field.caps) val = val.toUpperCase()
    if (field.titleCase) val = val.replace(/\b\w/g, c => c.toUpperCase())
    if (field.numeric) val = val.replace(/\D/g, '')
    if (field.phone) val = val.replace(/\D/g, '').slice(0, 10)
    setForm({ ...form, [field.name]: val })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...AUTO_DATA, ...form })
  }

  return (
    <div className="form-page">
      <div className="form-header">
        <div className="form-header-emblem">🏛️</div>
        <div className="form-header-dept">Tamil Nadu Government</div>
        <h1>Geology and Mining Department</h1>
        <p className="form-header-sub">Dispatch Slip Generation Portal</p>
      </div>

      <div className="form-card">
        <div className="section-title">✏️ Enter Dispatch Details</div>
        <form onSubmit={handleSubmit}>
          <div className="fields-grid">
            {EDITABLE_FIELDS.map((field) => {
              const { label, name, type = 'text', required, icon, full, numeric, phone } = field
              return (
                <div className={`form-group ${full ? 'full' : ''}`} key={name}>
                  <label>
                    <span className="field-icon">{icon}</span>
                    {label}{required && <span className="req">*</span>}
                  </label>
                  <input
                    type={numeric || phone ? 'text' : type}
                    inputMode={numeric || phone ? 'numeric' : undefined}
                    name={name}
                    value={form[name]}
                    onChange={(e) => handleChange(e, field)}
                    required={required}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    maxLength={phone ? 10 : undefined}
                  />
                </div>
              )
            })}
          </div>
          <div className="form-nav">
            <button type="submit" className="btn-next btn-submit">🚀 Generate Slip</button>
          </div>
        </form>
      </div>
    </div>
  )
}
