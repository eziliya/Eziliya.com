import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import styles from './CholamandalamFinalReport.module.css'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export default function CholamandalamFinalReport() {
  const location = useLocation()
  const [formData, setFormData] = useState(() => location.state?.formData ?? {})
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const reportRef = useRef(null)

  useEffect(() => {
    if (location.state?.formData && Object.keys(location.state.formData).length > 0) {
      setFormData((prev) => ({ ...prev, ...location.state.formData }))
    }
  }, [location.state])

  const pdfFileName = useMemo(() => {
    const safe = (v) => String(v || '').trim().replace(/[<>:"/\\|?*\x00-\x1F]/g, '').replace(/\s+/g, '_').slice(0, 60)
    const date = new Date()
    const yyyy = String(date.getFullYear())
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const base = safe(formData.proposalIdApplicationNo) || safe(formData.applicantsName) || `report_${yyyy}${mm}${dd}`
    return `CHOLAMANDALAM_TECHNICAL_VALUATION_${base}_${yyyy}${mm}${dd}.pdf`
  }, [formData.applicantsName, formData.proposalIdApplicationNo])

  const handleDownloadPdf = async () => {
    if (!reportRef.current || isDownloadingPdf) return
    setIsDownloadingPdf(true)
    try {
      const element = reportRef.current
      const prevScrollX = window.scrollX
      const prevScrollY = window.scrollY
      element.scrollIntoView({ block: 'start', inline: 'nearest' })
      await new Promise((r) => requestAnimationFrame(() => r()))
      const canvas = await html2canvas(element, {
        scale: 1.75, useCORS: true, allowTaint: false, backgroundColor: '#ffffff', logging: false,
        windowWidth: element.scrollWidth || element.clientWidth, windowHeight: element.scrollHeight || element.clientHeight,
        onclone: (doc) => {
          const cloned = doc.querySelector('[data-pdf-root="cholamandalam"]')
          if (cloned) { cloned.classList.add(styles.pdfMode); cloned.style.backgroundColor = '#ffffff'; cloned.style.color = '#000000' }
        },
      })
      if (!canvas.width || !canvas.height) { toast.error('Could not capture the report. Try scrolling to the top and try again.'); return }
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' })
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
        const imgData = sliceCanvas.toDataURL('image/jpeg', 0.92)
        const sliceHeightMm = sliceHeightPx / pxPerMm
        if (pageIndex > 0) pdf.addPage()
        pdf.addImage(imgData, 'JPEG', margin, margin, contentWidthMm, sliceHeightMm, undefined, 'FAST')
        renderedHeightPx += sliceHeightPx
        pageIndex += 1
      }
      pdf.save(pdfFileName)
      toast.success('PDF downloaded successfully!')
    } catch (err) {
      console.error('PDF export failed:', err)
      const message = err instanceof Error ? err.message : typeof err === 'string' ? err : 'Unknown error'
      toast.error(`PDF failed: ${message}`)
    } finally {
      window.scrollTo(prevScrollX, prevScrollY)
      setIsDownloadingPdf(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const { name } = e.target
    const file = e.target.files?.[0]
    if (file) {
      // Convert file to base64 data URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [name]: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const nameOfvaluationAgency=formData.nameOfvaluationAgency||'';const dateOfTechnicalInitiation=formData.dateOfTechnicalInitiation||'';
  const applicantsName=formData.applicantsName||'';const dateOfSiteVisit=formData.dateOfSiteVisit||'';const requestFrom=formData.requestFrom||'';
  const dateOfReportRelease=formData.dateOfReportRelease||'';const proposalIdApplicationNo=formData.proposalIdApplicationNo||'';
  const transactionType=formData.transactionType||'';const requestedFrom=formData.requestedFrom||'';const currentOwnerSellerName=formData.currentOwnerSellerName||'';
  const personMetAtSiteName=formData.personMetAtSiteName||'';const contactNoForPersonMet=formData.contactNoForPersonMet||'';
  const addressAsPerTRF=formData.addressAsPerTRF||'';const addressAsPerLegalDocuments=formData.addressAsPerLegalDocuments||'';
  const addressAsPerActualSite=formData.addressAsPerActualSite||'';const documentsProvided=formData.documentsProvided||'';
  const statusHolding=formData.statusHolding||'';const deliveryAgency=formData.deliveryAgency||'';const typeOfProperty=formData.typeOfProperty||'';
  const stateName=formData.stateName||'';const mainLocality=formData.mainLocality||'';const subLocality=formData.subLocality||'';
  const Streetonwhichpropertyislocated=formData.Streetonwhichpropertyislocated||'';const NearestLandmark=formData.NearestLandmark||'';
  const Pincode=formData.Pincode||'';const OccupationStatus=formData.OccupationStatus||'';const PropertyUsage=formData.PropertyUsage||'';
  const PropertyIdentifiable=formData.PropertyIdentifiable||'';const PropertyDemarcatedSeparatly=formData.PropertyDemarcatedSeparatly||'';
  const PropertyIdentifiedThrough=formData.PropertyIdentifiedThrough||'';const CityTownVillage=formData.CityTownVillage||'';
  const RoofConstruction=formData.RoofConstruction||'';const TypeOfStructure=formData.TypeOfStructure||'';const NoOfFloors=formData.NoOfFloors||'';
  const LocatedOnFloor=formData.LocatedOnFloor||'';const ExternalFinishing=formData.ExternalFinishing||'';const TypesOfFlooring=formData.TypesOfFlooring||'';
  const PresentAge=formData.PresentAge||'';const FuturePhysicalLife=formData.FuturePhysicalLife||'';const Latitude=formData.Latitude||'';
  const Longitude=formData.Longitude||'';const InfrastructureInArea=formData.InfrastructureInArea||'';const ClassOfLocality=formData.ClassOfLocality||'';
  const TypeOfRoad=formData.TypeOfRoad||'';const WidthOfRoad=formData.WidthOfRoad||'';const ElectrificationElectricPolesObserved=formData.ElectrificationElectricPolesObserved||'';
  const DistanceFromBusStop=formData.DistanceFromBusStop||'';const DistanceFromMainMarket=formData.DistanceFromMainMarket||'';
  const DistanceFromRailwayStation=formData.DistanceFromRailwayStation||'';const PropertyFallsUnderSeismicZone=formData.PropertyFallsUnderSeismicZone||'';
  const PropertyFallsUnderFloodZone=formData.PropertyFallsUnderFloodZone||'';const PropertyfallsunderfloodZone=formData.PropertyfallsunderfloodZone||'';
  const PropertyFallsUnderCycloneZone=formData.PropertyFallsUnderCycloneZone||'';const PropertyFallsInCRZone=formData.PropertyFallsInCRZone||'';
  const DegreeOfRiskAssociated=formData.DegreeOfRiskAssociated||'';const AnyRiskOfDemolition=formData.AnyRiskOfDemolition||'';
  const BoundariesMatching=formData.BoundariesMatching||'';const ReasonForNonMatching=formData.ReasonForNonMatching||'';
  const LegalAreaEast=formData.LegalAreaEast||'';const LegalAreaWest=formData.LegalAreaWest||'';const LegalAreaNorth=formData.LegalAreaNorth||'';
  const LegalAreaSouth=formData.LegalAreaSouth||'';const LegalTotalArea=formData.LegalTotalArea||'';const ActualAreaEast=formData.ActualAreaEast||'';
  const ActualAreaWest=formData.ActualAreaWest||'';const ActualAreaNorth=formData.ActualAreaNorth||'';const ActualAreaSouth=formData.ActualAreaSouth||'';
  const ActualTotalArea=formData.ActualTotalArea||'';const Floor=formData.Floor||'';const Accommodation=formData.Accommodation||'';
  const CarpetAreaSanctioned=formData.CarpetAreaSanctioned||'';const CarpetAreaSite=formData.CarpetAreaSite||'';
  const PermissibleArea=formData.PermissibleArea||'';const AdoptedArea=formData.AdoptedArea||'';const LayoutplanDetails=formData.LayoutplanDetails||'';
  const BuildingSanctionApprovedPlanDetails=formData.BuildingSanctionApprovedPlanDetails||'';const CommencementCertificate=formData.CommencementCertificate||'';
  const CompletionCertificate=formData.CompletionCertificate||'';const OtherDocuments=formData.OtherDocuments||'';
  const OwnershipDocuments=formData.OwnershipDocuments||'';const PropertyOwner=formData.PropertyOwner||'';const IfPlansNotAvailable=formData.IfPlansNotAvailable||'';
  const LandPlotArea=formData.LandPlotArea||'';const AdoptableBuiltUpArea=formData.AdoptableBuiltUpArea||'';const ConstructionCost=formData.ConstructionCost||'';
  const RecommendedRate=formData.RecommendedRate||'';const TotalConstructionValue=formData.TotalConstructionValue||'';
  const SpecialAmenities=formData.SpecialAmenities||'';const AdditionalCost=formData.AdditionalCost||'';const TotalLandValue=formData.TotalLandValue||'';
  const TotalFairMarketValue=formData.TotalFairMarketValue||'';const TotalRealizableValue=formData.TotalRealizableValue||'';
  const TotalForcedDistressedValue=formData.TotalForcedDistressedValue||'';const TotalForcedDistressedValuePresent=formData.TotalForcedDistressedValuePresent||'';
  const SBUA=formData.SBUA||'';const AdoptedRate=formData.AdoptedRate||'';const TotalValue=formData.TotalValue||'';
  const TotalRealizableValuePresent=formData.TotalRealizableValuePresent||'';const PercentageCompletion=formData.PercentageCompletion||'';
  const RecommendedConstructionValue=formData.RecommendedConstructionValue||'';const GovernmentGuidelineLand=formData.GovernmentGuidelineLand||'';
  const LandValue=formData.LandValue||'';const GovernmentGuidelineFlat=formData.GovernmentGuidelineFlat||'';const FlatValue=formData.FlatValue||'';
  const ForcedSaleValue=formData.ForcedSaleValue||'';const AverageRental=formData.AverageRental||'';const RealizableValue=formData.RealizableValue||'';
  const remark1=formData.remark1||'';const remark2=formData.remark2||'';const remark3=formData.remark3||'';const remark4=formData.remark4||'';const remark5=formData.remark5||'';

  return (
    <div className={styles.container}>
      <div className={styles.downloadSection}>
        <button onClick={handleDownloadPdf} disabled={isDownloadingPdf} className={styles.downloadBtn}>
          {isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>
      <div ref={reportRef} data-pdf-root="cholamandalam">
        <div>
          <table>
            <caption>TECHNICAL VALUVATION REPORT</caption> 
             <tr><th> <label for="nameOfvaluationAgency">Name of valuation Agency :</label></th>
             <th colSpan="2"><input list="Name of valuation Agency" name='nameOfvaluationAgency' id='nameOfvaluationAgency' value={nameOfvaluationAgency} onChange={handleInputChange} />
             <datalist id="Name of valuation Agency">
                  <option value="Vishal">Vishal</option>
                  <option value="Vivek">Vivek</option>
                </datalist> </th>
              <th><lable for='dateOfTechnicalInitiation'>Date of Technical Initiation :</lable></th>
              <th colSpan="2"><input type='text' name='dateOfTechnicalInitiation' id='dateOfTechnicalInitiation' value={dateOfTechnicalInitiation} onChange={handleInputChange}></input></th></tr>
    
             <tr> <th><lable for='applicantsName'>Applicant/s Name/s :</lable></th>
              <th colSpan="2"><input type='text' name='applicantsName' id='applicantsName' value={applicantsName} onChange={handleInputChange}></input></th>
              <th><lable for='dateOfSiteVisit'>Date of Site Visit :</lable></th>
              <th colSpan="2"><input type='text' name='dateOfSiteVisit' id='dateOfSiteVisit' value={dateOfSiteVisit} onChange={handleInputChange}></input></th></tr>
            
             <tr> <th ><lable for='requestFrom'>Request from :</lable></th>
              <th colSpan="2"><input type='text' name='requestFrom' id='requestFrom' value={requestFrom} onChange={handleInputChange}></input></th>
    
              <th ><lable for='dateOfReportRelease'>Date of Report release :</lable></th>
              <th colSpan="2"><input type='text' name='dateOfReportRelease' id='dateOfReportRelease' value={dateOfReportRelease} onChange={handleInputChange}></input></th></tr>
            
             <tr> <th ><lable for='proposalIdApplicationNo'>Proposal ID/Application No :</lable></th>
              <th colSpan="2"><input type='text' name='proposalIdApplicationNo' id='proposalIdApplicationNo' value={proposalIdApplicationNo} onChange={handleInputChange}></input></th>
              <th><lable for='transactionType'>Transaction type :</lable></th>
            
              <th colSpan="2"><input type='text' name='transactionType' id='transactionType' value={transactionType} onChange={handleInputChange}></input><br></br></th></tr>
    
             <tr> <th><lable for='branchNameId'>Branch name/ID :</lable></th>
              <th colSpan="2"><input type='text' name='branchNameId' id='branchNameId' value={formData.branchNameId ?? ''} onChange={handleInputChange}></input></th>
              <th><lable for='requestedFrom'>Requested From :</lable></th>
              <th colSpan="2"><input type='text' name='requestedFrom' id='requestedFrom' value={requestedFrom} onChange={handleInputChange}></input><br></br></th></tr>
            
    
             <tr> <th><lable for='currentOwnerSellerName'>Name of Current Owner/Seller :</lable></th>
              <th colSpan="2"><input type='text' name='currentOwnerSellerName' id='currentOwnerSellerName' value={currentOwnerSellerName} onChange={handleChange}></input></th>
              <th><lable for='personMetAtSiteName'>Name of the person met at a site :</lable></th>
              <th colSpan="2"><input type='text' name='personMetAtSiteName' id='personMetAtSiteName' value={personMetAtSiteName} onChange={handleChange}></input><br></br></th>
            </tr>
    
    
            <th><lable for='contactNoForPersonMet'>Contact No for person met :</lable></th>
            <th colSpan="5"><input type='number' name='contactNoForPersonMet' id='contactNoForPersonMet' value={contactNoForPersonMet} onChange={handleChange}></input></th>
    
            <tr>
              <th colSpan="6"><h3>BASIC DEATAILS :</h3></th>
            </tr>
    
            <tr>
              <th colSpan="6"><h4>Adress of the property being appraised :</h4></th>
            </tr>
              
            <tr>
              <th ><lable for='addressAsPerTRF'>Address As per TRF :</lable></th>
              <th colSpan="5"><input type='text' name='addressAsPerTRF' id='addressAsPerTRF' value={addressAsPerTRF} onChange={handleChange}></input><br></br></th>
            </tr>
    
            <tr>
              <th> <lable for='addressAsPerLegalDocuments'>Address as per Legal documenst :</lable></th>
              <th colSpan="5"> <input type='text' name='addressAsPerLegalDocuments' id='addressAsPerLegalDocuments' value={addressAsPerLegalDocuments} onChange={handleChange}></input><br></br></th></tr>
    
            <tr>
              <th ><lable for='addressAsPerActualSite'>Address as per actual at site :</lable></th>
              <th colSpan="5"><input type='text' name='addressAsPerActualSite' id='addressAsPerActualSite' value={addressAsPerActualSite} onChange={handleChange}></input></th>
            </tr>
    
            <tr>
              <th><lable for='documentsProvided'>Documents as Provided :</lable></th>
              <th colSpan="5"><input type='text' name='documentsProvided' id='documentsProvided' value={documentsProvided} onChange={handleChange}></input><br></br></th></tr>
    
            <tr>
    
              <th><label for="Status Holding">Status Holding :</label></th>
              <th colSpan="2"><input list="Status Holding" name='statusHolding' id='statusHolding' value={statusHolding} onChange={handleChange} />
                <datalist id="Status Holding">
                  <option value="Free Hold"></option>
                  <option value="Lease Holding"></option>
                </datalist></th>
    
              <th><lable for='deliveryAgency'>Delivery Agency :</lable></th>
              <th colSpan="2"><input type='text' name='deliveryAgency' id='deliveryAgency' value={deliveryAgency} onChange={handleChange}></input><br></br></th>
            </tr>
    
            <tr>
    
              <th><label for='TypeofProperty'>Type of Property :</label></th>
              <th colSpan="2"><input list="TypeofProperty" name='typeOfProperty' id='typeOfProperty' value={typeOfProperty} onChange={handleChange} />
                <datalist id='TypeofProperty'>
                  <option value="Flat"></option>
                  <option value="Bungalow"></option>
                  <option value="Row House"></option>
                  <option value="Duplex"></option>
                  <option value="Shop"></option>
                  <option value="Godown"></option>
                  <option value="Office"></option>
                  <option value="Industrial"></option>
                  <option value="Plot"></option>
                  <option value="Under-Construction"></option>
                </datalist></th>
    
              <th><label for="stateName">Name of the state :</label></th>
              <th colSpan="2"><input list="State" name='stateName' id='stateName' value={stateName} onChange={handleChange} />
                <datalist id="StateName">
                  <option value="Maharashtra"></option>
                </datalist><br></br></th>
            </tr>
    
            <tr>
    
              <th><label for="mainLocality">Main Locality :</label></th>
              <th colSpan="2"><input list="Locality" name='mainLocality' id='mainLocality' value={mainLocality} onChange={handleChange} />
                <datalist id="Locality">
                  <option value="Nashik"></option>
                </datalist></th>
    
              <th><label for='subLocality'>Sub-Locality :</label></th>
              <th colSpan="2"><input list="Sub-Locality" name='subLocality' id='subLocality' value={subLocality} onChange={handleChange} />
                <datalist id="Sub-Locality">
                  <option value="Nashik"></option>
                </datalist><br></br></th></tr>
    
            <tr><th><lable for='Streetonwhichpropertyislocated'>Street on which property is located :</lable></th>
              <th colSpan="2"><input type='text' name='Streetonwhichpropertyislocated' id='Streetonwhichpropertyislocated' value={Streetonwhichpropertyislocated} onChange={handleChange}></input></th>
              <th><lable for='NearestLandmark'>Nearest Landmark :</lable></th>
              <th colSpan="2"><input type='text' name='NearestLandmark' id='NearestLandmark' value={NearestLandmark} onChange={handleChange}></input></th></tr>
    
            <tr><th><lable for='Pincode'>Pincode :</lable></th>
              <th colSpan="2"><input type='number' name='Pincode' id='Pincode' value={Pincode} onChange={handleChange}></input></th>
    
              <th><label for='OccupationStatus'>Occupation Status :</label></th>
              <th colSpan="2"><input list="Occupation Status" name='OccupationStatus' id='OccupationStatus' value={OccupationStatus} />
                <datalist id='Occupation Status'>
                  <option value='Fully'></option>
                  <option value='Partly'></option>
                  <option value='Vacant'></option>
                  <option value='Under-Construction'></option>
                </datalist></th></tr>
    
            <tr><th><label for='Locality/zoningtypeasperLatestDevelopmentMasterPlan'>Locality/zoning type as per Latest Development Master Plan :</label></th>
              <th colSpan="2"><input list="Locality/zoning type as per Latest Development Master Plan" name='Locality/zoning typeasperLatestDevelopmentMasterPlan' id='Locality/zoningtypeasperLatestDevelopmentMasterPlan' value={formData['Locality/zoning typeasperLatestDevelopmentMasterPlan'] ?? formData.LocalityzoningtypeasperLatestDevelopmentMasterPlan ?? ''} onChange={handleChange} />
                <datalist id="Locality/zoning type as per Latest Development Master Plan">
                  <option value="Residential"></option>
                  <option value="Industrial"></option>
                  <option value="Commercial"></option>
                  <option value="Agriculture"></option>
                </datalist></th>
    
              <th><label for="PropertyUsage">Property Usage :</label></th>
              <th colSpan="2"><input list="Property Usage" name='PropertyUsage' id='PropertyUsage' value={PropertyUsage} />
                <datalist id="Property Usage">
                  <option value="Residential"></option>
                  <option value="Shop"></option>
                  <option value="Gowdown"></option>
                  <option value="Office"></option>
                  <option value="Industrial"></option>
                  <option value="Plot"></option>
                  <option value="Commercial"></option>
                </datalist></th></tr>
    
              <tr><th><label for='PropertyIdentifiable'>Property Identifiable :</label></th>
              <th colSpan="2"><input list="Property Identifiable" name='PropertyIdentifiable' id='PropertyIdentifiable' value={PropertyIdentifiable} />
                <datalist id='Property Identifiable'>
                  <option value='Yes'></option>
                  <option value='No'></option>
                </datalist></th>
    
              <th><label for='PropertyDemarcatedSeparatly'>Property Demarcated Separatly :</label></th>
              <th colSpan="2"><input list="Property Demarcated Separatly" name='PropertyDemarcatedSeparatly' id='PropertyDemarcatedSeparatly' value={PropertyDemarcatedSeparatly} />
                <datalist id="Property Demarcated Separatly">
                  <option value="Yes"></option>
                  <option value="No"></option>
                </datalist><br></br></th></tr>
    
            <tr><th><label for='PropertyIdentifiedThrough'>Property Identified through :</label></th>
              <th colSpan="2"><input list='Property Identified Through' name='PropertyIdentifiedThrough' id='PropertyIdentifiedThrough' value={PropertyIdentifiedThrough} />
                <datalist id='Property Identified Through'>
                  <option value='Person met at Site'></option>
                </datalist></th>
                
              <th><lable for='name'>Name of City/Town/Village :</lable></th>
              <th colSpan="2"><input type='text' name='CityTownVillage' id='CityTownVillage' value={CityTownVillage}></input><br></br></th>
            </tr>
    
            <tr><th> <label for="Roof Construction">Roof Construction :</label></th>
              <th colSpan="2"><input list="Roof Construction" name='RoofConstruction' id='RoofConstruction' value={RoofConstruction} />
                <datalist id="Roof Construction">
                  <option value="RCC"></option>
                  <option value="Load Bearing"></option>
                  <option value="Under-Construction"></option>
                </datalist></th>
    
              <th><label for="Type of Structure">Type of Structure :</label></th>
              <th colSpan="2"><input list="Type of Structure" name='TypeOfStructure' id='TypeOfStructure' value={TypeOfStructure} />
                <datalist id="Type of Structure">
                  <option value="RCC"></option>
                  <option value="Load Bearing"></option>
                  <option value="Steel Structure with bricks wall And AC Sheet roofing"></option>
                </datalist><br></br></th></tr>
    
            <tr><th><label for="No.ofFloorsintheBuilding">No.of Floors in the Building :</label></th>
              <th colSpan="2"><input list="No.of Floors in the Building" name='NoOfFloors' id='NoOfFloors' value={NoOfFloors} />
                <datalist id="No.of Floors in the Building">
                  <option value="Ground + one"></option>
                  <option value="Ground + two"></option>
                  <option value="Ground + Three"></option>
                </datalist></th>
              <th><lable for='name'>Located on Floor No. :</lable></th>
              <th colSpan="2"><input type='number' name='LocatedOnFloor' id='LocatedOnFloor' value={LocatedOnFloor}></input><br></br></th></tr>
    
    
            <tr><th><label for="ExternalFinishing">External Finishing :</label></th>
              <th colSpan="2"><input list="External Finishing" name='ExternalFinishing' id='ExternalFinishing' value={ExternalFinishing} />
                <datalist id="External Finishing">
                  <option value="Average"></option>
                  <option value="Fair"></option>
                  <option value="Good"></option>
                  <option value="Very Good"></option>
                  <option value="Under-Construction"></option>
                </datalist></th>
                
    
              <th><label for="Typesofflooring">Types of flooring :</label></th>
              <th colSpan="2"><input list="Types of flooring" name='TypesOfFlooring' id='TypesOfFlooring' value={TypesOfFlooring} />
                <datalist id="Types of flooring">
                  <option value="Vitrified"></option>
                  <option value="Granite"></option>
                  <option value="Marble"></option>
                  <option value="Italian Marble Flooring"></option>
                  <option value="Mosaic tile"></option>
                  <option value="Kota"></option>
                </datalist><br></br></th></tr>
    
            <tr><th><lable for='name'>Present Age of the property in yrs :</lable></th>
              <th colSpan="2"><input type='number' name='PresentAge' id='PresentAge' value={PresentAge}></input></th>
    
              <th><lable for='name'>Future Physical Life of property in yrs :</lable></th>
              <th colSpan="2"><input type='number' name='FuturePhysicalLife' id='FuturePhysicalLife' value={FuturePhysicalLife}></input><br></br></th></tr>
    
            <tr><th><lable for='name'>Latitude :</lable></th>
              <th colSpan="2"><input type='text' name='Latitude' id='Latitude' value={Latitude}></input></th>
    
              <th><lable for='name'>Longitude :</lable></th>
              <th colSpan="2"><input type='text' name='Longitude' id='Longitude' value={Longitude}></input><br></br></th></tr>
    
            <tr><th><label for="Infrastructureinthearea">Infrastructure in the area :</label></th>
              <th colSpan="2"><input list="Infrastructure in the area" name='InfrastructureInArea' id='InfrastructureInthearea' value={InfrastructureInArea} />
                <datalist id="Infrastructure in the area">
                  <option value="Average"></option>
                  <option value="Fair"></option>
                  <option value="Good"></option>
                  <option value="Very Good"></option>
                  <option value="Under Developed"></option>
                </datalist></th>
    
              <th><label for="ClassofLocality">Class of Locality :</label></th>
              <th colSpan="2"><input list="Class of Locality" name='ClassOfLocality' id='ClassOfLocality' value={ClassOfLocality} />
                <datalist id="Class of Locality">
                  <option value="High-end Class"></option>
                  <option value="Upper-Mid-end Class"></option>
                  <option value="Mid-end Class"></option>
                  <option value="Lower Class"></option>
                </datalist><br></br></th></tr>
    
            <tr><th><label for="TypeofRoad">Type of Road :</label></th>
              <th colSpan="2"><input list="Type of Road" name='TypeOfRoad' id='TypeOfRoad' value={TypeOfRoad} />
                <datalist id="Type of Road">
                  <option value="Cocreat"></option>
                  <option value="Tar"></option>
                  <option value="WBM"></option>
                  <option value="Pandhan Road"></option>
                </datalist></th>
    
              <th><label for="Width of Road(Fit)">Width of Road :(Fit)</label></th>
              <th colSpan="2"><input list="Width of Road(Fit)" name='WidthOfRoad' id='WidthOfRoad' value={WidthOfRoad} />
                <datalist id="Width of Road(Fit)">
                  <option value="5 feet"></option>
                  <option value="10 Feet"></option>
                  <option value="15 fett"></option>
                  <option value="20 feet"></option>
                </datalist><br></br></th></tr>
    
            <tr><th><label for="Electrification/Electric poles observed">Electrification/Electric poles observed :</label></th>
              <th colSpan="2"><input list="Electrification/Electric poles observed" name='ElectrificationElectricPolesObserved' id='ElectrificationElectricPolesObserved' value={ElectrificationElectricPolesObserved} />
                <datalist id="Electrification/Electric poles observed">
                  <option value="Yes"></option>
                  <option value="No"></option>
                </datalist></th>
    
              <th><lable for='name'>Distance from Bus Stop(KM) :</lable></th>
              <th colSpan="2"><input type='text' name='DistanceFromBusStop' id='DistanceFromBusStop' value={DistanceFromBusStop}></input><br></br></th>
            </tr>
    
            <tr><th><lable for='name'>Distance from Main Market(KM) :</lable></th>
              <th colSpan="2"><input type='text' name='DistanceFromMainMarket' id='DistanceFromMainMarket' value={DistanceFromMainMarket}></input></th>
    
              <th><lable for='name'>Distance from Railway Station(KM) :</lable></th>
              <th colSpan="2"> <input type='text' name='DistanceFromRailwayStation' id='DistanceFromRailwayStation' value={DistanceFromRailwayStation}></input><br></br></th></tr>
    
            <tr><th><label for="PropertyfallsunderSeismicZone:">Property falls under Seismic Zone :    </label></th>
              <th colSpan="2"><input list="Property falls under Seismic Zone:" name='PropertyFallsUnderSeismicZone' id='PropertyFallsUnderSeismicZone' value={PropertyFallsUnderSeismicZone} />
                <datalist id="Property falls under Seismic Zone:">
                  <option value="Zone III"></option>
                </datalist></th>
    
                <th><label for="PropertyFallsUnderFloodZone">Property falls Under Flood Zone :</label></th>
                      <th colSpan="2"><input list="Property falls Under Flood Zone" name='PropertyFallsUnderFloodZone' id='PropertyFallsUnderFloodZone' value={PropertyFallsUnderFloodZone} />
                      <datalist id="Property falls Under Flood Zone">
                        <option value="Yes"></option>
                        <option value="No"></option>
                      </datalist></th>
                    </tr>
                    <tr><th><label for="PropertyfallsunderfloodZone">Property falls under flood Zone :</label></th>
                      <th colSpan="2"><input list="Property falls under flood Zone" name='PropertyfallsunderfloodZone' id='PropertyfallsunderfloodZone' value={PropertyfallsunderfloodZone} onChange={handleChange} />
                        <datalist id="Property falls under flood Zone">
                          <option value="Yes"></option>
                          <option value="No"></option>
                        </datalist></th>
    
                      <th><label for='PropertyFallsUnderCycloneZone'>Property falls under Cyclone Zone :</label></th>
                      <th colSpan="2"><input list='Property Falls Under Cyclone Zone' name='PropertyFallsUnderCycloneZone' id='PropertyFallsUnderCycloneZone' value={PropertyFallsUnderCycloneZone} onChange={handleChange} />
                        <datalist id="Property Falls Under Cyclone Zone">
                          <option value="Yes"></option>
                          <option value="No"></option>
                        </datalist></th>
                    </tr>
            <tr><th><lable for='PropertyFallsUnderCycloneZone'>Property falls under Cyclone Zone :
              </lable></th><th colSpan="2"><input list='Property Falls Under Cyclone Zone' name='PropertyFallsUnderCycloneZone' id='PropertyFallsUnderCycloneZone' value={PropertyFallsUnderCycloneZone}/>
               <datalist id="Property falls Under Cyclone Zone">
                        <option value="Yes"></option>
                        <option value="No"></option>
                      </datalist></th>
              
              <th><lable for='PropertyFallsInCRZone'>Property falls in CR Zone :</lable></th>
              <th colSpan="2"><input list='Property Falls In CR Zone' name='PropertyFallsInCRZone' id='PropertyFallsInCRZone' value={PropertyFallsInCRZone}/>
              <datalist id="Property falls Under CR Zone">
                        <option value="Yes"></option>
                        <option value="No"></option>
                      </datalist></th>
            </tr>
    
            <tr><th><label for="Degree of Risk Associated">Degree of Risk Associated :</label></th>
              <th colSpan="2"><input list="Degree of Risk Associated" name='DegreeOfRiskAssociated' id='DegreeOfRiskAssociated' value={DegreeOfRiskAssociated} />
                <datalist id="Degree of Risk Associated">
                  <option value="Low"></option>
                  <option value="High"></option>
                </datalist></th>
    
              <th><label for="AnyriskofDemolition">Any risk of Demolition :</label></th>
              <th colSpan="2"><input list="Any risk of Demolition" name='AnyRiskOfDemolition' id='AnyRiskOfDemolition' value={AnyRiskOfDemolition} />
                <datalist id="Any risk of Demolition">
                  <option value="Low"></option>
                  <option value="High"></option>
                </datalist><br></br></th></tr>
    
            <tr><th colSpan="6"><h3>BOUNDARIES :</h3></th></tr>
            <tr><th colSpan="6"><h4>Boundaries of Building/Apartment :</h4></th></tr>
            <tr><th><h4>Direction</h4></th>
              <th><h4>East</h4></th>
              <th><h4>West</h4></th>
              <th><h4>North</h4></th>
              <th colSpan="2"><h4>South</h4></th></tr>
    
            <tr> <th><h4>As per Documents/Plan : </h4></th>
              <td><input for='East' type="text" placeholder='East' id='East' className={styles.input} /></td>
              <td> <input type="text" placeholder='West' className={styles.input} /></td>
              <td><input type="text" placeholder='North' className={styles.input} /></td>
              <td colSpan="2"><input type="text" placeholder='South' className={styles.input} /></td></tr>
    
            <tr><td><h4>Actual at site :</h4></td>
              <td><input type="text" placeholder='East' className={styles.input} /></td>
              <td><input type="text" placeholder='West' className={styles.input} /></td>
              <td><input type="text" placeholder='North' className={styles.input} /></td>
              <td colSpan="2"><input type="text" placeholder='South' className={styles.input} /></td></tr>
    
            <tr><td> <lable for='BoundariesMatching'>Boundaries Matching :</lable></td>
              <th colSpan="1"><input list='Boundaries Matching' type='text' name='BoundariesMatching' id='BoundariesMatching' value={BoundariesMatching}/>
              <datalist id="Boundaries Matching">
                        <option value="Yes"></option>
                        <option value="No"></option>
                      </datalist></th>
              
              <td><lable for='ReasonForNonMatching'>If No,then reason theron :</lable></td>
              <th colSpan="4"> <input type='text' name='ReasonForNonMatching' id='ReasonForNonMatching' value={ReasonForNonMatching}></input></th></tr>
    
            <tr><td colSpan="6"><h4>Plot dimension details (In Ft) for Independent Built up :</h4></td></tr>
    
            <tr> <th><h3>Direction :</h3></th>
              <th><h4>East</h4></th>
              <th><h4>West</h4></th>
              <th><h4>North</h4></th>
              <th><h4>South</h4></th>
              <th><h4>Total Area in Sqft</h4></th></tr>
    
            <tr>
              <td><h4>Legal Area as per Docs in Sfqt :</h4></td>
              <td><input type="text" name='LegalAreaEast' id='LegalAreaEast' value={LegalAreaEast} placeholder='East' className={styles.input} /></td>
              <td><input type="text" name='LegalAreaWest' id='LegalAreaWest' value={LegalAreaWest} placeholder='West' className={styles.input} /></td>
              <td><input type="text" name='LegalAreaNorth' id='LegalAreaNorth' value={LegalAreaNorth} placeholder='North' className={styles.input} /></td>
              <td><input type="text" name='LegalAreaSouth' id='LegalAreaSouth' value={LegalAreaSouth} placeholder='South' className={styles.input} /></td>
              <td><input type="text" name='LegalTotalArea' id='LegalTotalArea' value={LegalTotalArea} placeholder='Total Area in Sqft' className={styles.input} /></td>
            </tr>
    
    
            <tr> <td><h4>Actual Area at site in Sqft :</h4></td>
              <td><input type="text" name='ActualAreaEast' id='ActualAreaEast' value={ActualAreaEast} placeholder='East' className={styles.input} /></td>
              <td><input type="text" name='ActualAreaWest' id='ActualAreaWest' value={ActualAreaWest} placeholder='West' className={styles.input} /></td>
              <td><input type="text" name='ActualAreaNorth' id='ActualAreaNorth' value={ActualAreaNorth} placeholder='North' className={styles.input} /></td>
              <td><input type="text" name='ActualAreaSouth' id='ActualAreaSouth' value={ActualAreaSouth} placeholder='South' className={styles.input} /></td>
              <td><input type="text" name='ActualTotalArea' id='ActualTotalArea' value={ActualTotalArea} placeholder='Total Area in sqft' className={styles.input} /></td>
            </tr>
    
            <tr><td colSpan="6"><h3>Area & Accommodation Details :</h3></td></tr>
    
            <tr>
              <td> <h4>Floor</h4></td>
              <td> <h4>Accommodation</h4></td>
              <td><h4>Carpet Area in sq.ft.As per Sanctioned Plan</h4></td>
              <td><h4>Carpet Area in sq.ft.As per Site Measurements</h4></td>
              <td>  <h4>Permissible/plan Area in sq.ft.</h4></td>
              <td> <h4>Adopted Area in sq.ft.</h4></td>
            </tr>
            <tr>
              <td> <input type="text" name='Floor' id='Floor' value={Floor} placeholder='Ground Floor' className={styles.input} /></td>
              <td> <input type="text" name='Accommodation' id='Accommodation' value={Accommodation} placeholder='Ground Floor Accommodation' className={styles.input} /></td>
              <td> <input type="text" name='CarpetAreaSanctioned' id='CarpetAreaSanctioned'placeholder='Ground Floor Carpet Area in sq.ft.As per Sanctioned Plan' value={CarpetAreaSanctioned}  className={styles.input} /></td>
              <td> <input type="text" name='CarpetAreaSite' id='CarpetAreaSite' placeholder='Ground Floor Carpet Area in sq.ft.As per Site Measurements' value={CarpetAreaSite} className={styles.input} /></td>
              <td> <input type="text" name='PermissibleArea' id='PermissibleArea'placeholder='Ground Floor Permissible/plan Area in sq.ft.' value={PermissibleArea} className={styles.input} /></td>
              <td> <input type="text" name='AdoptedArea' id='AdoptedArea' value={AdoptedArea} placeholder='Ground Floor Adopted Area in sq.ft.'className={styles.input} /></td>
            </tr>
    
            <tr>
              <td><input type="text" name='Floor' id='Floor' value={Floor} placeholder='First Floor' className={styles.input} /></td>
              <td><input type="text" name='Accommodation' id='Accommodation' value={Accommodation} placeholder='First Floor Accommodation' className={styles.input} /></td>
              <td><input type="text" name='CarpetAreaSanctioned' id='CarpetAreaSanctioned' value={CarpetAreaSanctioned} placeholder='First Floor Carpet Area in sq.ft.As per Sanctioned Plan' className={styles.input} /></td>
              <td><input type="text" name='CarpetAreaSite' id='CarpetAreaSite' value={CarpetAreaSite} placeholder='First Floor Carpet Area in sq.ft.As per Site Measurements' className={styles.input} /></td>
              <td><input type="text" name='PermissibleArea' id='PermissibleArea' value={PermissibleArea} placeholder='First Floor Permissible/plan Area in sq.ft.' className={styles.input} /></td>
              <td><input type="text" name='AdoptedArea' id='AdoptedArea' value={AdoptedArea} placeholder='First Floor Adopted Area in sq.ft' className={styles.input} /></td>
            </tr>
    
            <tr>
              <td><input type="text" name='Floor' id='Floor' value={Floor} placeholder='Second Floor' className={styles.input} /></td>
              <td><input type="text" name='Accommodation' id='Accommodation' value={Accommodation} placeholder='Second Floor Accommodation' className={styles.input} /></td>
              <td><input type="text" name='CarpetAreaSanctioned' id='CarpetAreaSanctioned' value={CarpetAreaSanctioned} placeholder='Second Floor Carpet Area in sq.ft.As per Sanctioned Plan' className={styles.input} /></td>
              <td><input type="text" name='CarpetAreaSite' id='CarpetAreaSite' value={CarpetAreaSite} placeholder='Second Floor Carpet Area in sq.ft.As per Site Measurements' className={styles.input} /></td>
              <td><input type="text" name='PermissibleArea' id='PermissibleArea' value={PermissibleArea} placeholder='Second Floor Permissible/plan Area in sq.ft.' className={styles.input} /></td>
              <td><input type="text" name='AdoptedArea' id='AdoptedArea' value={AdoptedArea} placeholder='Second Floor Adopted Area in sq.ft' className={styles.input} /></td>
            </tr>
            <tr>
              <td><input type="text" name='Floor' id='Floor' value={Floor} placeholder='Third Floor' className={styles.input} /></td>
              <td><input type="text" name='Accommodation' id='Accommodation' value={Accommodation} placeholder='Third Floor Accommodation' className={styles.input} /></td>
              <td><input type="text" name='CarpetAreaSanctioned' id='CarpetAreaSanctioned' value={CarpetAreaSanctioned} placeholder='Third Floor Carpet Area in sq.ft.As per Sanctioned Plan' className={styles.input} /></td>
              <td><input type="text" name='CarpetAreaSite' id='CarpetAreaSite' value={CarpetAreaSite} placeholder='Third Floor Carpet Area in sq.ft.As per Site Measurements' className={styles.input} /></td>
              <td><input type="text" name='PermissibleArea' id='PermissibleArea' value={PermissibleArea} placeholder='Third Floor Permissible/plan Area in sq.ft.' className={styles.input} /></td>
              <td><input type="text" name='AdoptedArea' id='AdoptedArea' value={AdoptedArea} placeholder='Third Floor Adopted Area in sq.ft' className={styles.input} /></td>
            </tr>
    
            <tr>
              <td><input type="text" name='Floor' id='Floor' value={Floor} placeholder='Fourth Floor' className={styles.input} /></td>
              <td><input type="text" name='Accommodation' id='Accommodation' value={Accommodation} placeholder='Fourth Floor' className={styles.input} /></td>
              <td><input type="text" name='CarpetAreaSanctioned' id='CarpetAreaSanctioned' value={CarpetAreaSanctioned} placeholder='Fourth Floor Carpet Area in sq.ft.As per Sanctioned Plan' className={styles.input} /></td>
              <td><input type="text" name='CarpetAreaSite' id='CarpetAreaSite' value={CarpetAreaSite} placeholder='Fourth Floor Carpet Area in sq.ft.As per Sanctioned Plan' className={styles.input} /></td>
              <td><input type="text" name='PermissibleArea' id='PermissibleArea' value={PermissibleArea} placeholder='Fourth Floor Permissible/plan Area in sq.ft.' className={styles.input} /></td>
              <td><input type="text" name='AdoptedArea' id='AdoptedArea' value={AdoptedArea} placeholder='Fourth Floor Adopted Area in sq.ft' className={styles.input} /></td>
            </tr>
    
            <tr><td ><lable for='Total-Loading%onCarpetArea+BalconyArea+DryBalconey'>Total-Loading % on Carpet Area +Balcony Area+Dry Balconey :</lable></td>
            <td colSpan="2"><input type='text' name='Total-Loading%onCarpetArea+BalconyArea+DryBalconey' id='Total-Loading%onCarpetArea+BalconyArea+DryBalconey' value={formData['Total-Loading%onCarpetArea+BalconyArea+DryBalconey'] ?? ''} onChange={handleChange}></input></td>
    
            <td ><lable for='TotalAreaWithLoading'>Total Area with Loading (Sq/ft) :</lable></td>
            <td colSpan="2"><input type='text' name='TotalAreaWithLoading' id='TotalAreaWithLoading' value={formData.TotalAreaWithLoading ?? ''} onChange={handleChange}></input></td>
            </tr>
            
    
            <tr><th colSpan="6"><h3>Building Approvals & Related Documents :</h3></th></tr>
    
            <tr><td><h3>Documents Name :</h3></td>
              <td colSpan="5"><h3>Document Value :</h3></td></tr>
     
            <tr><td> <lable for='name'>Layout plan Details :</lable></td>
              <td colSpan="5"><input type='text' name='LayoutplanDetails' id='LayoutplanDetails' value={LayoutplanDetails}></input><br></br></td></tr>
    
            <tr><th><lable for='name'>Building sanction/Approved Plan Details :</lable></th>
              <th colSpan="5"><input type='text' name='BuildingSanctionApprovedPlanDetails' id='BuildingSanctionApprovedPlanDetails' value={BuildingSanctionApprovedPlanDetails}></input><br></br></th></tr>
    
            <tr><th> <lable for='name'>Commencement Certificate :</lable></th>
              <th colSpan="5"><input type='text' name='CommencementCertificate' id='CommencementCertificate' value={CommencementCertificate}></input></th></tr>
    
    
            <tr><th><lable for='name'>Completion Certificate/Occupation Certificate No./BCC :</lable></th>
              <th colSpan="5"><input type='text' name='CompletionCertificate' id='CompletionCertificate' value={CompletionCertificate}></input><br></br></th></tr>
    
            <tr><th><lable for='name'>Other Documents :</lable></th>
              <th colSpan="5"><input type='text' name='OtherDocuments' id='OtherDocuments' value={OtherDocuments}></input><br></br></th></tr>
    
            <tr> <td><lable for='name'>Ownership Documents :</lable></td>
              <td colSpan="5"><input type='text' name='OwnershipDocuments' id='OwnershipDocuments' value={OwnershipDocuments}></input><br></br></td></tr>
    
            <tr><th><lable for='name'>Property Owner as per Document :</lable></th>
              <th colSpan="5"> <input type='text' name='PropertyOwner' id='PropertyOwner' value={PropertyOwner}></input><br></br></th></tr>
    
            <tr><th><label for="isthepropertywithinmunicipalLimit">is the property within municipal Limit'</label></th>
              <th colSpan="5"><input list="is the property within municipal Limit" name='isthepropertywithinmunicipalLimit' id='isthepropertywithinmunicipalLimit' value={formData.isthepropertywithinmunicipalLimit ?? ''} onChange={handleChange} />
                <datalist id="is the property within municipal Limit">
                  <option value="">Yes</option>
                  <option value="">No</option>
                </datalist><br></br></th></tr>
    
            <tr><th> <lable for='name'>if plans not available whether the structure confirming to the local byelaws :</lable></th>
              <th colSpan="5"><input type='text' name='IfPlansNotAvailable' id='IfPlansNotAvailable' value={IfPlansNotAvailable}></input><br></br></th></tr>
    
            <tr><th colSpan="6"><h3> Property Valuation :</h3></th></tr>
            <tr><th colSpan="6"><h3>Valuation of independent House/Bungalow</h3></th></tr>
    
            <tr><th><lable for='name'>Land/plot Area(in Sq.ft.) :</lable></th>
              <th colSpan="2"> <input type='text' name='LandPlotArea' id='LandPlotArea' value={LandPlotArea}></input></th>
    
              <th><lable for='name'>Adoptable Built-up Area(in Sq.ft.) :</lable></th>
              <th colSpan="2"><input type='text' name='AdoptableBuiltUpArea' id='AdoptableBuiltUpArea' value={AdoptableBuiltUpArea}></input><br></br></th></tr>
    
             <tr><th><lable for='RateRangeofinthelocality(RSpersq.ft.)'>Rate Range of in the locality(RS per sq.ft.) :</lable></th>
              <th colSpan="2"><input type='text' name='RateRangeofinthelocality(RSpersq.ft.)' id='RateRangeofinthelocality(RSpersq.ft.)' value={formData['RateRangeofinthelocality(RSpersq.ft.)'] ?? formData.RateRangeofinthelocality ?? ''} onChange={handleChange}></input></th>
    
              <th><lable for='name'>Construction Cost (per sq.ft) :</lable></th>
              <th colSpan="2"><input type='text' name='ConstructionCost' id='ConstructionCost' value={ConstructionCost}></input><br></br></th></tr>
    
    
            
              <tr><th><lable for='name'>Recommended Rate Rate of Lade(per sq.ft) :</lable></th>
              <td colSpan="2"><input type='text' name='RecommendedRate' id='RecommendedRate' value={RecommendedRate}></input></td>
              <td><lable for='name'>Total Construction Value at Present Construction stage(in RS) :</lable></td>
              <td colSpan="2"> <input type='text' name='TotalConstructionValue' id='TotalConstructionValue' value={TotalConstructionValue}></input><br></br></td></tr>
          
             <tr><th><lable for='name'>pls specify if any Special Amenities Provided(in Rs) :</lable></th>
             <th colSpan="2"> <input type='text' name='SpecialAmenities' id='SpecialAmenities' value={SpecialAmenities}></input></th>
             <th><lable for='name'>Addional Cost incurred for Amenities Charges(in Rs) :</lable></th>
             <th colSpan="2"> <input type='text' name='AdditionalCost' id='AdditionalCost' value={AdditionalCost}></input><br></br></th></tr>
            
              <tr><th><lable for='name'>Total Land Value(in Rs) :</lable></th>
              <th colSpan="2"> <input type='text' name='TotalLandValue' id='TotalLandValue' value={TotalLandValue}></input></th>
              <th><lable for='name'>Total Construction Value at present construction stage(in Rs) :</lable></th>
              <th colSpan="2"><input type='text' name='TotalConstructionValue' id='TotalConstructionValue' value={TotalConstructionValue}></input><br></br></th></tr>
            
              <tr><th><lable for='name'>Total fair Market Value at 100% completion(in Rs) :</lable></th>
             <th colSpan="2"><input type='text' name='TotalFairMarketValue' id='TotalFairMarketValue' value={TotalFairMarketValue}></input></th>
             <th><lable for='name'>Total Realizable Value on present completion stage(in Rs) :</lable></th>
             <th colSpan="2"> <input type='text' name='TotalRealizableValue' id='TotalRealizableValue' value={TotalRealizableValue}></input><br></br></th></tr>
             
             <tr><th><lable for='name'>Total Forced/Distressed Value at 100% completion(in Rs) :</lable></th>
             <th colSpan="2"> <input type='text' name='TotalForcedDistressedValue' id='TotalForcedDistressedValue' value={TotalForcedDistressedValue}></input></th>
             <th><lable for='name'>Total Forced/Distressed Value on present completion stage(in Rs) :</lable></th>
             <th colSpan="2"> <input type='text' name='TotalForcedDistressedValuePresent' id='TotalForcedDistressedValuePresent' value={TotalForcedDistressedValuePresent}></input><br></br></th></tr>
            
             <tr><th colSpan="6"><h3>Valuvation of flat/shop/office/industrial/other unit etc :</h3></th></tr>
             <tr><td><lable for='name'>SBUA(SFT) :</lable></td>
             <td colSpan="2"><input type='text' name='SBUA' id='SBUA' value={SBUA}></input></td>
             <td><lable for='name'>Adopted rate(in per sq.ft) :</lable></td>
              <td colSpan="2"> <input type='text' name='AdoptedRate' id='AdoptedRate' value={AdoptedRate}></input><br></br></td></tr>
            
             <tr><th><lable for='name'>Total Value of flat/shop/flat/office on 100% Complete(in Rs) :</lable></th>
               <th colSpan="2"> <input type='text' name='TotalValue' id='TotalValue' value={TotalValue}></input></th>
              <th><lable for='name'>Total Realizable Value at 100% completion(in Rs) :</lable></th>
               <th colSpan="2"> <input type='text' name='TotalRealizableValue' id='TotalRealizableValue' value={TotalRealizableValue}></input><br></br></th></tr>
              
               <tr><th> <lable for='name'>Total Realizable Value on present completion stage(in Rs) :</lable></th> 
               <th colSpan="2"><input type='text' name='TotalRealizableValuePresent' id='TotalRealizableValuePresent' value={TotalRealizableValuePresent}></input></th>
               <th><lable for='name'>Total Forced/Distressed Value at 100% completion(in Rs) :</lable></th>
               <th colSpan="2"> <input type='text' name='TotalForcedDistressedValue' id='TotalForcedDistressedValue' value={TotalForcedDistressedValue}></input><br></br></th></tr>
        
               <tr><th><lable for='name'>Total Forced/Distressed Value on present completion stage(in Rs) :</lable></th>
               <th colSpan="2"> <input type='text' name='TotalForcedDistressedValuePresent' id='TotalForcedDistressedValuePresent' value={TotalForcedDistressedValuePresent}></input></th>
               <th><lable for='name'>SBUA(SFT) :</lable></th>
               <th colSpan="2"><input type='text' name='SBUA' id='SBUA' value={SBUA}></input><br></br></th></tr>
          
               <tr><th><lable for='name'>Adopted rate(in per sq.ft) :</lable></th>
               <th colSpan="2"><input type='text' name='AdoptedRate' id='AdoptedRate' value={AdoptedRate}></input></th>
               <th><lable for='name'>Total Value of flat/shop/flat/office on 100% Complete(in Rs) :</lable></th>
               <th colSpan="2"> <input type='text' name='TotalValue' id='TotalValue' value={TotalValue}></input><br></br></th></tr>
                 
               <tr><th><lable for='name'>Addional Cost incurred for amenities(in Rs) :</lable></th>
               <th colSpan="2"><input type='text' name='AdditionalCost' id='AdditionalCost' value={AdditionalCost}></input></th>
               <th><lable for='name'>Total fair Market Value at 100% completion (in Rs) :</lable></th>
               <th colSpan="2"> <input type='text' name='TotalFairMarketValue' id='TotalFairMarketValue' value={TotalFairMarketValue}></input><br></br></th></tr>
           
               <tr><th><lable for='name'>Total Realizable Value at 100% completion(in Rs) :</lable></th>
               <th colSpan="2"><input type='text' name='TotalRealizableValue' id='TotalRealizableValue' value={TotalRealizableValue}></input></th>
               <th><lable for='name'>Total Realizable Value on present completion stage(in Rs) :</lable></th>
               <th colSpan="2"><input type='text' name='TotalRealizableValuePresent' id='TotalRealizableValuePresent' value={TotalRealizableValuePresent}></input><br></br></th></tr>
            
               <tr><th><lable for='name'>Total Forced/Distressed Value at 100% completion(in Rs) :</lable></th>
               <th colSpan="2"><input type='text' name='TotalForcedDistressedValue' id='TotalForcedDistressedValue' value={TotalForcedDistressedValue}></input></th>
               <th><lable for='name'>Total Forced/Distressed Value on present completion stage(in Rs) :</lable></th>
               <th colSpan="2"><input type='text' name='TotalForcedDistressedValuePresent' id='TotalForcedDistressedValuePresent' value={TotalForcedDistressedValuePresent}></input><br></br></th></tr>
            
               <tr><th colSpan="6"><h3>Stage of Construction :</h3></th></tr>
    
               <tr><th><lable for='name'>% Completion :</lable></th>
               <th colSpan="2"> <input type='text' name='PercentageCompletion' id='PercentageCompletion' value={PercentageCompletion}></input></th>
               <th><lable for='name'>Recommended Construction Value :</lable></th>
              <th colSpan="2"><input type='text' name='RecommendedConstructionValue' id='RecommendedConstructionValue' value={RecommendedConstructionValue}></input><br></br></th></tr>
          
             <tr><th colSpan="6"><h3>Guideline & Distress/Forced sale Value :</h3></th></tr>
             <tr colSpan="2"> <th><lable for='name'>government Guideline/ Circle rate for Land ( Rate in sq ft.only) :</lable></th>
               <th colSpan="2"> <input type='text' name='GovernmentGuidelineLand' id='GovernmentGuidelineLand' value={GovernmentGuidelineLand}></input></th>
              <th><lable for='name'>Land Value as per Goverment Rate(Rs) :</lable></th>
              <th colSpan="2"><input type='text' name='LandValue' id='LandValue' value={LandValue}></input><br></br></th></tr>
            
    
            
             <tr><th><lable for='name'>government Guideline/ Circle rate for flate/unit/Built Up(RS) ( Rate in sq ft.only) :</lable></th>
             <th colSpan="2"> <input type='text' name='GovernmentGuidelineFlat' id='GovernmentGuidelineFlat' value={GovernmentGuidelineFlat}></input></th>
             <th><lable for='name'>Flat/Unit/Built up Value as per Goverment Rate (Rs per sq.ft.) :</lable></th>
             <th colSpan="2"><input type='text' name='FlatValue' id='FlatValue' value={FlatValue}></input><br></br></th></tr>
            
            
             <tr><th><lable for='name'>Forced Sale Value(In Rs) :</lable></th>
             <th colSpan="2"> <input type='text' name='ForcedSaleValue' id='ForcedSaleValue' value={ForcedSaleValue}></input></th>
             <th><lable for='name'>Avg Rental per sqft(in Rs) :</lable ></th>
             <th colSpan="2"> <input type='text' name='AverageRental' id='AverageRental' value={AverageRental}></input><br></br></th></tr>
          
             <tr><th> <lable for='name'>Realizable value(in Rs) :</lable></th>
             <th colSpan="5"> <input type='text' name='RealizableValue' id='RealizableValue' value={RealizableValue}></input></th></tr>
              <tr><th colSpan="6"><h3>Remarks/Observation :</h3></th></tr>
              <tr>
                <th><label htmlFor="Remark1">Remark 1 :</label></th>
                <th colSpan={5}>
                  <input
                    type="text"
                    id="Remark1"
                    name="remark1"
                    list="Remark1List"
                    value={remark1}
                    onChange={handleChange}
                  />
                  <datalist id="Remark1List">
                    <option value="Subjected property 2BHK Residential flat in floor No 2" />
                    <option value="Address - " />
                    <option value="Area consider-635.18 sq.ft.Carpet Area + 69sq.ft.Balcony Area +55 sq.ft.Dry Balconey,Total-Loding 35% On Carpet Area + Balconey Area + Dry Balcony=913sq.ft.SBUA" />
                    <option value="Report released on the basis of Sale Deed Draft,Sanction Plan,index II,Commencement Certificate,Approvedn Drawing plan" />
                    <option value="Unit number,Name plate and socity board is not displayed on site.Property is identified  through Person met at the site" />
                  </datalist>
                  <br />
                </th>
              </tr>
              <tr>
              <th><label htmlFor="Remark2">Remark 2 :</label></th>
                <th colSpan={5}>
                  <input
                    type="text"
                    id="Remark2"
                    name="remark2"
                    list="Remark2List"
                    value={remark2}
                    onChange={handleChange}
                  />
                  <datalist id="Remark2List">
                    <option value="Subjected property 2BHK Residential flat in floor No 2" />
                    <option value="Address - " />
                    <option value="Area consider-635.18 sq.ft.Carpet Area + 69sq.ft.Balcony Area +55 sq.ft.Dry Balconey,Total-Loding 35% On Carpet Area + Balconey Area + Dry Balcony=913sq.ft.SBUA" />
                    <option value="Report released on the basis of Sale Deed Draft,Sanction Plan,index II,Commencement Certificate,Approvedn Drawing plan" />
                    <option value="Unit number,Name plate and socity board is not displayed on site.Property is identified  through Person met at the site" />
                  </datalist>
                  <br />
                </th>
              </tr>
    <tr>
    <th><label htmlFor="Remark3">Remark 3 :</label></th>
                <th colSpan={5}>
                  <input
                    type="text"
                    id="Remark3"
                    name="remark3"
                    list="Remark3List"
                    value={remark3}
                    onChange={handleChange}
                  />
                  <datalist id="Remark3List">
                    <option value="Subjected property 2BHK Residential flat in floor No 2" />
                    <option value="Address - " />
                    <option value="Area consider-635.18 sq.ft.Carpet Area + 69sq.ft.Balcony Area +55 sq.ft.Dry Balconey,Total-Loding 35% On Carpet Area + Balconey Area + Dry Balcony=913sq.ft.SBUA" />
                    <option value="Report released on the basis of Sale Deed Draft,Sanction Plan,index II,Commencement Certificate,Approvedn Drawing plan" />
                    <option value="Unit number,Name plate and socity board is not displayed on site.Property is identified  through Person met at the site" />
                  </datalist>
                  <br />
                </th>
              </tr>
              <tr>
                <th><label htmlFor="Remark4">Remark 4 :</label></th>
                <th colSpan={5}>
                  <input
                    type="text"
                    id="Remark4"
                    name="remark4"
                    list="Remark4List"
                    value={remark4}
                    onChange={handleChange}
                  />
                  <datalist id="Remark4List">
                    <option value="Subjected property 2BHK Residential flat in floor No 2" />
                    <option value="Address - " />
                    <option value="Area consider-635.18 sq.ft.Carpet Area + 69sq.ft.Balcony Area +55 sq.ft.Dry Balconey,Total-Loding 35% On Carpet Area + Balconey Area + Dry Balcony=913sq.ft.SBUA" />
                    <option value="Report released on the basis of Sale Deed Draft,Sanction Plan,index II,Commencement Certificate,Approvedn Drawing plan" />
                    <option value="Unit number,Name plate and socity board is not displayed on site.Property is identified  through Person met at the site" />
                  </datalist>
                  <br />
                </th>
              </tr>
               <tr>
                <th><label htmlFor="Remark5">Remark 5 :</label></th>
                <th colSpan={5}>
                  <input
                    type="text"
                    id="Remark5"
                    name="remark5"
                    list="Remark5List"
                    value={remark5}
                    onChange={handleChange}
                  />
                  <datalist id="Remark5List">
                    <option value="Subjected property 2BHK Residential flat in floor No 2" />
                    <option value="Address - " />
                    <option value="Area consider-635.18 sq.ft.Carpet Area + 69sq.ft.Balcony Area +55 sq.ft.Dry Balconey,Total-Loding 35% On Carpet Area + Balconey Area + Dry Balcony=913sq.ft.SBUA" />
                    <option value="Report released on the basis of Sale Deed Draft,Sanction Plan,index II,Commencement Certificate,Approvedn Drawing plan" />
                    <option value="Unit number,Name plate and socity board is not displayed on site.Property is identified  through Person met at the site" />
                  </datalist>
                  <br />
                </th>
              </tr>
    
    
             <tr><td> <h4>Declartion :</h4></td>
             <td colSpan="5"><p>i/We hereby declare that Our Representive Mr.Vishal Jadhav Physically Inspected the  property.
             We have no direct or indirect interest in the unit valued.
             the information furnished above is true and correct to the best of our Knowledge and belif and takes into account information and our document submitted or shown to us by the client.the client is free to obtain other independant opninons on the same.
             No Responsibility Is taken for any False Statement,Misrepresentation or Submission Made in the Documents Submitted or for Fraudulent Documents Submitted bye the borrower/representative/developer/institute.
             Market Value/Fair Market Value is derived In this Report by considering All Attributes In the Locality Which adeversely affects the Markeability.
             of the property and value is Derived Basis on Banks/FI Policies and Norms.
             This report is released soley for intended Banks/FI,and the content of this report is confidential in the nature and for internal use only.The recipient of this report should not
             disclose this report to any external party and should be strictly used for lending/investing purposes.
             Legal aspects are beyond the scope of this valuation exercise.
             Valuation Approach:Market Approach of valuation has been adopted for finding out the fair market value of the subject property.
              </p><br></br></td></tr>
                     
             <tr><td><h4>Disclaimer :</h4></td>
              <td colSpan="5"><p>This report is prepared for based on the documents furnished and/or the condition of the property as prevailed at the time of our visit for Cholamandalam Finance. The report provides an indicative market value of the property in our opinion which may not necessarily reflect the guideline value. Cost of construction is estimated based on our opinion on prevailing market rates at the time of our visit. Builtup area considered for valuation in this report at presumed FSI basis revised allowable FSI Limits considered by NIDO Home Finance. Quality of construction is assessed based on the visual and corroborative evidence obtained at site during our visit. Measurement of the property is made to the extent reasonably possible considering the limitations at site. This report does not certify the ownership of the property. The ownership details shall be referred from the legal due diligence report.
                Report isvalidfor 90 days from the date of visit or report.
              </p> </td></tr>
            
             <tr>
               <td colSpan="6">
                 <h4>Satellite Map:</h4>
                 {formData.Uploadphotosatelitemap ? (
                   <img
                     src={formData.Uploadphotosatelitemap}
                     alt="Satellite Map"
                     style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                   />
                 ) : (
                   <>
                     <label htmlFor='Uploadphotosatelitemap'>Upload photo satelite map:</label>
                     <input type='file' name='Uploadphotosatelitemap' id='Uploadphotosatelitemap' onChange={handleFileChange} />
                   </>
                 )}
                 <br />
               </td>
             </tr>
          
              <tr><td colSpan="6"><h4>PHOTOGRAPHS OF PROPERTY:</h4></td></tr>
            
            <tr>
              <td colSpan="3">
                <h5>Hall:</h5>
                {formData.UploadphotoHall ? (
                  <img
                    src={formData.UploadphotoHall}
                    alt="Hall"
                    style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                  />
                ) : (
                  <>
                    <label htmlFor='UploadphotoHall'>Upload photo Hall:</label>
                    <input type='file' name='UploadphotoHall' id='UploadphotoHall' onChange={handleFileChange} />
                  </>
                )}
              </td>
              <td colSpan="3">
                <h5>Kitchen:</h5>
                {formData.UploadphotoKichen ? (
                  <img
                    src={formData.UploadphotoKichen}
                    alt="Kitchen"
                    style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                  />
                ) : (
                  <>
                    <label htmlFor='UploadphotoKichen'>Upload photo Kitchen:</label>
                    <input type='file' name='UploadphotoKichen' id='UploadphotoKichen' onChange={handleFileChange} />
                  </>
                )}
              </td>
            </tr>
          
             <tr>
               <th colSpan="3">
                 <h5>Bedroom:</h5>
                 {formData.UploadphotoBedroom ? (
                   <img
                     src={formData.UploadphotoBedroom}
                     alt="Bedroom"
                     style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                   />
                 ) : (
                   <>
                     <label htmlFor='UploadphotoBedroom'>Upload photo Bedroom:</label>
                     <input type='file' name='UploadphotoBedroom' id='UploadphotoBedroom' onChange={handleFileChange} />
                   </>
                 )}
               </th>
               <th colSpan="3">
                 <h5>Other Room:</h5>
                 {formData.UploadphotoOtherRoom ? (
                   <img
                     src={formData.UploadphotoOtherRoom}
                     alt="Other Room"
                     style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                   />
                 ) : (
                   <>
                     <label htmlFor='UploadphotoOtherRoom'>Upload photo other room:</label>
                     <input type='file' name='UploadphotoOtherRoom' id='UploadphotoOtherRoom' onChange={handleFileChange} />
                   </>
                 )}
               </th>
             </tr>
      
             <tr>
               <th colSpan="3">
                 <h5>Other Photo:</h5>
                 {formData.UploadphotoOtherPhoto ? (
                   <img
                     src={formData.UploadphotoOtherPhoto}
                     alt="Other Photo"
                     style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                   />
                 ) : (
                   <>
                     <label htmlFor='UploadphotoOtherPhoto'>Upload photo other photo:</label>
                     <input type='file' name='UploadphotoOtherPhoto' id='UploadphotoOtherPhoto' onChange={handleFileChange} />
                   </>
                 )}
               </th>
           
               <th colSpan="3">
                 <h5>External Photo:</h5>
                 {formData.UploadphotoExternalPhoto ? (
                   <img
                     src={formData.UploadphotoExternalPhoto}
                     alt="External Photo"
                     style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                   />
                 ) : (
                   <>
                     <label htmlFor='UploadphotoExternalPhoto'>Upload photo external photo:</label>
                     <input type='file' name='UploadphotoExternalPhoto' id='UploadphotoExternalPhoto' onChange={handleFileChange} />
                   </>
                 )}
               </th>
             </tr>
          
             <tr>
               <th colSpan="3">
                 <h5>Front Site:</h5>
                 {formData.UploadphotoFrontSite ? (
                   <img
                     src={formData.UploadphotoFrontSite}
                     alt="Front Site"
                     style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                   />
                 ) : (
                   <>
                     <label htmlFor='UploadphotoFrontSite'>Upload photo front site:</label>
                     <input type='file' name='UploadphotoFrontSite' id='UploadphotoFrontSite' onChange={handleFileChange} />
                   </>
                 )}
               </th>
               <th colSpan="3">
                 <h5>Road Site:</h5>
                 {formData.UploadphotoRoadSite ? (
                   <img
                     src={formData.UploadphotoRoadSite}
                     alt="Road Site"
                     style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                   />
                 ) : (
                   <>
                     <label htmlFor='UploadphotoRoadSite'>Upload photo road site:</label>
                     <input type='file' name='UploadphotoRoadSite' id='UploadphotoRoadSite' onChange={handleFileChange} />
                   </>
                 )}
               </th>
             </tr>
        
             <tr>
               <th colSpan="3">
                 <h5>Selfie with Property:</h5>
                 {formData.UploadphotoSelfieWithProperty ? (
                   <img
                     src={formData.UploadphotoSelfieWithProperty}
                     alt="Selfie with Property"
                     style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                   />
                 ) : (
                   <>
                     <label htmlFor='UploadphotoSelfieWithProperty'>Upload photo selfie with property:</label>
                     <input type='file' name='UploadphotoSelfieWithProperty' id='UploadphotoSelfieWithProperty' onChange={handleFileChange} />
                   </>
                 )}
               </th>
               <th colSpan="3">
                 <h5>Selfie with Person:</h5>
                 {formData.UploadphotoSelfieWithPerson ? (
                   <img
                     src={formData.UploadphotoSelfieWithPerson}
                     alt="Selfie with Person"
                     style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                   />
                 ) : (
                   <>
                     <label htmlFor='UploadphotoSelfieWithPerson'>Upload photo selfie with person met at property:</label>
                     <input type='file' name='UploadphotoSelfieWithPerson' id='UploadphotoSelfieWithPerson' onChange={handleFileChange} />
                   </>
                 )}
               </th>
             </tr>
            
          </table>
        </div>
      </div>
    </div>
  )
}
