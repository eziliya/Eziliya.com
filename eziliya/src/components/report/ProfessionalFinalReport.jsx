import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import styles from './ProfessionalFinalReport.module.css'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export default function ProfessionalFinalReport() {
  const location = useLocation()
  const navigate = useNavigate()
  const [formData, setFormData] = useState(() => location.state?.formData ?? {})
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const reportRef = useRef(null)

  useEffect(() => {
    if (location.state?.formData && Object.keys(location.state.formData).length > 0) {
      setFormData((prev) => ({ ...prev, ...location.state.formData }))
    }
  }, [location.state])

  const pdfFileName = useMemo(() => {
    const safe = (v) =>
      String(v || '')
        .trim()
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
        .replace(/\s+/g, '_')
        .slice(0, 60)

    const date = new Date()
    const yyyy = String(date.getFullYear())
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')

    const base =
      safe(formData.proposalIdApplicationNo) ||
      safe(formData.applicantsName) ||
      safe(formData.reportTitle) ||
      `report_${yyyy}${mm}${dd}`

    return `PROFESSIONAL_REPORT_${base}_${yyyy}${mm}${dd}.pdf`
  }, [formData.applicantsName, formData.proposalIdApplicationNo, formData.reportTitle])

  const handleDownloadPdf = async () => {
    if (!reportRef.current || isDownloadingPdf) return

    setIsDownloadingPdf(true)
    toast.info('Generating PDF... Please wait.')

    try {
      const element = reportRef.current
      const prevScrollX = window.scrollX
      const prevScrollY = window.scrollY

      element.scrollIntoView({ block: 'start', inline: 'nearest' })
      await new Promise((r) => requestAnimationFrame(() => r()))

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: element.scrollWidth || element.clientWidth,
        windowHeight: element.scrollHeight || element.clientHeight,
        onclone: (doc) => {
          const cloned = doc.querySelector('[data-pdf-root="professional-report"]')
          if (cloned) {
            cloned.classList.add(styles.pdfMode)
            cloned.style.backgroundColor = '#ffffff'
            cloned.style.color = '#000000'
          }
        },
      })

      if (!canvas.width || !canvas.height) {
        toast.error('Could not capture the report. Please try again.')
        return
      }

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      const margin = 10
      const contentWidthMm = pageWidth - margin * 2
      const contentHeightMm = pageHeight - margin * 2

      const pxPerMm = canvas.width / contentWidthMm
      const pageSliceHeightPx = Math.floor(contentHeightMm * pxPerMm)

      const sliceCanvas = document.createElement('canvas')
      sliceCanvas.width = canvas.width
      sliceCanvas.height = pageSliceHeightPx
      const sliceCtx = sliceCanvas.getContext('2d')

      let renderedHeightPx = 0
      let pageIndex = 0

      while (renderedHeightPx < canvas.height) {
        const sliceHeightPx = Math.min(pageSliceHeightPx, canvas.height - renderedHeightPx)
        sliceCanvas.height = sliceHeightPx

        sliceCtx?.setTransform(1, 0, 0, 1, 0, 0)
        sliceCtx?.clearRect(0, 0, sliceCanvas.width, sliceHeightPx)
        sliceCtx?.drawImage(canvas, 0, renderedHeightPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx)

        const sliceHeightMm = sliceHeightPx / pxPerMm
        const imgData = sliceCanvas.toDataURL('image/jpeg', 0.95)

        if (pageIndex > 0) pdf.addPage()
        pdf.addImage(imgData, 'JPEG', margin, margin, contentWidthMm, sliceHeightMm)

        renderedHeightPx += sliceHeightPx
        pageIndex++
      }

      pdf.save(pdfFileName)
      toast.success('PDF downloaded successfully!')
      window.scrollTo(prevScrollX, prevScrollY)
    } catch (err) {
      console.error('PDF generation error:', err)
      const message = err instanceof Error ? err.message : 'Unknown error'
      toast.error(`Failed to generate PDF: ${message}`)
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else if (type === 'file') {
      const file = files?.[0]
      if (file) {
        setFormData((prev) => ({ ...prev, [name]: file }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    const file = files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [name]: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const getCurrentDate = () => {
    const date = new Date()
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className={styles.container}>
      {/* Download Section */}
      <div className={styles.downloadSection}>
        <button
          onClick={() => navigate(-1)}
          className={styles.backBtn}
          disabled={isDownloadingPdf}
        >
          ← Back
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf}
          className={styles.downloadBtn}
        >
          {isDownloadingPdf ? 'Generating PDF...' : '📥 Download PDF'}
        </button>
      </div>

      {/* Report Content */}
      <div ref={reportRef} data-pdf-root="professional-report" className={styles.reportContent}>
        
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.headerLogo}>
            {formData.companyLogo && (
              <img src={formData.companyLogo} alt="Company Logo" className={styles.logo} />
            )}
          </div>
          <div className={styles.headerTitle}>
            <h1>{formData.reportTitle || 'PROFESSIONAL TECHNICAL VALUATION REPORT'}</h1>
            <p className={styles.subtitle}>{formData.reportSubtitle || 'Comprehensive Property Assessment & Valuation'}</p>
          </div>
          <div className={styles.headerInfo}>
            <p><strong>Report No:</strong> {formData.reportNumber || 'N/A'}</p>
            <p><strong>Date:</strong> {formData.dateOfReportRelease || getCurrentDate()}</p>
          </div>
        </div>

        {/* Executive Summary */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>EXECUTIVE SUMMARY</h2>
          <table className={styles.table}>
            <tbody>
              <tr>
                <td className={styles.labelCell}>Valuation Agency</td>
                <td className={styles.valueCell}>
                  <input
                    type="text"
                    name="nameOfvaluationAgency"
                    value={formData.nameOfvaluationAgency || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter valuation agency name"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Applicant Name</td>
                <td className={styles.valueCell}>
                  <input
                    type="text"
                    name="applicantsName"
                    value={formData.applicantsName || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter applicant name"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Proposal ID / Application No</td>
                <td className={styles.valueCell}>
                  <input
                    type="text"
                    name="proposalIdApplicationNo"
                    value={formData.proposalIdApplicationNo || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter proposal ID"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Property Type</td>
                <td className={styles.valueCell}>
                  <input
                    type="text"
                    name="typeOfProperty"
                    value={formData.typeOfProperty || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g., Residential, Commercial, Industrial"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Transaction Type</td>
                <td className={styles.valueCell}>
                  <input
                    type="text"
                    name="transactionType"
                    value={formData.transactionType || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g., Purchase, Loan, Mortgage"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Property Details */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>PROPERTY DETAILS</h2>
          <table className={styles.table}>
            <tbody>
              <tr>
                <td className={styles.labelCell}>Address as per TRF</td>
                <td className={styles.valueCell}>
                  <textarea
                    name="addressAsPerTRF"
                    value={formData.addressAsPerTRF || ''}
                    onChange={handleChange}
                    className={styles.textarea}
                    rows="2"
                    placeholder="Enter address as per TRF"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Address as per Legal Documents</td>
                <td className={styles.valueCell}>
                  <textarea
                    name="addressAsPerLegalDocuments"
                    value={formData.addressAsPerLegalDocuments || ''}
                    onChange={handleChange}
                    className={styles.textarea}
                    rows="2"
                    placeholder="Enter address as per legal documents"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Address as per Actual Site</td>
                <td className={styles.valueCell}>
                  <textarea
                    name="addressAsPerActualSite"
                    value={formData.addressAsPerActualSite || ''}
                    onChange={handleChange}
                    className={styles.textarea}
                    rows="2"
                    placeholder="Enter address as per actual site"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>City / Town / Village</td>
                <td className={styles.valueCell}>
                  <input
                    type="text"
                    name="CityTownVillage"
                    value={formData.CityTownVillage || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter city/town/village"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>State</td>
                <td className={styles.valueCell}>
                  <input
                    type="text"
                    name="stateName"
                    value={formData.stateName || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter state name"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Pincode</td>
                <td className={styles.valueCell}>
                  <input
                    type="text"
                    name="Pincode"
                    value={formData.Pincode || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter pincode"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Nearest Landmark</td>
                <td className={styles.valueCell}>
                  <input
                    type="text"
                    name="NearestLandmark"
                    value={formData.NearestLandmark || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter nearest landmark"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Site Visit Details */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>SITE VISIT DETAILS</h2>
          <table className={styles.table}>
            <tbody>
              <tr>
                <td className={styles.labelCell}>Date of Technical Initiation</td>
                <td className={styles.valueCell}>
                  <input
                    type="date"
                    name="dateOfTechnicalInitiation"
                    value={formData.dateOfTechnicalInitiation || ''}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Date of Site Visit</td>
                <td className={styles.valueCell}>
                  <input
                    type="date"
                    name="dateOfSiteVisit"
                    value={formData.dateOfSiteVisit || ''}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Person Met at Site</td>
                <td className={styles.valueCell}>
                  <input
                    type="text"
                    name="personMetAtSiteName"
                    value={formData.personMetAtSiteName || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter person name"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Contact Number</td>
                <td className={styles.valueCell}>
                  <input
                    type="text"
                    name="contactNoForPersonMet"
                    value={formData.contactNoForPersonMet || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter contact number"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Property Owner / Seller Name</td>
                <td className={styles.valueCell}>
                  <input
                    type="text"
                    name="currentOwnerSellerName"
                    value={formData.currentOwnerSellerName || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter owner/seller name"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Location & Infrastructure */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>LOCATION & INFRASTRUCTURE</h2>
          <table className={styles.table}>
            <tbody>
              <tr>
                <td className={styles.labelCell}>Main Locality</td>
                <td className={styles.valueCell}>
                  <input
                    type="text"
                    name="mainLocality"
                    value={formData.mainLocality || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter main locality"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Sub Locality</td>
                <td className={styles.valueCell}>
                  <input
                    type="text"
                    name="subLocality"
                    value={formData.subLocality || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter sub locality"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Class of Locality</td>
                <td className={styles.valueCell}>
                  <select
                    name="ClassOfLocality"
                    value={formData.ClassOfLocality || ''}
                    onChange={handleChange}
                    className={styles.input}
                  >
                    <option value="">Select class</option>
                    <option value="Prime">Prime</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Below Average">Below Average</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Type of Road</td>
                <td className={styles.valueCell}>
                  <input
                    type="text"
                    name="TypeOfRoad"
                    value={formData.TypeOfRoad || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g., Paved, Concrete, Kachha"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Width of Road (in meters)</td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="WidthOfRoad"
                    value={formData.WidthOfRoad || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter road width"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Distance from Bus Stop (km)</td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="DistanceFromBusStop"
                    value={formData.DistanceFromBusStop || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter distance"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Distance from Railway Station (km)</td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="DistanceFromRailwayStation"
                    value={formData.DistanceFromRailwayStation || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter distance"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Distance from Main Market (km)</td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="DistanceFromMainMarket"
                    value={formData.DistanceFromMainMarket || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter distance"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Property Specifications */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>PROPERTY SPECIFICATIONS</h2>
          <table className={styles.table}>
            <tbody>
              <tr>
                <td className={styles.labelCell}>Type of Structure</td>
                <td className={styles.valueCell}>
                  <input
                    type="text"
                    name="TypeOfStructure"
                    value={formData.TypeOfStructure || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g., RCC, Load Bearing"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Number of Floors</td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="NoOfFloors"
                    value={formData.NoOfFloors || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter number of floors"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Located on Floor</td>
                <td className={styles.valueCell}>
                  <input
                    type="text"
                    name="LocatedOnFloor"
                    value={formData.LocatedOnFloor || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g., Ground, 1st, 2nd"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Roof Construction</td>
                <td className={styles.valueCell}>
                  <input
                    type="text"
                    name="RoofConstruction"
                    value={formData.RoofConstruction || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g., RCC Slab, Asbestos"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Types of Flooring</td>
                <td className={styles.valueCell}>
                  <input
                    type="text"
                    name="TypesOfFlooring"
                    value={formData.TypesOfFlooring || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g., Vitrified Tiles, Marble"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>External Finishing</td>
                <td className={styles.valueCell}>
                  <input
                    type="text"
                    name="ExternalFinishing"
                    value={formData.ExternalFinishing || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g., Paint, Texture, Tiles"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Present Age (years)</td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="PresentAge"
                    value={formData.PresentAge || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter age in years"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Future Physical Life (years)</td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="FuturePhysicalLife"
                    value={formData.FuturePhysicalLife || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter remaining life"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Area Details */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>AREA DETAILS</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Particulars</th>
                <th>As per Legal Documents</th>
                <th>As per Actual Site</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.labelCell}>East (in sq.ft / sq.m)</td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="LegalAreaEast"
                    value={formData.LegalAreaEast || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Legal area"
                  />
                </td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="ActualAreaEast"
                    value={formData.ActualAreaEast || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Actual area"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>West (in sq.ft / sq.m)</td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="LegalAreaWest"
                    value={formData.LegalAreaWest || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Legal area"
                  />
                </td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="ActualAreaWest"
                    value={formData.ActualAreaWest || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Actual area"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>North (in sq.ft / sq.m)</td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="LegalAreaNorth"
                    value={formData.LegalAreaNorth || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Legal area"
                  />
                </td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="ActualAreaNorth"
                    value={formData.ActualAreaNorth || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Actual area"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>South (in sq.ft / sq.m)</td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="LegalAreaSouth"
                    value={formData.LegalAreaSouth || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Legal area"
                  />
                </td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="ActualAreaSouth"
                    value={formData.ActualAreaSouth || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Actual area"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}><strong>Total Area</strong></td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="LegalTotalArea"
                    value={formData.LegalTotalArea || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Total legal area"
                  />
                </td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="ActualTotalArea"
                    value={formData.ActualTotalArea || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Total actual area"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Valuation Details */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>VALUATION DETAILS</h2>
          <table className={styles.table}>
            <tbody>
              <tr>
                <td className={styles.labelCell}>Land / Plot Area (sq.ft)</td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="LandPlotArea"
                    value={formData.LandPlotArea || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter land area"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Built-up Area (sq.ft)</td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="AdoptableBuiltUpArea"
                    value={formData.AdoptableBuiltUpArea || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter built-up area"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Carpet Area (sq.ft)</td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="CarpetAreaSite"
                    value={formData.CarpetAreaSite || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter carpet area"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Adopted Rate (per sq.ft)</td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="AdoptedRate"
                    value={formData.AdoptedRate || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter rate"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Land Value (₹)</td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="LandValue"
                    value={formData.LandValue || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter land value"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Construction Cost (₹)</td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="ConstructionCost"
                    value={formData.ConstructionCost || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter construction cost"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Total Construction Value (₹)</td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="TotalConstructionValue"
                    value={formData.TotalConstructionValue || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter total construction value"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}><strong>Total Fair Market Value (₹)</strong></td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="TotalFairMarketValue"
                    value={formData.TotalFairMarketValue || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter total fair market value"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}><strong>Realizable Value (₹)</strong></td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="RealizableValue"
                    value={formData.RealizableValue || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter realizable value"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}><strong>Forced Sale / Distress Value (₹)</strong></td>
                <td className={styles.valueCell}>
                  <input
                    type="number"
                    name="ForcedSaleValue"
                    value={formData.ForcedSaleValue || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Enter forced sale value"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Risk Assessment */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>RISK ASSESSMENT</h2>
          <table className={styles.table}>
            <tbody>
              <tr>
                <td className={styles.labelCell}>Property Falls Under Seismic Zone</td>
                <td className={styles.valueCell}>
                  <select
                    name="PropertyFallsUnderSeismicZone"
                    value={formData.PropertyFallsUnderSeismicZone || ''}
                    onChange={handleChange}
                    className={styles.input}
                  >
                    <option value="">Select</option>
                    <option value="Zone I">Zone I (Low Risk)</option>
                    <option value="Zone II">Zone II (Low Risk)</option>
                    <option value="Zone III">Zone III (Moderate Risk)</option>
                    <option value="Zone IV">Zone IV (High Risk)</option>
                    <option value="Zone V">Zone V (Very High Risk)</option>
                    <option value="Not Applicable">Not Applicable</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Property Falls Under Flood Zone</td>
                <td className={styles.valueCell}>
                  <select
                    name="PropertyFallsUnderFloodZone"
                    value={formData.PropertyFallsUnderFloodZone || ''}
                    onChange={handleChange}
                    className={styles.input}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Property Falls Under Cyclone Zone</td>
                <td className={styles.valueCell}>
                  <select
                    name="PropertyFallsUnderCycloneZone"
                    value={formData.PropertyFallsUnderCycloneZone || ''}
                    onChange={handleChange}
                    className={styles.input}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Property Falls in CRZ (Coastal Regulation Zone)</td>
                <td className={styles.valueCell}>
                  <select
                    name="PropertyFallsInCRZone"
                    value={formData.PropertyFallsInCRZone || ''}
                    onChange={handleChange}
                    className={styles.input}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Any Risk of Demolition</td>
                <td className={styles.valueCell}>
                  <select
                    name="AnyRiskOfDemolition"
                    value={formData.AnyRiskOfDemolition || ''}
                    onChange={handleChange}
                    className={styles.input}
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Degree of Risk Associated</td>
                <td className={styles.valueCell}>
                  <select
                    name="DegreeOfRiskAssociated"
                    value={formData.DegreeOfRiskAssociated || ''}
                    onChange={handleChange}
                    className={styles.input}
                  >
                    <option value="">Select</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Very High">Very High</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Remarks & Observations */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>REMARKS & OBSERVATIONS</h2>
          <table className={styles.table}>
            <tbody>
              <tr>
                <td className={styles.labelCell}>Remark 1</td>
                <td className={styles.valueCell}>
                  <textarea
                    name="remark1"
                    value={formData.remark1 || ''}
                    onChange={handleChange}
                    className={styles.textarea}
                    rows="3"
                    placeholder="Enter remark 1"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Remark 2</td>
                <td className={styles.valueCell}>
                  <textarea
                    name="remark2"
                    value={formData.remark2 || ''}
                    onChange={handleChange}
                    className={styles.textarea}
                    rows="3"
                    placeholder="Enter remark 2"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Remark 3</td>
                <td className={styles.valueCell}>
                  <textarea
                    name="remark3"
                    value={formData.remark3 || ''}
                    onChange={handleChange}
                    className={styles.textarea}
                    rows="3"
                    placeholder="Enter remark 3"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Remark 4</td>
                <td className={styles.valueCell}>
                  <textarea
                    name="remark4"
                    value={formData.remark4 || ''}
                    onChange={handleChange}
                    className={styles.textarea}
                    rows="3"
                    placeholder="Enter remark 4"
                  />
                </td>
              </tr>
              <tr>
                <td className={styles.labelCell}>Remark 5</td>
                <td className={styles.valueCell}>
                  <textarea
                    name="remark5"
                    value={formData.remark5 || ''}
                    onChange={handleChange}
                    className={styles.textarea}
                    rows="3"
                    placeholder="Enter remark 5"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Photo Documentation */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>PHOTO DOCUMENTATION</h2>
          <div className={styles.photoGrid}>
            <div className={styles.photoItem}>
              <h4>Front View</h4>
              <input
                type="file"
                name="photoFront"
                onChange={handleFileChange}
                accept="image/*"
                className={styles.fileInput}
              />
              {formData.photoFront && (
                <img src={formData.photoFront} alt="Front View" className={styles.photo} />
              )}
            </div>
            <div className={styles.photoItem}>
              <h4>Side View</h4>
              <input
                type="file"
                name="photoSide"
                onChange={handleFileChange}
                accept="image/*"
                className={styles.fileInput}
              />
              {formData.photoSide && (
                <img src={formData.photoSide} alt="Side View" className={styles.photo} />
              )}
            </div>
            <div className={styles.photoItem}>
              <h4>Interior View</h4>
              <input
                type="file"
                name="photoInterior"
                onChange={handleFileChange}
                accept="image/*"
                className={styles.fileInput}
              />
              {formData.photoInterior && (
                <img src={formData.photoInterior} alt="Interior View" className={styles.photo} />
              )}
            </div>
            <div className={styles.photoItem}>
              <h4>Additional View</h4>
              <input
                type="file"
                name="photoAdditional"
                onChange={handleFileChange}
                accept="image/*"
                className={styles.fileInput}
              />
              {formData.photoAdditional && (
                <img src={formData.photoAdditional} alt="Additional View" className={styles.photo} />
              )}
            </div>
          </div>
        </section>

        {/* Footer / Signature Section */}
        <section className={styles.footer}>
          <div className={styles.signatureSection}>
            <div className={styles.signatureBox}>
              <p><strong>Prepared By:</strong></p>
              <input
                type="text"
                name="preparedBy"
                value={formData.preparedBy || ''}
                onChange={handleChange}
                className={styles.input}
                placeholder="Name & Designation"
              />
              <p className={styles.signatureLine}>Signature: _________________</p>
              <p>Date: {getCurrentDate()}</p>
            </div>
            <div className={styles.signatureBox}>
              <p><strong>Verified By:</strong></p>
              <input
                type="text"
                name="verifiedBy"
                value={formData.verifiedBy || ''}
                onChange={handleChange}
                className={styles.input}
                placeholder="Name & Designation"
              />
              <p className={styles.signatureLine}>Signature: _________________</p>
              <p>Date: {getCurrentDate()}</p>
            </div>
            <div className={styles.signatureBox}>
              <p><strong>Approved By:</strong></p>
              <input
                type="text"
                name="approvedBy"
                value={formData.approvedBy || ''}
                onChange={handleChange}
                className={styles.input}
                placeholder="Name & Designation"
              />
              <p className={styles.signatureLine}>Signature: _________________</p>
              <p>Date: {getCurrentDate()}</p>
            </div>
          </div>
          <div className={styles.disclaimer}>
            <p><strong>DISCLAIMER:</strong></p>
            <p>
              This report is prepared based on the information provided and site inspection conducted on the mentioned date. 
              The valuation is subject to market conditions and may vary. This report is confidential and intended solely 
              for the use of the client mentioned herein. Any reproduction or distribution without written consent is prohibited.
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}

// Made with Bob
