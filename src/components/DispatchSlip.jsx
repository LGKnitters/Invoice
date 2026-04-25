import { useRef, useEffect, useState } from 'react'
import QRCode from 'qrcode'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import signatureImg from '../assets/signature.png'
import './DispatchSlip.css'

function formatDateTime(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

const L = ({ children }) => <td className="cell-label">{children}</td>
const V = ({ children, colSpan, nowrap }) => (
  <td className={`cell-value${nowrap ? ' nowrap' : ''}`} colSpan={colSpan}>{children}</td>
)

function SlipContent({ data, qrUrl, tableRef }) {
  return (
    <div className="slip-content">
      <div className="slip-header">
        <span className="slip-serial">{data.serialNo}</span>
        {qrUrl && <img src={qrUrl} alt="QR" className="qr-img" />}
      </div>
      <div className="slip-meta">
        <span>HSN Code: {data.hsnCode}</span>
        <span>Date &amp; Time of Dispatch: {formatDateTime(data.dispatchDateTime)}</span>
      </div>
      <div className="table-wrap" ref={tableRef}>
      <table className="slip-table">
        <colgroup>
          <col style={{ width: '22%' }} />
          <col style={{ width: '28%' }} />
          <col style={{ width: '22%' }} />
          <col style={{ width: '28%' }} />
        </colgroup>
        <tbody>
          <tr>
            <L>Lessee Id: <span className="val">{data.lesseeId}</span></L>
            <L>Minecode: <span className="val">{data.minecode}</span></L>
            <L>Lease Area Details</L>
            <td className="cell-label">Serial No: <em className="grey-italic">{data.serialNo}</em></td>
          </tr>
          <tr>
            <L>Lessee Name and Address:</L>
            <V>{data.lesseeName}</V>
            <L>District Name:</L>
            <V>{data.districtName}</V>
          </tr>
          <tr>
            <td className="cell-value addr-cell" colSpan={2} rowSpan={3}>{data.lesseeAddress}</td>
            <L>Taluk Name:</L>
            <V>{data.talukName}</V>
          </tr>
          <tr>
            <L>Village:</L>
            <V>{data.village}</V>
          </tr>
          <tr>
            <L>SF.No / Extent:</L>
            <V>{data.sfNoExtent}</V>
          </tr>
          <tr>
            <L>Mineral Name: <span className="val">{data.mineralName}</span></L>
            <L>Bulk Permit No: <span className="val">{data.bulkPermitNo}</span></L>
            <L>Classification:</L>
            <V>{data.classification}</V>
          </tr>
          <tr>
            <td className="cell-label" colSpan={2}>Order Ref: <span className="val">{data.orderRef}</span></td>
            <L>Lease Period:</L>
            <V>{data.leasePeriod}</V>
          </tr>
          <tr>
            <L>Dispatch Slip No:</L>
            <V>{data.dispatchSlipNo}</V>
            <L>Within Tamil Nadu:</L>
            <V>{data.withinTamilNadu}</V>
          </tr>
          <tr>
            <L>Delivered To:</L>
            <V colSpan={3}>{data.deliveredTo}</V>
          </tr>
          <tr>
            <L>Vehicle No:</L>
            <V>{data.vehicleNo}</V>
            <td className="cell-label dest-label-border" colSpan={2}>Destination Address:</td>
          </tr>
          <tr>
            <L>Vehicle Type:</L>
            <V>{data.vehicleType}</V>
            <td className="cell-value" colSpan={2} rowSpan={4}>{data.destinationAddress}</td>
          </tr>
          <tr>
            <L>Total Distance In (Kms):</L>
            <V>{data.totalDistance}</V>
          </tr>
          <tr>
            <L>Travelling Date:</L>
            <V>{data.travellingDate}</V>
          </tr>
          <tr>
            <L>Required Time:</L>
            <V>{data.requiredTime}</V>
          </tr>
          <tr>
            <L>Quantity(in MT):</L>
            <V>{data.quantityMT}</V>
            <L>Driver Name:</L>
            <V>{data.driverName}</V>
          </tr>
          <tr>
            <L>Driver License No:</L>
            <V>{data.driverLicenseNo}</V>
            <L>Via:</L>
            <V>{data.via}</V>
          </tr>
          <tr>
            <L>Driver Phone No:</L>
            <V>{data.driverPhoneNo}</V>
            <L>Lessee / Authorized Person Name:</L>
            <V>{data.lesseeAuthorizedName}</V>
          </tr>
          <tr>
            <L>Driver Signature:</L>
            <td className="sig-cell"></td>
            <L>Signature of AD / DD:</L>
            <td className="sig-cell">
              <img src={signatureImg} alt="signature" className="sig-img" />
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>
  )
}

export default function DispatchSlip({ data, onEdit }) {
  const slipRef = useRef()
  const tableRef1 = useRef()
  const tableRef2 = useRef()
  const [qrUrl, setQrUrl] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    const qrValue = [
      data.serialNo, data.dispatchSlipNo, data.minecode, data.dispatchDateTime,
      data.totalDistance ? `${data.totalDistance}kms` : '',
      data.requiredTime,
      data.mineralName && data.quantityMT ? `${data.mineralName}(${data.quantityMT}MT)` : data.mineralName,
      data.vehicleNo, data.destinationAddress,
    ].filter(Boolean).join(',')
    QRCode.toDataURL(qrValue, { width: 72, margin: 1 }).then(setQrUrl)
  }, [data.serialNo, data.dispatchSlipNo, data.minecode, data.dispatchDateTime,
      data.totalDistance, data.requiredTime, data.mineralName, data.quantityMT,
      data.vehicleNo, data.destinationAddress])

  const handleDownloadPDF = async () => {
    setPdfLoading(true)
    try {
      const el = slipRef.current
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fff' })
      const imgData = canvas.toDataURL('image/png')
      const margin = 10
      const pxToMm = 25.4 / 96
      const contentW = el.offsetWidth * pxToMm + margin * 2
      const contentH = el.offsetHeight * pxToMm + margin * 2
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [contentW, contentH] })
      const usableW = contentW - margin * 2
      const imgH = (canvas.height * usableW) / canvas.width
      pdf.addImage(imgData, 'PNG', margin, margin, usableW, imgH)

      // Draw thick outer border on both tables directly in PDF
      const elRect = el.getBoundingClientRect()
      const scale = usableW / el.offsetWidth
      ;[tableRef1, tableRef2].forEach(ref => {
        if (!ref.current) return
        const r = ref.current.getBoundingClientRect()
        const x = margin + (r.left - elRect.left) * pxToMm * (usableW / (el.offsetWidth * pxToMm))
        const y = margin + (r.top  - elRect.top)  * pxToMm * (usableW / (el.offsetWidth * pxToMm))
        const w = r.width  * pxToMm * (usableW / (el.offsetWidth * pxToMm))
        const h = r.height * pxToMm * (usableW / (el.offsetWidth * pxToMm))
        pdf.setDrawColor(0, 0, 0)
        pdf.setLineWidth(0.3)
        pdf.rect(x, y, w, h, 'S')
      })

      pdf.save(`${data.serialNo}.pdf`)
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="slip-page">
      <div className="slip-action-card no-print">
        <button onClick={onEdit} className="action-btn edit-btn">✏️ Edit Details</button>
        <button onClick={handleDownloadPDF} className="action-btn pdf-btn" disabled={pdfLoading}>
          {pdfLoading ? '⏳ Generating...' : '⬇️ Download PDF'}
        </button>
      </div>

      <div ref={slipRef} className="slip-print-area">
        <SlipContent data={data} qrUrl={qrUrl} tableRef={tableRef1} />
        <div className="slip-divider" />
        <SlipContent data={data} qrUrl={qrUrl} tableRef={tableRef2} />
      </div>
    </div>
  )
}
