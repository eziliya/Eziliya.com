import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'
import styles from './AusmallfinanceFinalReport.module.css'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import logopng from '../../assets/logo.png'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function AusmallfinanceFinalReport() {
  const location = useLocation()
  const [formData, setFormData] = useState(() => location.state?.formData ?? {})
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [savedReportId, setSavedReportId] = useState(null)
  const reportRef = useRef(null)

  useEffect(() => {
    console.log('=== FINAL REPORT LOADED ===');
    console.log('Location state:', location.state);
    console.log('Form data from state:', location.state?.formData);
    console.log('Number of fields received:', Object.keys(location.state?.formData || {}).length);
    
    if (location.state?.formData && Object.keys(location.state.formData).length > 0) {
      console.log('Setting form data in final report...');
      setFormData((prev) => ({ ...prev, ...location.state.formData }))
      console.log('Form data set successfully');
    } else {
      console.warn('No form data received from navigation state');
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
      `report_${yyyy}${mm}${dd}`

    return `TECHNICAL_VALUATION_${base}_${yyyy}${mm}${dd}.pdf`
  }, [formData.applicantsName, formData.proposalIdApplicationNo])

  // Save report to MongoDB
  const handleSaveReport = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Please login to save the report');
        return;
      }

      const reportData = {
        ...formData,
        status: 'draft',
        assignedTo: 'office-engineer',
        workflowStage: 'office-engineer'
      };

      let response;
      if (savedReportId) {
        // Update existing report
        response = await axios.put(
          `${API_BASE_URL}/ausmall-finance-final-report/${savedReportId}`,
          reportData,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        toast.success('Report updated successfully!');
      } else {
        // Create new report
        response = await axios.post(
          `${API_BASE_URL}/ausmall-finance-final-report/create`,
          reportData,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setSavedReportId(response.data.data._id);
        toast.success('Report saved to database successfully!');
      }

      console.log('Report saved:', response.data);
    } catch (error) {
      console.error('Error saving report:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save report';
      toast.error(`Save failed: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

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
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: element.scrollWidth || element.clientWidth,
        windowHeight: element.scrollHeight || element.clientHeight,
        imageTimeout: 0,
        removeContainer: true,
        letterRendering: true,
        onclone: (doc) => {
          const cloned = doc.querySelector('[data-pdf-root="ausmallfinance"]')
          if (cloned) {
            cloned.classList.add(styles.pdfMode)
            cloned.style.backgroundColor = '#ffffff'
            cloned.style.color = '#000000'
            cloned.style.fontSmoothing = 'antialiased'
            cloned.style.webkitFontSmoothing = 'antialiased'
          }
        },
      })

      if (!canvas.width || !canvas.height) {
        toast.error('Could not capture the report (empty canvas). Try scrolling to the top and try again.')
        return
      }

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
        sliceCtx?.drawImage(
          canvas,
          0,
          renderedHeightPx,
          canvas.width,
          sliceHeightPx,
          0,
          0,
          canvas.width,
          sliceHeightPx
        )

        const imgData = sliceCanvas.toDataURL('image/jpeg', 0.92)
        const sliceHeightMm = sliceHeightPx / pxPerMm

        if (pageIndex > 0) pdf.addPage()
        pdf.addImage(imgData, 'JPEG', margin, margin, contentWidthMm, sliceHeightMm, undefined, 'FAST')

        renderedHeightPx += sliceHeightPx
        pageIndex += 1
      }

      pdf.save(pdfFileName)
      toast.success('PDF downloaded')
    } catch (err) {
      console.error('PDF export failed:', err)
      const message =
        err instanceof Error ? err.message : typeof err === 'string' ? err : 'Unknown error'
      toast.error(`PDF failed: ${message}`)
    } finally {
      window.scrollTo(prevScrollX, prevScrollY)
      setIsDownloadingPdf(false)
    }
  }

  const handleChange = (e) => {
    const target = e.target;
    const { name, type, value, files, checked } = target;

    if (!name) return;

    if (type === 'file') {
      const file = files?.[0] || null;
      setFormData((prev) => ({ ...prev, [name]: file }));
      return;
    }

    if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    // Update form data and calculate dependent fields
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Auto-calculate TotalValue when SBUA or AdoptedRate changes
      if (name === 'SBUA' || name === 'AdoptedRate') {
        const sbua = parseFloat(name === 'SBUA' ? value : prev.SBUA) || 0;
        const adoptedRate = parseFloat(name === 'AdoptedRate' ? value : prev.AdoptedRate) || 0;
        
        // Calculate: SBUA × Adopted Rate = Total Value
        const totalValue = sbua * adoptedRate;
        
        // Only update if both values are present
        if (sbua > 0 && adoptedRate > 0) {
          updated.TotalValue = totalValue.toFixed(2);
        } else if (sbua === 0 || adoptedRate === 0) {
          updated.TotalValue = '0';
        }
        
        // Also recalculate TotalFairMarketValue (for Flat/Shop/Office) when SBUA or AdoptedRate changes
        const additionalsCost = parseFloat(prev.AdditionalsCost) || 0;
        const newTotalValue = parseFloat(updated.TotalValue) || 0;
        
        // Calculate: (SBUA × Adopted Rate) + Additional Cost = Total Fair Market Value
        const totalFairMarketValue = newTotalValue + additionalsCost;
        
        if (newTotalValue > 0 || additionalsCost > 0) {
          updated.TotalFairMarketValue = totalFairMarketValue.toFixed(2);
          
          // Auto-calculate Forced Sale Value (80% of Total Fair Market Value)
          const forcedSaleValue = totalFairMarketValue * 0.8;
          updated.ForcedSaleValue = forcedSaleValue.toFixed(2);
        } else {
          updated.TotalFairMarketValue = '0';
          updated.ForcedSaleValue = '0';
        }
      }
      
      // Auto-calculate TotalFairMarketValue (for Flat/Shop/Office) when TotalValue or AdditionalsCost changes
      if (name === 'TotalValue' || name === 'AdditionalsCost') {
        const totalValue = parseFloat(name === 'TotalValue' ? value : prev.TotalValue) || 0;
        const additionalsCost = parseFloat(name === 'AdditionalsCost' ? value : prev.AdditionalsCost) || 0;
        
        // Calculate: Total Value + Additional Cost = Total Fair Market Value (for Flat/Shop/Office)
        const totalFairMarketValue = totalValue + additionalsCost;
        
        if (totalValue > 0 || additionalsCost > 0) {
          updated.TotalFairMarketValue = totalFairMarketValue.toFixed(2);
          
          // Auto-calculate Forced Sale Value (80% of Total Fair Market Value)
          const forcedSaleValue = totalFairMarketValue * 0.8;
          updated.ForcedSaleValue = forcedSaleValue.toFixed(2);
        } else {
          updated.TotalFairMarketValue = '0';
          updated.ForcedSaleValue = '0';
        }
      }
      
      // Auto-calculate ForcedSaleValue when TotalFairMarketValue (Flat/Shop/Office) is manually changed
      if (name === 'TotalFairMarketValue') {
        const totalFairMarketValue = parseFloat(value) || 0;
        if (totalFairMarketValue > 0) {
          // Calculate 80% of Total Fair Market Value (for Flat/Shop/Office)
          const forcedSaleValue = totalFairMarketValue * 0.8;
          updated.ForcedSaleValue = forcedSaleValue.toFixed(2);
        } else {
          updated.ForcedSaleValue = '0';
        }
      }
      
      // Auto-calculate ForcedSaleValue when TotalFairMarketValues (Independent House/Bungalow) is manually changed
      if (name === 'TotalFairMarketValues') {
        const totalFairMarketValues = parseFloat(value) || 0;
        if (totalFairMarketValues > 0) {
          // Calculate 80% of Total Fair Market Value (for Independent House/Bungalow)
          const forcedSaleValue = totalFairMarketValues * 0.8;
          updated.ForcedSaleValue = forcedSaleValue.toFixed(2);
        } else {
          updated.ForcedSaleValue = '0';
        }
      }
      
      // Auto-calculate TotalLandValue when LandPlotArea, RecommendedRate, or SpecialAmenities changes
      if (name === 'LandPlotArea' || name === 'RecommendedRate' || name === 'SpecialAmenities') {
        const landPlotArea = parseFloat(name === 'LandPlotArea' ? value : prev.LandPlotArea) || 0;
        const recommendedRate = parseFloat(name === 'RecommendedRate' ? value : prev.RecommendedRate) || 0;
        const specialAmenities = parseFloat(name === 'SpecialAmenities' ? value : prev.SpecialAmenities) || 0;
        
        // Calculate: (Land Area × Recommended Rate) + Special Amenities = Total Land Value
        const totalLandValue = (landPlotArea * recommendedRate) + specialAmenities;
        
        if (landPlotArea > 0 || recommendedRate > 0 || specialAmenities > 0) {
          updated.TotalLandValue = totalLandValue.toFixed(2);
        } else {
          updated.TotalLandValue = '0';
        }
      }
      
      // Auto-calculate Totalvalue when AdoptableBuiltUpArea or ConstructionCost changes
      if (name === 'AdoptableBuiltUpArea' || name === 'ConstructionCost') {
        const adoptableBuiltUpArea = parseFloat(name === 'AdoptableBuiltUpArea' ? value : prev.AdoptableBuiltUpArea) || 0;
        const constructionCost = parseFloat(name === 'ConstructionCost' ? value : prev.ConstructionCost) || 0;
        
        // Calculate: Adoptable Built-up Area × Construction Cost = Total Construction Value
        const totalConstructionValue = adoptableBuiltUpArea * constructionCost;
        
        if (adoptableBuiltUpArea > 0 || constructionCost > 0) {
          updated.Totalvalue = totalConstructionValue.toFixed(2);
        } else {
          updated.Totalvalue = '0';
        }
      }
      
      // Auto-calculate TotalFairMarketValues (for Independent House/Bungalow) when Totalvalue, TotalLandValue, or AdditionalCosts changes
      if (name === 'Totalvalue' || name === 'TotalLandValue' || name === 'AdditionalCosts') {
        const totalConstructionValue = parseFloat(name === 'Totalvalue' ? value : prev.Totalvalue) || 0;
        const totalLandValue = parseFloat(name === 'TotalLandValue' ? value : prev.TotalLandValue) || 0;
        const additionalCosts = parseFloat(name === 'AdditionalCosts' ? value : prev.AdditionalCosts) || 0;
        
        // Calculate: Total Land Value + Total Construction Value + Additional Amenities Cost = Total Fair Market Value (for Independent House/Bungalow)
        const totalFairMarketValueHouse = totalLandValue + totalConstructionValue + additionalCosts;
        
        if (totalConstructionValue > 0 || totalLandValue > 0 || additionalCosts > 0) {
          updated.TotalFairMarketValues = totalFairMarketValueHouse.toFixed(2);
          
          // Also auto-calculate Forced Sale Value (80% of Total Fair Market Value)
          const forcedSaleValue = totalFairMarketValueHouse * 0.8;
          updated.ForcedSaleValue = forcedSaleValue.toFixed(2);
        } else {
          updated.TotalFairMarketValues = '0';
          updated.ForcedSaleValue = '0';
        }
      }
      
      return updated;
    });
  };

  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files?.[0];
    if (file) {
      // Convert file to base64 data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [name]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeletePhoto = (photoName) => {
    setFormData((prev) => ({ ...prev, [photoName]: null }));
  };


  // Extract values from formData
  const nameOfvaluationAgency = formData.nameOfvaluationAgency || '';
  const dateOfTechnicalInitiation = formData.dateOfTechnicalInitiation || '';
  const applicantsName = formData.applicantsName || '';
  const dateOfSiteVisit = formData.dateOfSiteVisit || '';
  const requestFrom = formData.requestFrom || '';
  const dateOfReportRelease = formData.dateOfReportRelease || '';
  const proposalIdApplicationNo = formData.proposalIdApplicationNo || '';
  const transactionType = formData.transactionType || '';
  const requestedFrom = formData.requestedFrom || '';
  const currentOwnerSellerName = formData.currentOwnerSellerName || '';
  const personMetAtSiteName = formData.personMetAtSiteName || '';
  const contactNoForPersonMet = formData.contactNoForPersonMet || '';
  const addressAsPerTRF = formData.addressAsPerTRF || '';
  const addressAsPerLegalDocuments = formData.addressAsPerLegalDocuments || '';
  const addressAsPerActualSite = formData.addressAsPerActualSite || '';
  const documentsProvided = formData.documentsProvided || '';
  const statusHolding = formData.statusHolding || '';
  const deliveryAgency = formData.deliveryAgency || '';
  const typeOfProperty = formData.typeOfProperty || '';
  const stateName = formData.stateName || '';
  const mainLocality = formData.mainLocality || '';
  const subLocality = formData.subLocality || '';
  const Streetonwhichpropertyislocated = formData.Streetonwhichpropertyislocated || '';
  const NearestLandmark = formData.NearestLandmark || '';
  const Pincode = formData.Pincode || '';
  const OccupationStatus = formData.OccupationStatus || '';
  const PropertyUsage = formData.PropertyUsage || '';
  const PropertyIdentifiable = formData.PropertyIdentifiable || '';
  const PropertyDemarcatedSeparatly = formData.PropertyDemarcatedSeparatly || '';
  const PropertyIdentifiedThrough = formData.PropertyIdentifiedThrough || '';
  const CityTownVillage = formData.CityTownVillage || '';
  const RoofConstruction = formData.RoofConstruction || '';
  const TypeOfStructure = formData.TypeOfStructure || '';
  const NoOfFloors = formData.NoOfFloors || '';
  const LocatedOnFloor = formData.LocatedOnFloor || '';
  const ExternalFinishing = formData.ExternalFinishing || '';
  const TypesOfFlooring = formData.TypesOfFlooring || '';
  const PresentAge = formData.PresentAge || '';
  const FuturePhysicalLife = formData.FuturePhysicalLife || '';
  const Latitude = formData.Latitude || '';
  const Longitude = formData.Longitude || '';
  const InfrastructureInArea = formData.InfrastructureInArea || '';
  const ClassOfLocality = formData.ClassOfLocality || '';
  const TypeOfRoad = formData.TypeOfRoad || '';
  const WidthOfRoad = formData.WidthOfRoad || '';
  const Propertyareaiscommunitydominatedare = formData.Propertyareaiscommunitydominatedare || '';
 
  const DistanceFromBusStop = formData.DistanceFromBusStop || '';
  const DistanceFromMainMarket = formData.DistanceFromMainMarket || '';
  const DistanceFromRailwayStation = formData.DistanceFromRailwayStation || '';
  const PropertyFallsUnderSeismicZone = formData.PropertyFallsUnderSeismicZone || '';
  const PropertyFallsUnderFloodZone = formData.PropertyFallsUnderFloodZone || '';
  const PropertyfallsunderfloodZone = formData.PropertyfallsunderfloodZone || '';
  const PropertyFallsUnderCycloneZone = formData.PropertyFallsUnderCycloneZone || '';
  const PropertyFallsInCRZone = formData.PropertyFallsInCRZone || '';
  const DegreeOfRiskAssociated = formData.DegreeOfRiskAssociated || '';
  const AnyRiskOfDemolition = formData.AnyRiskOfDemolition || '';
  const BoundariesMatching = formData.BoundariesMatching || '';
  const ReasonForNonMatching = formData.ReasonForNonMatching || '';
  const LegalAreaEast = formData.LegalAreaEast || '';
  const LegalAreaWest = formData.LegalAreaWest || '';
  const LegalAreaNorth = formData.LegalAreaNorth || '';
  const LegalAreaSouth = formData.LegalAreaSouth || '';
  const LegalTotalArea = formData.LegalTotalArea || '';
  const ActualAreaEast = formData.ActualAreaEast || '';
  const ActualAreaWest = formData.ActualAreaWest || '';
  const ActualAreaNorth = formData.ActualAreaNorth || '';
  const ActualAreaSouth = formData.ActualAreaSouth || '';
  const ActualTotalArea = formData.ActualTotalArea || '';
  const Floor = formData.Floor || '';
  const Accommodation = formData.Accommodation || '';
  const CarpetAreaSanctioned = formData.CarpetAreaSanctioned || '';
  const CarpetAreaSite = formData.CarpetAreaSite || '';
  const PermissibleArea = formData.PermissibleArea || '';
  const AdoptedArea = formData.AdoptedArea || '';
  const LayoutplanDetails = formData.LayoutplanDetails || '';
  const BuildingSanctionApprovedPlanDetails = formData.BuildingSanctionApprovedPlanDetails || '';
  const CommencementCertificate = formData.CommencementCertificate || '';
  const CompletionCertificate = formData.CompletionCertificate || '';
  const OtherDocuments = formData.OtherDocuments || '';
  const OwnershipDocuments = formData.OwnershipDocuments || '';
  const PropertyOwner = formData.PropertyOwner || '';
  const IfPlansNotAvailable = formData.IfPlansNotAvailable || '';
  const LandPlotArea = formData.LandPlotArea || '';
  const AdoptableBuiltUpArea = formData.AdoptableBuiltUpArea || '';
  const ConstructionCost = formData.ConstructionCost || '';
  const RecommendedRate = formData.RecommendedRate || '';
  const Totalvalue = formData.Totalvalue || '';
  const TotalConstructionValue = formData.TotalConstructionValue || '';
  const SpecialAmenities = formData.SpecialAmenities || '';
  const SpecialsAmenities = formData.SpecialsAmenities || '';
  const AdditionalCosts = formData.AdditionalCosts || '';
  const AdditionalsCost = formData.AdditionalsCost || '';
  const TotalLandValue = formData.TotalLandValue || '';
  const TotalFairMarketValue = formData.TotalFairMarketValue || '';
  const TotalFairMarketValues = formData.TotalFairMarketValues || '';
  const TotalFairMarketValuePresent = formData.TotalFairMarketValuePresent || '';
  const TotalRealizableValue = formData.TotalRealizableValue || '';
  const TotalForcedDistressedValue = formData.TotalForcedDistressedValue || '';
  const TotalForcedDistressedValuePresent = formData.TotalForcedDistressedValuePresent || '';
  const TotalForcedDistressedValuePresents = formData.TotalForcedDistressedValuePresents || '';
  const TotalForcedDistressedValuecomplete = formData.TotalForcedDistressedValuecomplete || '';

  
  const SBUA = formData.SBUA || '';
  const AdoptedRate = formData.AdoptedRate || '';
  const TotalValue = formData.TotalValue || '';
  
  const TotalForcedDistressedValuecompletes = formData.TotalForcedDistressedValuecompletes || '';
  const TotalRealizableValuePresents = formData.TotalRealizableValuePresents || '';
  const TotalRealizableValuePresent = formData.TotalRealizableValuePresent || '';
  
  const PercentageCompletion = formData.PercentageCompletion || '';
  const RecommendedConstructionValue = formData.RecommendedConstructionValue || '';
  const GovernmentGuidelineLand = formData.GovernmentGuidelineLand || '';
  const LandValue = formData.LandValue || '';
  const GovernmentGuidelineFlat = formData.GovernmentGuidelineFlat || '';
  const FlatValue = formData.FlatValue || '';
  const ForcedSaleValue = formData.ForcedSaleValue || '';
  const AverageRental = formData.AverageRental || '';
  const RealizableValue = formData.RealizableValue || '';
  const remark1 = formData.remark1 || '';
  const remark2 = formData.remark2 || '';
  const remark3 = formData.remark3 || '';
  const remark4 = formData.remark4 || '';
  const remark5 = formData.remark5 || '';

  return (
    <div className={styles.container}>
      <div className={styles.downloadSection}>
        <button
          onClick={handleSaveReport}
          disabled={isSaving}
          className={styles.saveBtn}
          style={{
            marginRight: '10px',
            backgroundColor: '#28a745',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.6 : 1
          }}
        >
          {isSaving ? 'Saving...' : savedReportId ? 'Update Report' : 'Save Report to Database'}
        </button>
        <button
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf}
          className={styles.downloadBtn}
        >
          {isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>
      <div
        ref={reportRef}
        data-pdf-root="ausmallfinance"
        style={{
          position: 'relative',
          ...(formData.firmBackgroundLogo && {
            backgroundImage: `url(${formData.firmBackgroundLogo})`,
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '50%',
            backgroundAttachment: 'fixed'
          })
        }}
      >
        {formData.firmBackgroundLogo && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
            backgroundImage: `url(${formData.firmBackgroundLogo})`,
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '50%',
            opacity: 0.15,
            filter: 'blur(3px)'
          }} />
        )}
        <table border="1" style={{ position: 'relative', zIndex: 1, background: 'transparent' }}>
          <caption style={{
            backgroundColor: 'white',
            padding: '0',
            border: '1px'
          }}>
            {/* Double Border Frame - Outer */}
            <div style={{
              border: '2px solid black',
              padding: '8px',
              backgroundColor: 'white'
            }}>
              {/* Double Border Frame - Inner */}
              <div style={{
                border: '4px solid black',
                padding: '20px',
                backgroundColor: 'white'
              }}>
                <div style={{
                  padding: '20px 20px',
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                 <div style={{ textAlign: 'right', marginTop: '-30px' }}>
                  <h1 style={{
                    textAlign:'right',
                    color: '#024606',
                    padding:'3px 20px',
                    margin: '0 0 5px 0',
                    fontSize: '87px',
                    fontWeight: 'bold',
                    letterSpacing: '2px',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                    fontFamily: 'Georgia, serif',
                    textTransform: 'uppercase',
                    verticalAlign: 'top',
                    textDecoration: 'none'
                  }}>SHRIKRISHNA</h1>
           
                 </div>
                        <img
                    src={logopng}
                    alt="Logo"
                    style={{
                      marginTop: '-160px',

                      float: 'left',
                      top: '0',
                      left: 'auto',
                      right: '10px',
                      width: '330px',
                      height: '400px',
                      objectFit: 'contain',
                      border: 'none',
                      outline: 'none',
                      display: 'block',
                      zIndex: '1',

                    }}
                  />
                 <div style={{ textAlign: 'right',marginTop:'-40px' }}>
                  <h2 style={{
                    color: '#024606',
                    margin: '5px',
                    fontSize: '87px',
                    fontWeight: 'normal',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    display: 'inline-block',
                    padding: '3px 30px',
                    borderRadius: '4px',
                    verticalAlign: 'botom',
                    textDecoration: 'none'
                  }}>CONSULTANCY</h2>
                 </div>
                </div>
                <div style={{ textAlign: 'right',marginTop:'-20px' }}>
                  <h4 style={{ color: 'green', margin: '3px 0',fontSize:'25px',padding:'3px 30px', textDecoration: 'none'}}>ENGG.PANKAJ SUDAM BAGUL B.E.CIVIL</h4>
                  <h4 style={{ color: 'green', margin: '3px 0',fontSize:'25px',padding:'3px 30px', textDecoration: 'none' }}>Reg.No.NSK/CCT/34AB/PSB/337/42/CT-|/2020-2021</h4>
                  <h4 style={{ color: 'green', margin: '3px 0',fontSize:'25px',padding:'3px 30px', textDecoration: 'none' }}>E-mail-Shrikrishnaconsultancy210@gmail.com</h4>
                  <h4 style={{ color: 'green', margin: '3px 0',fontSize:'25px',padding:'3px 30px', textDecoration: 'none' }}>MB.NO.7276113770</h4>
                </div>
               
                </div>

                
              </div>
            
          </caption>
          <tr><th> <label for="nameOfvaluationAgency">Name of valuation Agency :</label></th>
            <th colSpan="2"><input list="Name of valuation Agency" name='nameOfvaluationAgency' id='nameOfvaluationAgency' value={nameOfvaluationAgency} onChange={handleChange} />
              <datalist id="Name of valuation Agency">
                <option value="Vishal">Vishal</option>
                <option value="Vivek">Vivek</option>
              </datalist> </th>
            <th><label for='dateOfTechnicalInitiation'>Date of Technical Initiation :</label></th>
            <th colSpan="2"><input type='text' name='dateOfTechnicalInitiation' id='dateOfTechnicalInitiation' value={dateOfTechnicalInitiation} onChange={handleChange}></input></th></tr>

          <tr> <th><label for='applicantsName'>Applicant/s Name/s :</label></th>
            <th colSpan="2"><input type='text' name='applicantsName' id='applicantsName' value={applicantsName} onChange={handleChange}></input></th>
            <th><label for='dateOfSiteVisit'>Date of Site Visit :</label></th>
            <th colSpan="2"><input type='text' name='dateOfSiteVisit' id='dateOfSiteVisit' value={dateOfSiteVisit} onChange={handleChange}></input></th></tr>

          <tr> <th ><label for='requestFrom'>Request from :</label></th>
            <th colSpan="2"><input type='text' name='requestFrom' id='requestFrom' value={requestFrom} onChange={handleChange}></input></th>

            <th ><label for='dateOfReportRelease'>Date of Report release :</label></th>
            <th colSpan="2"><input type='text' name='dateOfReportRelease' id='dateOfReportRelease' value={dateOfReportRelease} onChange={handleChange}></input></th></tr>

          <tr> <th ><label for='proposalIdApplicationNo'>Proposal ID/Application No :</label></th>
            <th colSpan="2"><input type='text' name='proposalIdApplicationNo' id='proposalIdApplicationNo' value={proposalIdApplicationNo} onChange={handleChange}></input></th>
            <th><label for='transactionType'>Transaction type :</label></th>

            <th colSpan="2"><input type='text' name='transactionType' id='transactionType' value={transactionType} onChange={handleChange}></input><br></br></th></tr>

          <tr> <th><label for='branchNameId'>Branch name/ID :</label></th>
            <th colSpan="2"><input type='text' name='branchNameId' id='branchNameId' value={formData.branchNameId ?? ''} onChange={handleChange}></input></th>
            <th><label for='requestedFrom'>Requested From :</label></th>
            <th colSpan="2"><input type='text' name='requestedFrom' id='requestedFrom' value={requestedFrom} onChange={handleChange}></input><br></br></th></tr>


          <tr> <th><label for='currentOwnerSellerName'>Name of Current Owner/Seller :</label></th>
            <th colSpan="2"><input type='text' name='currentOwnerSellerName' id='currentOwnerSellerName' value={currentOwnerSellerName} onChange={handleChange}></input></th>
            <th><label for='personMetAtSiteName'>Name of the person met at a site :</label></th>
            <th colSpan="2"><input type='text' name='personMetAtSiteName' id='personMetAtSiteName' value={personMetAtSiteName} onChange={handleChange}></input><br></br></th>
          </tr>


          <th><label for='contactNoForPersonMet'>Contact No for person met :</label></th>
          <th colSpan="5"><input type='number' name='contactNoForPersonMet' id='contactNoForPersonMet' value={contactNoForPersonMet} onChange={handleChange}></input></th>

          <tr>
            <th colSpan="6"><h3>BASIC DEATAILS :</h3></th>
          </tr>

          <tr>
            <th colSpan="6"><h4>Adress of the property being appraised :</h4></th>
          </tr>

          <tr>
            <th ><label for='addressAsPerTRF'>Address As per TRF :</label></th>
            <th colSpan="5"><input type='text' name='addressAsPerTRF' id='addressAsPerTRF' value={addressAsPerTRF} onChange={handleChange}></input><br></br></th>
          </tr>

          <tr>
            <th> <label for='addressAsPerLegalDocuments'>Address as per Legal documenst :</label></th>
            <th colSpan="5"> <input type='text' name='addressAsPerLegalDocuments' id='addressAsPerLegalDocuments' value={addressAsPerLegalDocuments} onChange={handleChange}></input><br></br></th></tr>

          <tr>
            <th ><label for='addressAsPerActualSite'>Address as per actual at site :</label></th>
            <th colSpan="5"><input type='text' name='addressAsPerActualSite' id='addressAsPerActualSite' value={addressAsPerActualSite} onChange={handleChange}></input></th>
          </tr>

          <tr>
            <th><label for='documentsProvided'>Documents as Provided :</label></th>
            <th colSpan="5"><input type='text' name='documentsProvided' id='documentsProvided' value={documentsProvided} onChange={handleChange}></input><br></br></th></tr>

          <tr>

            <th><label for="Status Holding">Status Holding :</label></th>
            <th colSpan="2"><input list="Status Holding" name='statusHolding' id='statusHolding' value={statusHolding} onChange={handleChange} />
              <datalist id="Status Holding">
                <option value="Free Hold"></option>
                <option value="Lease Holding"></option>
              </datalist></th>

            <th><label for='deliveryAgency'>Delivery Agency :</label></th>
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

          <tr><th><label for='Streetonwhichpropertyislocated'>Street on which property is located :</label></th>
            <th colSpan="2"><input type='text' name='Streetonwhichpropertyislocated' id='Streetonwhichpropertyislocated' value={Streetonwhichpropertyislocated} onChange={handleChange}></input></th>
            <th><label for='NearestLandmark'>Nearest Landmark :</label></th>
            <th colSpan="2"><input type='text' name='NearestLandmark' id='NearestLandmark' value={NearestLandmark} onChange={handleChange}></input></th></tr>

          <tr><th><label for='Pincode'>Pincode :</label></th>
            <th colSpan="2"><input type='number' name='Pincode' id='Pincode' value={Pincode} onChange={handleChange}></input></th>

            <th><label for='OccupationStatus'>Occupation Status :</label></th>
            <th colSpan="2"><input list="Occupation Status" name='OccupationStatus' id='OccupationStatus' value={OccupationStatus} onChange={handleChange} />
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

            <th><label htmlFor="PropertyUsage">Property Usage :</label></th>
            <th colSpan="2">
              <select name='PropertyUsage' id='PropertyUsage' value={PropertyUsage} onChange={handleChange}>
                <option value="">Select Property Usage</option>
                <option value="Residential">Residential</option>
                <option value="Shop">Shop</option>
                <option value="Gowdown">Gowdown</option>
                <option value="Office">Office</option>
                <option value="Industrial">Industrial</option>
                <option value="Plot">Plot</option>
                <option value="Commercial">Commercial</option>
              </select>
            </th></tr>

          <tr><th><label htmlFor='PropertyIdentifiable'>Property Identifiable :</label></th>
            <th colSpan="2">
              <select name='PropertyIdentifiable' id='PropertyIdentifiable' value={PropertyIdentifiable} onChange={handleChange}>
                <option value="">Select</option>
                <option value='Yes'>Yes</option>
                <option value='No'>No</option>
              </select>
            </th>

            <th><label htmlFor='PropertyDemarcatedSeparatly'>Property Demarcated Separatly :</label></th>
            <th colSpan="2">
              <select name='PropertyDemarcatedSeparatly' id='PropertyDemarcatedSeparatly' value={PropertyDemarcatedSeparatly} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              <br></br>
            </th></tr>

          <tr><th><label for='PropertyIdentifiedThrough'>Property Identified through :</label></th>
            <th colSpan="2"><input list='Property Identified Through' name='PropertyIdentifiedThrough' id='PropertyIdentifiedThrough' value={PropertyIdentifiedThrough} onChange={handleChange}/>
              <datalist id='Property Identified Through'>
                <option value='Person met at Site'></option>
              </datalist></th>

            <th><label for='name'>Name of City/Town/Village :</label></th>
            <th colSpan="2"><input type='text' name='CityTownVillage' id='CityTownVillage' value={CityTownVillage} onChange={handleChange}></input><br></br></th>
          </tr>

          <tr><th> <label for="Roof Construction">Roof Construction :</label></th>
            <th colSpan="2"><input list="Roof Construction" name='RoofConstruction' id='RoofConstruction' value={RoofConstruction} onChange={handleChange}/>
              <datalist id="Roof Construction">
                <option value="RCC"></option>
                <option value="Load Bearing"></option>
                <option value="Under-Construction"></option>
              </datalist></th>

            <th><label for="Type of Structure">Type of Structure :</label></th>
            <th colSpan="2"><input list="Type of Structure" name='TypeOfStructure' id='TypeOfStructure' value={TypeOfStructure} onChange={handleChange} />
              <datalist id="Type of Structure">
                <option value="RCC"></option>
                <option value="Load Bearing"></option>
                <option value="Steel Structure with bricks wall And AC Sheet roofing"></option>
              </datalist><br></br></th></tr>

          <tr><th><label htmlFor="NoOfFloors">No.of Floors in the Building :</label></th>
            <th colSpan="2">
              <input list='NoOfFloors' name='NoOfFloors' id='NoOfFloors' value={NoOfFloors} onChange={handleChange}/>
                <datalist id="NoOfFloors">
                <option value="Ground + one">Ground + one</option>
                <option value="Ground + two">Ground + two</option>
                <option value="Ground + Three">Ground + Three</option>

              </datalist></th>

            <th><label htmlFor='LocatedOnFloor'>Located on Floor No. :</label></th>
            <th colSpan="2"><input type='number' name='LocatedOnFloor' id='LocatedOnFloor' value={LocatedOnFloor} onChange={handleChange}></input><br></br></th></tr>


          <tr><th><label htmlFor="ExternalFinishing">External Finishing :</label></th>
            <th colSpan="2">
              <select name='ExternalFinishing' id='ExternalFinishing' value={ExternalFinishing} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Average">Average</option>
                <option value="Fair">Fair</option>
                <option value="Good">Good</option>
                <option value="Very Good">Very Good</option>
                <option value="Under-Construction">Under-Construction</option>
              </select>
            </th>


            <th><label htmlFor="TypesOfFlooring">Types of flooring :</label></th>
            <th colSpan="2">
              <select name='TypesOfFlooring' id='TypesOfFlooring' value={TypesOfFlooring} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Vitrified">Vitrified</option>
                <option value="Granite">Granite</option>
                <option value="Marble">Marble</option>
                <option value="Italian Marble Flooring">Italian Marble Flooring</option>
                <option value="Mosaic tile">Mosaic tile</option>
                <option value="Kota">Kota</option>
              </select>
              <br></br>
            </th></tr>

          <tr><th><label htmlFor='PresentAge'>Present Age of the property in yrs :</label></th>
            <th colSpan="2"><input type='number' name='PresentAge' id='PresentAge' value={PresentAge} onChange={handleChange}></input></th>

            <th><label htmlFor='FuturePhysicalLife'>Future Physical Life of property in yrs :</label></th>
            <th colSpan="2"><input type='number' name='FuturePhysicalLife' id='FuturePhysicalLife' value={FuturePhysicalLife} onChange={handleChange}></input><br></br></th></tr>

          <tr><th><label for='name'>Latitude :</label></th>
            <th colSpan="2"><input type='text' name='Latitude' id='Latitude' value={Latitude} onChange={handleChange}></input></th>

            <th><label for='name'>Longitude :</label></th>
            <th colSpan="2"><input type='text' name='Longitude' id='Longitude' value={Longitude} onChange={handleChange}></input><br></br></th></tr>

          <tr><th><label for="Infrastructureinthearea">Infrastructure in the area :</label></th>
            <th colSpan="2"><input list="Infrastructure in the area" name='InfrastructureInArea' id='InfrastructureInthearea' value={InfrastructureInArea} onChange={handleChange} />
              <datalist id="Infrastructure in the area">
                <option value="Average"></option>
                <option value="Fair"></option>
                <option value="Good"></option>
                <option value="Very Good"></option>
                <option value="Under Developed"></option>
              </datalist></th>

            <th><label for="ClassofLocality">Class of Locality :</label></th>
            <th colSpan="2"><input list="Class of Locality" name='ClassOfLocality' id='ClassOfLocality' value={ClassOfLocality} onChange={handleChange} />
              <datalist id="Class of Locality">
                <option value="High-end Class"></option>
                <option value="Upper-Mid-end Class"></option>
                <option value="Mid-end Class"></option>
                <option value="Lower Class"></option>
              </datalist><br></br></th></tr>

          <tr><th><label for="TypeofRoad">Type of Road :</label></th>
            <th colSpan="2"><input list="Type of Road" name='TypeOfRoad' id='TypeOfRoad' value={TypeOfRoad} onChange={handleChange}/>
              <datalist id="Type of Road">
                <option value="Cocreat"></option>
                <option value="Tar"></option>
                <option value="WBM"></option>
                <option value="Pandhan Road"></option>
              </datalist></th>

            <th><label for="Width of Road(Fit)">Width of Road :(Fit)</label></th>
            <th colSpan="2"><input list="Width of Road(Fit)" name='WidthOfRoad' id='WidthOfRoad' value={WidthOfRoad} onChange={handleChange} />
              <datalist id="Width of Road(Fit)">
                <option value="5 feet"></option>
                <option value="10 Feet"></option>
                <option value="15 fett"></option>
                <option value="20 feet"></option>
              </datalist><br></br></th></tr>

          <tr><th><label htmlFor="Propertyareaiscommunitydominatedare">Property Area is community dominated are:</label></th>
            <th colSpan="2">
              <select name='Propertyareaiscommunitydominatedare' id='Propertyareaiscommunitydominatedare' value={Propertyareaiscommunitydominatedare} onChange={handleChange}>
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </th>

            <th><label htmlFor='DistanceFromBusStop'>Distance from Bus Stop(KM) :</label></th>
            <th colSpan="2"><input type='text' name='DistanceFromBusStop' id='DistanceFromBusStop' value={DistanceFromBusStop} onChange={handleChange}></input><br></br></th>
          </tr>

          <tr><th><label for='name'>Distance from Main Market(KM) :</label></th>
            <th colSpan="2"><input type='text' name='DistanceFromMainMarket' id='DistanceFromMainMarket' value={DistanceFromMainMarket}onChange={handleChange}></input></th>

            <th><label for='name'>Distance from Railway Station(KM) :</label></th>
            <th colSpan="2"> <input type='text' name='DistanceFromRailwayStation' id='DistanceFromRailwayStation' value={DistanceFromRailwayStation}onChange={handleChange}></input><br></br></th></tr>

          <tr><th><label for="PropertyfallsunderSeismicZone:">Property falls under Seismic Zone :    </label></th>
            <th colSpan="2"><input list="Property falls under Seismic Zone:" name='PropertyFallsUnderSeismicZone' id='PropertyFallsUnderSeismicZone' value={PropertyFallsUnderSeismicZone} onChange={handleChange}/>
              <datalist id="Property falls under Seismic Zone:">
                <option value="Zone III"></option>
              </datalist></th>

            <th><label for="PropertyFallsUnderFloodZone">Property falls Under Flood Zone :</label></th>
            <th colSpan="2"><input list="Property falls Under Flood Zone" name='PropertyFallsUnderFloodZone' id='PropertyFallsUnderFloodZone' value={PropertyFallsUnderFloodZone} onChange={handleChange}/>
              <datalist id="Property falls Under Flood Zone">
                <option value="Yes"></option>
                <option value="No"></option>
              </datalist></th>
          </tr>
         
          <tr><th><label for='PropertyFallsUnderCycloneZone'>Property falls under Cyclone Zone :
          </label></th><th colSpan="2"><input list='Property Falls Under Cyclone Zone' name='PropertyFallsUnderCycloneZone' id='PropertyFallsUnderCycloneZone' value={PropertyFallsUnderCycloneZone} onChange={handleChange} />
              <datalist id="Property falls Under Cyclone Zone">
                <option value="Yes"></option>
                <option value="No"></option>
              </datalist></th>

            <th><label for='PropertyFallsInCRZone'>Property falls in CR Zone :</label></th>
            <th colSpan="2"><input list='Property Falls In CR Zone' name='PropertyFallsInCRZone' id='PropertyFallsInCRZone' value={PropertyFallsInCRZone} onChange={handleChange}/>
              <datalist id="Property falls Under CR Zone">
                <option value="Yes"></option>
                <option value="No"></option>
              </datalist></th>
          </tr>

          <tr><th><label for="Degree of Risk Associated">Degree of Risk Associated :</label></th>
            <th colSpan="2"><input list="Degree of Risk Associated" name='DegreeOfRiskAssociated' id='DegreeOfRiskAssociated' value={DegreeOfRiskAssociated} onChange={handleChange} />
              <datalist id="Degree of Risk Associated">
                <option value="Low"></option>
                <option value="High"></option>
              </datalist></th>

            <th><label for="AnyriskofDemolition">Any risk of Demolition :</label></th>
            <th colSpan="2"><input list="Any risk of Demolition" name='AnyRiskOfDemolition' id='AnyRiskOfDemolition' value={AnyRiskOfDemolition} onChange={handleChange} />
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

          <tr><td> <label htmlFor='BoundariesMatching'>Boundaries Matching :</label></td>
            <th colSpan="1"><input list='Boundaries Matching' type='text' name='BoundariesMatching' id='BoundariesMatching' value={BoundariesMatching} onChange={handleChange} />
              <datalist id="Boundaries Matching">
                <option value="Yes"></option>
                <option value="No"></option>
              </datalist></th>

            <td><label htmlFor='ReasonForNonMatching'>If No,then reason theron :</label></td>
            <th colSpan="4"> <input type='text' name='ReasonForNonMatching' id='ReasonForNonMatching' value={ReasonForNonMatching} onChange={handleChange}></input></th></tr>

          <tr><td colSpan="6"><h4>Plot dimension details (In Ft) for Independent Built up :</h4></td></tr>

          <tr> <th><h3>Direction :</h3></th>
            <th><h4>East</h4></th>
            <th><h4>West</h4></th>
            <th><h4>North</h4></th>
            <th><h4>South</h4></th>
            <th><h4>Total Area in Sqft</h4></th></tr>

          <tr>
            <td><h4>Legal Area as per Docs in Sfqt :</h4></td>
            <td><input type="text" name='LegalAreaEast' id='LegalAreaEast' value={LegalAreaEast} placeholder='East' className={styles.input} onChange={handleChange} /></td>
            <td><input type="text" name='LegalAreaWest' id='LegalAreaWest' value={LegalAreaWest} placeholder='West' className={styles.input} onChange={handleChange} /></td>
            <td><input type="text" name='LegalAreaNorth' id='LegalAreaNorth' value={LegalAreaNorth} placeholder='North' className={styles.input} onChange={handleChange}/></td>

            <td><input type="text" name='LegalAreaSouth' id='LegalAreaSouth' value={LegalAreaSouth} placeholder='South' className={styles.input}  onChange={handleChange} /></td>
            <td><input type="text" name='LegalTotalArea' id='LegalTotalArea' value={LegalTotalArea} placeholder='Total Area in Sqft' className={styles.input}  onChange={handleChange}/></td>
          </tr>


          <tr> <td><h4>Actual Area at site in Sqft :</h4></td>
            <td><input type="text" name='ActualAreaEast' id='ActualAreaEast' value={ActualAreaEast} placeholder='East' className={styles.input}  onChange={handleChange}/></td>
            <td><input type="text" name='ActualAreaWest' id='ActualAreaWest' value={ActualAreaWest} placeholder='West' className={styles.input} onChange={handleChange} /></td>
            <td><input type="text" name='ActualAreaNorth' id='ActualAreaNorth' value={ActualAreaNorth} placeholder='North' className={styles.input}  onChange={handleChange} /></td>
            <td><input type="text" name='ActualAreaSouth' id='ActualAreaSouth' value={ActualAreaSouth} placeholder='South' className={styles.input}  onChange={handleChange}/></td>
            <td><input type="text" name='ActualTotalArea' id='ActualTotalArea' value={ActualTotalArea} placeholder='Total Area in sqft' className={styles.input}  onChange={handleChange} /></td>
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
            <td> <input type="text" name='FloorGround' id='FloorGround' value={formData.FloorGround ?? ''} onChange={handleChange} placeholder='Ground Floor' className={styles.input} /></td>
            <td> <input type="text" name='AccommodationGround' id='AccommodationGround' value={formData.AccommodationGround ?? ''} onChange={handleChange} placeholder='Ground Floor Accommodation' className={styles.input} /></td>
            <td> <input type="text" name='CarpetAreaSanctionedGround' id='CarpetAreaSanctionedGround' placeholder='Ground Floor Carpet Area in sq.ft.As per Sanctioned Plan' value={formData.CarpetAreaSanctionedGround ?? ''} onChange={handleChange} className={styles.input} /></td>
            <td> <input type="text" name='CarpetAreaSiteGround' id='CarpetAreaSiteGround' placeholder='Ground Floor Carpet Area in sq.ft.As per Site Measurements' value={formData.CarpetAreaSiteGround ?? ''} onChange={handleChange} className={styles.input} /></td>
            <td> <input type="text" name='PermissibleAreaGround' id='PermissibleAreaGround' placeholder='Ground Floor Permissible/plan Area in sq.ft.' value={formData.PermissibleAreaGround ?? ''} onChange={handleChange} className={styles.input} /></td>
            <td> <input type="text" name='AdoptedAreaGround' id='AdoptedAreaGround' value={formData.AdoptedAreaGround ?? ''} onChange={handleChange} placeholder='Ground Floor Adopted Area in sq.ft.' className={styles.input} /></td>
          </tr>

          <tr>
            <td><input type="text" name='FloorFirst' id='FloorFirst' value={formData.FloorFirst ?? ''} onChange={handleChange} placeholder='First Floor' className={styles.input} /></td>
            <td><input type="text" name='AccommodationFirst' id='AccommodationFirst' value={formData.AccommodationFirst ?? ''} onChange={handleChange} placeholder='First Floor Accommodation' className={styles.input} /></td>
            <td><input type="text" name='CarpetAreaSanctionedFirst' id='CarpetAreaSanctionedFirst' value={formData.CarpetAreaSanctionedFirst ?? ''} onChange={handleChange} placeholder='First Floor Carpet Area in sq.ft.As per Sanctioned Plan' className={styles.input} /></td>
            <td><input type="text" name='CarpetAreaSiteFirst' id='CarpetAreaSiteFirst' value={formData.CarpetAreaSiteFirst ?? ''} onChange={handleChange} placeholder='First Floor Carpet Area in sq.ft.As per Site Measurements' className={styles.input} /></td>
            <td><input type="text" name='PermissibleAreaFirst' id='PermissibleAreaFirst' value={formData.PermissibleAreaFirst ?? ''} onChange={handleChange} placeholder='First Floor Permissible/plan Area in sq.ft.' className={styles.input} /></td>
            <td><input type="text" name='AdoptedAreaFirst' id='AdoptedAreaFirst' value={formData.AdoptedAreaFirst ?? ''} onChange={handleChange} placeholder='First Floor Adopted Area in sq.ft' className={styles.input} /></td>
          </tr>

          <tr>
            <td><input type="text" name='FloorSecond' id='FloorSecond' value={formData.FloorSecond ?? ''} onChange={handleChange} placeholder='Second Floor' className={styles.input} /></td>
            <td><input type="text" name='AccommodationSecond' id='AccommodationSecond' value={formData.AccommodationSecond ?? ''} onChange={handleChange} placeholder='Second Floor Accommodation' className={styles.input} /></td>
            <td><input type="text" name='CarpetAreaSanctionedSecond' id='CarpetAreaSanctionedSecond' value={formData.CarpetAreaSanctionedSecond ?? ''} onChange={handleChange} placeholder='Second Floor Carpet Area in sq.ft.As per Sanctioned Plan' className={styles.input} /></td>
            <td><input type="text" name='CarpetAreaSiteSecond' id='CarpetAreaSiteSecond' value={formData.CarpetAreaSiteSecond ?? ''} onChange={handleChange} placeholder='Second Floor Carpet Area in sq.ft.As per Site Measurements' className={styles.input} /></td>
            <td><input type="text" name='PermissibleAreaSecond' id='PermissibleAreaSecond' value={formData.PermissibleAreaSecond ?? ''} onChange={handleChange} placeholder='Second Floor Permissible/plan Area in sq.ft.' className={styles.input} /></td>
            <td><input type="text" name='AdoptedAreaSecond' id='AdoptedAreaSecond' value={formData.AdoptedAreaSecond ?? ''} onChange={handleChange} placeholder='Second Floor Adopted Area in sq.ft' className={styles.input} /></td>
          </tr>
          <tr>
            <td><input type="text" name='FloorThird' id='FloorThird' value={formData.FloorThird ?? ''} onChange={handleChange} placeholder='Third Floor' className={styles.input} /></td>
            <td><input type="text" name='AccommodationThird' id='AccommodationThird' value={formData.AccommodationThird ?? ''} onChange={handleChange} placeholder='Third Floor Accommodation' className={styles.input} /></td>
            <td><input type="text" name='CarpetAreaSanctionedThird' id='CarpetAreaSanctionedThird' value={formData.CarpetAreaSanctionedThird ?? ''} onChange={handleChange} placeholder='Third Floor Carpet Area in sq.ft.As per Sanctioned Plan' className={styles.input} /></td>
            <td><input type="text" name='CarpetAreaSiteThird' id='CarpetAreaSiteThird' value={formData.CarpetAreaSiteThird ?? ''} onChange={handleChange} placeholder='Third Floor Carpet Area in sq.ft.As per Site Measurements' className={styles.input} /></td>
            <td><input type="text" name='PermissibleAreaThird' id='PermissibleAreaThird' value={formData.PermissibleAreaThird ?? ''} onChange={handleChange} placeholder='Third Floor Permissible/plan Area in sq.ft.' className={styles.input} /></td>
            <td><input type="text" name='AdoptedAreaThird' id='AdoptedAreaThird' value={formData.AdoptedAreaThird ?? ''} onChange={handleChange} placeholder='Third Floor Adopted Area in sq.ft' className={styles.input} /></td>
          </tr>

          <tr>
            <td><input type="text" name='FloorFourth' id='FloorFourth' value={formData.FloorFourth ?? ''} onChange={handleChange} placeholder='Fourth Floor' className={styles.input} /></td>
            <td><input type="text" name='AccommodationFourth' id='AccommodationFourth' value={formData.AccommodationFourth ?? ''} onChange={handleChange} placeholder='Fourth Floor' className={styles.input} /></td>
            <td><input type="text" name='CarpetAreaSanctionedFourth' id='CarpetAreaSanctionedFourth' value={formData.CarpetAreaSanctionedFourth ?? ''} onChange={handleChange} placeholder='Fourth Floor Carpet Area in sq.ft.As per Sanctioned Plan' className={styles.input} /></td>
            <td><input type="text" name='CarpetAreaSiteFourth' id='CarpetAreaSiteFourth' value={formData.CarpetAreaSiteFourth ?? ''} onChange={handleChange} placeholder='Fourth Floor Carpet Area in sq.ft.As per Sanctioned Plan' className={styles.input} /></td>
            <td><input type="text" name='PermissibleAreaFourth' id='PermissibleAreaFourth' value={formData.PermissibleAreaFourth ?? ''} onChange={handleChange} placeholder='Fourth Floor Permissible/plan Area in sq.ft.' className={styles.input} /></td>
            <td><input type="text" name='AdoptedAreaFourth' id='AdoptedAreaFourth' value={formData.AdoptedAreaFourth ?? ''} onChange={handleChange} placeholder='Fourth Floor Adopted Area in sq.ft' className={styles.input} /></td>
          </tr>

          <tr><td ><label htmlFor='Total-Loading%onCarpetArea+BalconyArea+DryBalconey'>Total-Loading % on Carpet Area +Balcony Area+Dry Balconey :</label></td>
            <td colSpan="2"><input type='text' name='Total-Loading%onCarpetArea+BalconyArea+DryBalconey' id='Total-Loading%onCarpetArea+BalconyArea+DryBalconey' value={formData['Total-Loading%onCarpetArea+BalconyArea+DryBalconey'] ?? ''} onChange={handleChange}></input></td>

            <td ><label htmlFor='TotalAreaWithLoading'>Total Area with Loading (Sq/ft) :</label></td>
            <td colSpan="2"><input type='text' name='TotalAreaWithLoading' id='TotalAreaWithLoading' value={formData.TotalAreaWithLoading ?? ''} onChange={handleChange}></input></td>
          </tr>


          <tr><th colSpan="6"><h3>Building Approvals & Related Documents :</h3></th></tr>

          <tr><td><h3>Documents Name :</h3></td>
            <td colSpan="5"><h3>Document Value :</h3></td></tr>

          <tr><td> <label htmlFor='LayoutplanDetails'>Layout plan Details :</label></td>
            <td colSpan="5"><input type='text' name='LayoutplanDetails' id='LayoutplanDetails' value={LayoutplanDetails} onChange={handleChange}></input><br></br></td></tr>

          <tr><th><label htmlFor='BuildingSanctionApprovedPlanDetails'>Building sanction/Approved Plan Details :</label></th>
            <th colSpan="5"><input type='text' name='BuildingSanctionApprovedPlanDetails' id='BuildingSanctionApprovedPlanDetails' value={BuildingSanctionApprovedPlanDetails} onChange={handleChange}></input><br></br></th></tr>

          <tr><th> <label htmlFor='CommencementCertificate'>Commencement Certificate :</label></th>
            <th colSpan="5"><input type='text' name='CommencementCertificate' id='CommencementCertificate' value={CommencementCertificate} onChange={handleChange}></input></th></tr>


          <tr><th><label htmlFor='CompletionCertificate'>Completion Certificate/Occupation Certificate No./BCC :</label></th>
            <th colSpan="5"><input type='text' name='CompletionCertificate' id='CompletionCertificate' value={CompletionCertificate} onChange={handleChange}></input><br></br></th></tr>

          <tr><th><label htmlFor='OtherDocuments'>Other Documents :</label></th>
            <th colSpan="5"><input type='text' name='OtherDocuments' id='OtherDocuments' value={OtherDocuments} onChange={handleChange}></input><br></br></th></tr>

          <tr> <td><label htmlFor='OwnershipDocuments'>Ownership Documents :</label></td>
            <td colSpan="5"><input type='text' name='OwnershipDocuments' id='OwnershipDocuments' value={OwnershipDocuments} onChange={handleChange}></input><br></br></td></tr>

          <tr><th><label htmlFor='PropertyOwner'>Property Owner as per Document :</label></th>
            <th colSpan="5"> <input type='text' name='PropertyOwner' id='PropertyOwner' value={PropertyOwner} onChange={handleChange}></input><br></br></th></tr>

          <tr><th><label for="isthepropertywithinmunicipalLimit">is the property within municipal Limit'</label></th>
            <th colSpan="5"><input list="is the property within municipal Limit" name='isthepropertywithinmunicipalLimit' id='isthepropertywithinmunicipalLimit' value={formData.isthepropertywithinmunicipalLimit ?? ''} onChange={handleChange} />
              <datalist id="is the property within municipal Limit">
                <option value="">Yes</option>
                <option value="">No</option>
              </datalist><br></br></th></tr>

          <tr><th> <label htmlFor='IfPlansNotAvailable'>if plans not available whether the structure confirming to the local byelaws :</label></th>
            <th colSpan="5"><input type='text' name='IfPlansNotAvailable' id='IfPlansNotAvailable' value={IfPlansNotAvailable} onChange={handleChange}></input><br></br></th></tr>

          <tr><th colSpan="6"><h3> Property Valuation :</h3></th></tr>
          <tr><th colSpan="6"><h3>Valuation of independent House/Bungalow</h3></th></tr>

          <tr><th><label htmlFor='LandPlotArea'>Land/plot Area(in Sq.ft.) :</label></th>
            <th colSpan="2"> <input type='text' name='LandPlotArea' id='LandPlotArea' value={LandPlotArea} onChange={handleChange}></input></th>

            <th><label htmlFor='AdoptableBuiltUpArea'>Adoptable Built-up Area(in Sq.ft.) :</label></th>
            <th colSpan="2"><input type='text' name='AdoptableBuiltUpArea' id='AdoptableBuiltUpArea' value={AdoptableBuiltUpArea} onChange={handleChange}></input><br></br></th></tr>

          <tr><th><label htmlFor='RateRangeofinthelocality(RSpersq.ft.)'>Rate Range of in the locality(RS per sq.ft.) :</label></th>
            <th colSpan="2"><input type='text' name='RateRangeofinthelocality(RSpersq.ft.)' id='RateRangeofinthelocality(RSpersq.ft.)' value={formData['RateRangeofinthelocality(RSpersq.ft.)'] ?? formData.RateRangeofinthelocality ?? ''} onChange={handleChange}></input></th>

            <th><label htmlFor='ConstructionCost'>Construction Cost (per sq.ft) :</label></th>
            <th colSpan="2"><input type='text' name='ConstructionCost' id='ConstructionCost' value={ConstructionCost} onChange={handleChange}></input><br></br></th></tr>



          <tr><th><label htmlFor='RecommendedRate'>Recommended Rate Rate of Lade(per sq.ft) :</label></th>
            <td colSpan="2"><input type='text' name='RecommendedRate' id='RecommendedRate' value={RecommendedRate} onChange={handleChange}></input></td>
            <td><label htmlFor='Totalvalue'>Total Construction Value for 100% complete building (in Rs)  :</label></td>
            <td colSpan="2"> <input type='text' name='Totalvalue' id='Totalvalue' value={Totalvalue} onChange={handleChange}></input><br></br></td></tr>

          <tr><th><label htmlFor='SpecialsAmenities'>pls specify if any Special Amenities Provided(in Rs) :</label></th>
            <th colSpan="2"> <input type='text' name='SpecialsAmenities' id='SpecialsAmenities' value={SpecialsAmenities} onChange={handleChange}/></th>
            
            <th><label htmlFor='AdditionalCosts'>Additional Cost incurred for Amenities Charges(in Rs) :</label></th>
            <th colSpan="2"> <input type='text' name='AdditionalCosts' id='AdditionalCosts' value={AdditionalCosts} onChange={handleChange}></input><br></br></th></tr>

          <tr><th><label for='name'>Total Land Value(in Rs) :</label></th>
            <th colSpan="2"> <input type='text' name='TotalLandValue' id='TotalLandValue' value={TotalLandValue}  onChange={handleChange}></input></th>
            <th><label for='name'>Total Construction Value at present construction stage(in Rs) :</label></th>
            <th colSpan="2"><input type='text' name='TotalConstructionValue' id='TotalConstructionValue' value={TotalConstructionValue} onChange={handleChange}></input><br></br></th></tr>

          <tr><th><label for='TotalFairMarketValues'>Total fair Market Value at 100% completions(in Rs) :</label></th>
            <th colSpan="2"><input type='text' name='TotalFairMarketValues' id='TotalFairMarketValues' value={TotalFairMarketValues} onChange={handleChange}></input></th>

            <th><label for='name'>Total Realizable Value on present completion stage(in Rs) :</label></th>
            <th colSpan="2"> <input type='text' name='TotalRealizableValue' id='TotalRealizableValue' value={TotalRealizableValue} onChange={handleChange}></input><br></br></th></tr>

          <tr><th><label for='name'>Total Forced/Distressed Value at 100% completion(in Rs) :</label></th>
            <th colSpan="2"> <input type='text' name='TotalForcedDistressedValue' id='TotalForcedDistressedValue' value={TotalForcedDistressedValue}onChange={handleChange}></input></th>
            <th><label for='name'>Total Forced/Distressed Value on present completion stage(in Rs) :</label></th>
            <th colSpan="2"> <input type='text' name='TotalForcedDistressedValuePresent' id='TotalForcedDistressedValuePresent' value={TotalForcedDistressedValuePresent}onChange={handleChange}></input><br></br></th></tr>

          <tr><th colSpan="6"><h3>Valuvation of flat/shop/office/industrial/other unit etc :</h3></th></tr>
          <tr><td><label htmlFor='SBUA'>SBUA(SFT) :</label></td>
            <td colSpan="2"><input type='text' name='SBUA' id='SBUA' value={SBUA} onChange={handleChange}></input></td>
            <td><label htmlFor='AdoptedRate'>Adopted rate(in per sq.ft) :</label></td>
            <td colSpan="2"> <input type='text' name='AdoptedRate' id='AdoptedRate' value={AdoptedRate} onChange={handleChange}></input><br></br></td></tr>

          <tr><th><label for='name'>Total Value of flat/shop/flat/office on 100% Complete(in Rs) :</label></th>
            <th colSpan="2"> <input type='text' name='TotalValue' id='TotalValue' value={TotalValue} onChange={handleChange}></input></th>
            
            <th><label for='name'>Additional Cost incurred for amenities(in Rs) :</label></th>
            <th colSpan="2"><input type='text' name='AdditionalsCost' id='AdditionalCost' value={AdditionalsCost} onChange={handleChange}></input></th></tr>

           <tr> <th><label for='name'>Total fair Market Value at 100% completion (in Rs) :</label></th>
            <th colSpan="2"> <input type='text' name='TotalFairMarketValue' id='TotalFairMarketValue' value={TotalFairMarketValue} onChange={handleChange}></input><br></br></th>
            <th><label htmlFor='TotalFairMarketValuePresent'>Total Fair Market Value on present completion stage (in Rs) (SFT) :</label></th>
            <th colSpan="2"><input type='text' name='TotalFairMarketValuePresent' id='TotalFairMarketValuePresent' value={TotalFairMarketValuePresent} onChange={handleChange}></input><br></br></th></tr>
            

          <tr><th> <label for='name'>Total Realizable Value at 100% completion stage(in Rs) :</label></th>
            <th colSpan="2"><input type='text' name='TotalRealizableValuePresents' id='TotalRealizableValuePresents' value={TotalRealizableValuePresents}onChange={handleChange}></input></th>
             <th><label for='name'>Total Realizable Value on present completion stage(in Rs) :</label></th>
            <th colSpan="2"><input type='text' name='TotalRealizableValuePresent' id='TotalRealizableValuePresent' value={TotalRealizableValuePresent}onChange={handleChange}></input><br></br></th>
            </tr>

          <tr><th><label for='TotalForcedDistressedValuecomplete'>Total Forced/Distressed Value at 100%  completion stage(in Rs) :</label></th>
            <th colSpan="2"> <input type='text' name='TotalForcedDistressedValuecomplete' id='TotalForcedDistressedValuecomplete' value={TotalForcedDistressedValuecomplete}onChange={handleChange}></input></th>

            <th><label for='name'>Total Forced/Distressed Value on present completion stage(in Rs) :</label></th>
            <th colSpan="2"><input type='text' name='TotalForcedDistressedValuePresents' id='TotalForcedDistressedValuePresents' value={TotalForcedDistressedValuePresents}onChange={handleChange}></input><br></br></th>
            </tr>
            
          <tr><th colSpan="6"><h3>Stage of Construction :</h3></th></tr>

          <tr><th><label for='name'>% Completion :</label></th>
            <th colSpan="2"> <input type='text' name='PercentageCompletion' id='PercentageCompletion' value={PercentageCompletion}onChange={handleChange}></input></th>
            <th><label for='name'>Recommended Construction Value :</label></th>
            <th colSpan="2"><input type='text' name='RecommendedConstructionValue' id='RecommendedConstructionValue' value={RecommendedConstructionValue}onChange={handleChange}></input><br></br></th></tr>

          <tr><th colSpan="6"><h3>Guideline & Distress/Forced sale Value :</h3></th></tr>
          <tr colSpan="2"> <th><label for='name'>government Guideline/ Circle rate for Land ( Rate in sq ft.only) :</label></th>
            <th colSpan="2"> <input type='text' name='GovernmentGuidelineLand' id='GovernmentGuidelineLand' value={GovernmentGuidelineLand}onChange={handleChange}></input></th>
            <th><label for='name'>Land Value as per Goverment Rate(Rs) :</label></th>
            <th colSpan="2"><input type='text' name='LandValue' id='LandValue' value={LandValue} onChange={handleChange}></input><br></br></th></tr>



          <tr><th><label for='name'>government Guideline/ Circle rate for flate/unit/Built Up(RS) ( Rate in sq ft.only) :</label></th>
            <th colSpan="2"> <input type='text' name='GovernmentGuidelineFlat' id='GovernmentGuidelineFlat' value={GovernmentGuidelineFlat}onChange={handleChange}></input></th>
            <th><label for='name'>Flat/Unit/Built up Value as per Goverment Rate (Rs per sq.ft.) :</label></th>
            <th colSpan="2"><input type='text' name='FlatValue' id='FlatValue' value={FlatValue}onChange={handleChange}></input><br></br></th></tr>


          <tr><th><label for='name'>Forced Sale Value(In Rs)(80%) :</label></th>
            <th colSpan="2"> <input type='text' name='ForcedSaleValue' id='ForcedSaleValue' value={ForcedSaleValue}onChange={handleChange}></input></th>
            <th><label for='name'>Avg Rental per sqft(in Rs) :</label ></th>
            <th colSpan="2"> <input type='text' name='AverageRental' id='AverageRental' value={AverageRental} onChange={handleChange}></input><br></br></th></tr>

          <tr><th> <label for='name'>Realizable value(in Rs) :</label></th>
            <th colSpan="5"> <input type='text' name='RealizableValue' id='RealizableValue' value={RealizableValue}onChange={handleChange}></input></th></tr>
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
            <td colSpan="5"><p>This report is prepared for based on the documents furnished and/or the condition of the property as prevailed at the time of our visit for Yes Bank. The report provides an indicative market value of the property in our opinion which may not necessarily reflect the guideline value. Cost of construction is estimated based on our opinion on prevailing market rates at the time of our visit. Builtup area considered for valuation in this report at presumed FSI basis revised allowable FSI Limits considered by NIDO Home Finance. Quality of construction is assessed based on the visual and corroborative evidence obtained at site during our visit. Measurement of the property is made to the extent reasonably possible considering the limitations at site. This report does not certify the ownership of the property. The ownership details shall be referred from the legal due diligence report.
              Report isvalidfor 90 days from the date of visit or report.
            </p> </td></tr>

          <tr>
            <td colSpan="6">
              <h4>Satellite Map:</h4>
              {formData.Uploadphotosatelitemap ? (
                <div>
                  <img
                    src={formData.Uploadphotosatelitemap}
                    alt="Satellite Map"
                    style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto('Uploadphotosatelitemap')}
                    style={{ marginTop: '10px', backgroundColor: '#dc3545', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete Photo
                  </button>
                </div>
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
                <div>
                  <img
                    src={formData.UploadphotoHall}
                    alt="Hall"
                    style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto('UploadphotoHall')}
                    style={{ marginTop: '10px', backgroundColor: '#dc3545', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete Photo
                  </button>
                </div>
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
                <div>
                  <img
                    src={formData.UploadphotoKichen}
                    alt="Kitchen"
                    style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto('UploadphotoKichen')}
                    style={{ marginTop: '10px', backgroundColor: '#dc3545', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete Photo
                  </button>
                </div>
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
                <div>
                  <img
                    src={formData.UploadphotoBedroom}
                    alt="Bedroom"
                    style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto('UploadphotoBedroom')}
                    style={{ marginTop: '10px', backgroundColor: '#dc3545', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete Photo
                  </button>
                </div>
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
                <div>
                  <img
                    src={formData.UploadphotoOtherRoom}
                    alt="Other Room"
                    style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto('UploadphotoOtherRoom')}
                    style={{ marginTop: '10px', backgroundColor: '#dc3545', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete Photo
                  </button>
                </div>
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
                <div>
                  <img
                    src={formData.UploadphotoOtherPhoto}
                    alt="Other Photo"
                    style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto('UploadphotoOtherPhoto')}
                    style={{ marginTop: '10px', backgroundColor: '#dc3545', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete Photo
                  </button>
                </div>
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
                <div>
                  <img
                    src={formData.UploadphotoExternalPhoto}
                    alt="External Photo"
                    style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto('UploadphotoExternalPhoto')}
                    style={{ marginTop: '10px', backgroundColor: '#dc3545', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete Photo
                  </button>
                </div>
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
                <div>
                  <img
                    src={formData.UploadphotoFrontSite}
                    alt="Front Site"
                    style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto('UploadphotoFrontSite')}
                    style={{ marginTop: '10px', backgroundColor: '#dc3545', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete Photo
                  </button>
                </div>
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
                <div>
                  <img
                    src={formData.UploadphotoRoadSite}
                    alt="Road Site"
                    style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto('UploadphotoRoadSite')}
                    style={{ marginTop: '10px', backgroundColor: '#dc3545', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete Photo
                  </button>
                </div>
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
                <div>
                  <img
                    src={formData.UploadphotoSelfieWithProperty}
                    alt="Selfie with Property"
                    style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto('UploadphotoSelfieWithProperty')}
                    style={{ marginTop: '10px', backgroundColor: '#dc3545', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete Photo
                  </button>
                </div>
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
                <div>
                  <img
                    src={formData.UploadphotoSelfieWithPerson}
                    alt="Selfie with Person"
                    style={{ maxWidth: '100%', height: 'auto', marginTop: '10px' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto('UploadphotoSelfieWithPerson')}
                    style={{ marginTop: '10px', backgroundColor: '#dc3545', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete Photo
                  </button>
                </div>
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
  )
}



