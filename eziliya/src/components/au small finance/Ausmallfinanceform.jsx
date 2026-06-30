import React, { useState, useEffect } from 'react';
import styles from './Ausmallfinanceform.module.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import StageCalculater from '../../components/stage calculater/StageCalculater';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/** Serialize form values for React Router state; map file fields to data URLs and align report keys. */
function buildReportPayload(data) {
  const out = {};
  
  // First, copy all original fields (PascalCase from backend)
  for (const [k, v] of Object.entries(data)) {
    if (v != null && v !== '') {
      out[k] = v;
    }
  }

  const copyIf = (from, to) => {
    if (out[from] != null && out[from] !== '') out[to] = out[from];
  };

  // Map PascalCase backend fields to camelCase frontend fields
  const fieldMappings = {
    'ApplicantsNames': 'applicantsName',
    'DateofTechnicalInitiation': 'dateOfTechnicalInitiation',
    'DateofSiteVisit': 'dateOfSiteVisit',
    'DateofReportrelease': 'dateOfReportRelease',
    'ProposalIdApplicationNo': 'proposalIdApplicationNo',
    'TransactionType': 'transactionType',
    'BranchnameID': 'branchNameId',
    'Requestfrom': 'requestFrom',
    'NameofCurrentOwnerSeller': 'nameOfCurrentOwnerSeller',
    'NameofthePersonmetAtasite': 'nameOfPersonMetAtSite',
    'ContactDetailsOfPersonmetAtsite': 'contactDetailsOfPersonMetAtSite',
    'AddressAsperTRF': 'addressAsPerTRF',
    'adressasperLegalDocuments': 'addressAsPerLegalDocuments',
    'AddressasperActualAtsite': 'addressAsPerActualSite',
    'StatusHolding': 'statusHolding',
    'DeleveryAgency': 'deliveryAgency',
    'TypeofProperty': 'typeOfProperty',
    'NameoftheState': 'nameOfState',
    'MainLocality': 'mainLocality',
    'SubLocality': 'subLocality',
    'StreetonwhichPropertyislocated': 'streetOnWhichPropertyIsLocated',
    'NearestLandmark': 'nearestLandmark',
    'Pincode': 'pincode',
    'Occupationstatus': 'occupationStatus',
    'LocalityzoningtypeasperlatestDevelopmentMasterPlan': 'localityZoningType',
    'NameoftheCityTownVillage': 'nameOfCityTownVillage',
    'RoofConstructionType': 'roofConstructionType',
    'TypeofStructure': 'typeOfStructure',
    'NumberofFloorsintheBuilding': 'numberOfFloorsInBuilding',
    'LocatedonfloorNo': 'locatedOnFloorNo',
    'ExternalFinishing': 'externalFinishing',
    'InternalFinishing': 'internalFinishing',
    'TypesofFlooring': 'typesOfFlooring',
    'PresentAgeofBuilding': 'presentAgeOfBuilding',
    'FuturePhysicalLifeofPropertyinyrs': 'futurePhysicalLife',
    'Latitude': 'latitude',
    'Longitude': 'longitude',
    'InfrastructureintheArea': 'infrastructureInArea',
    'AmenitiesintheArea': 'amenitiesInArea',
    'ClassofLocality': 'classOfLocality',
    'TypeOfRoad': 'typeOfRoad',
    'WidthOfRoad': 'widthOfRoad',
    'ElectricficationElectricpole': 'electrification',
    'DistanceFromBusStopKM': 'distanceFromBusStop',
    'DistanceFromRailwayStationKM': 'distanceFromRailwayStation',
    'DistanceFromMainMarketKM': 'distanceFromMainMarket',
    'PropertyfallsunderSeismicZone': 'seismicZone',
    'PropertyfallsunderFloodZone': 'floodZone',
    'PropertyfallsunderCycloneZone': 'cycloneZone',
    'Uploadphotosatelitemap': 'satelliteMap',
    'UploadphotoHall': 'hallPhoto',
    'UploadphotoKichen': 'kitchenPhoto',
    'UploadphotoBedroom': 'bedroomPhoto',
    'UploadphotoOtherroom': 'otherRoomPhoto',
    'UploadphotoOther': 'otherPhoto',
    'UploadphotoExternalPhoto': 'externalPhoto',
    'UploadphotoFrontSIte': 'frontSitePhoto',
    'UploadphotoRoadSIte': 'roadSitePhoto',
    'UploadphotoSelfiWithProperty': 'selfieWithProperty',
    'UploadphotoSelfiWithpersonAtProperty': 'selfieWithPerson'
  };

  // Apply all field mappings
  for (const [from, to] of Object.entries(fieldMappings)) {
    copyIf(from, to);
  }

  // Additional mappings for special cases
  copyIf('RateRangeofinthelocality', 'RateRangeofinthelocality(RSpersq.ft.)');
  copyIf(
    'LocalityzoningtypeasperLatestDevelopmentMasterPlan',
    'Locality/zoning typeasperLatestDevelopmentMasterPlan'
  );

  // Legacy file mappings (keep for backward compatibility)
  const fileToReport = {
    satelliteMap: 'Uploadphotosatelitemap',
    hall: 'UploadphotoHall',
    kitchen: 'UploadphotoKichen',
    bedroom: 'UploadphotoBedroom',
    otherRoom: 'UploadphotoOtherRoom',
    otherPhoto: 'UploadphotoOtherPhoto',
    externalPhoto: 'UploadphotoExternalPhoto',
    frontSite: 'UploadphotoFrontSite',
    roadSite: 'UploadphotoRoadSite',
    selfieWithProperty: 'UploadphotoSelfieWithProperty',
    selfieWithPerson: 'UploadphotoSelfieWithPerson',
    firmBackgroundLogo: 'firmBackgroundLogo',
  };
  
  // Define photo labels for each field
  const photoLabels = {
    'Uploadphotosatelitemap': 'Satellite Map',
    'UploadphotoHall': 'Hall',
    'UploadphotoKichen': 'Kitchen',
    'UploadphotoBedroom': 'Bedroom',
    'UploadphotoOtherRoom': 'Other Room',
    'UploadphotoOtherPhoto': 'Other Photo',
    'UploadphotoExternalPhoto': 'External Photo',
    'UploadphotoFrontSite': 'Front Site',
    'UploadphotoRoadSite': 'Road Site',
    'UploadphotoSelfieWithProperty': 'Selfie with Property',
    'UploadphotoSelfieWithPerson': 'Selfie with Person'
  };
  
  // First pass: collect all uploaded photos with their original labels
  const uploadedPhotos = [];
  for (const [from, to] of Object.entries(fileToReport)) {
    if (out[from] != null && out[from] !== '') {
      uploadedPhotos.push({
        from,
        to,
        data: out[from],
        label: photoLabels[to] || to
      });
    }
  }
  
  // Second pass: fill placeholders in order with photos and labels
  // Define the order of photo placeholders
  const photoPlaceholders = [
    'Uploadphotosatelitemap',
    'UploadphotoHall',
    'UploadphotoKichen',
    'UploadphotoBedroom',
    'UploadphotoOtherRoom',
    'UploadphotoOtherPhoto',
    'UploadphotoExternalPhoto',
    'UploadphotoFrontSite',
    'UploadphotoRoadSite',
    'UploadphotoSelfieWithProperty',
    'UploadphotoSelfieWithPerson'
  ];
  
  let photoIndex = 0;
  for (const placeholder of photoPlaceholders) {
    if (photoIndex < uploadedPhotos.length) {
      // Assign the next uploaded photo to this placeholder
      out[placeholder] = uploadedPhotos[photoIndex].data;
      // Store the original label for this photo
      out[placeholder + '_label'] = uploadedPhotos[photoIndex].label;
      photoIndex++;
    }
  }

  console.log('=== buildReportPayload Complete ===');
  console.log('Input fields:', Object.keys(data).length);
  console.log('Output fields:', Object.keys(out).length);
  console.log('Sample mapped fields:', {
    applicantsName: out.applicantsName,
    dateOfTechnicalInitiation: out.dateOfTechnicalInitiation,
    proposalIdApplicationNo: out.proposalIdApplicationNo
  });

  return out;
}

export default function Ausmallfinanceform() {
  const [formData, setFormData] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedFormId, setSavedFormId] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 12;

  // Page titles for navigation
  const pageConfig = [
    { page: 1, title: 'General Information', section: 'general' },
    { page: 2, title: 'Basic Details', section: 'basic' },
    { page: 3, title: 'Boundaries', section: 'boundaries' },
    { page: 4, title: 'Area & Accommodation', section: 'area' },
    { page: 5, title: 'Building Approvals', section: 'approvals' },
    { page: 6, title: 'Property Valuation', section: 'valuation' },
    { page: 7, title: 'Flat/Shop Valuation', section: 'flat-valuation' },
    { page: 8, title: 'Stage of Construction', section: 'construction' },
    { page: 9, title: 'Guideline & Distress Value', section: 'guideline' },
    { page: 10, title: 'Remarks/Observations', section: 'remarks' },
    { page: 11, title: 'Declaration', section: 'declaration' },
    { page: 12, title: 'Photo Uploads', section: 'photos' }
  ];

  // Navigation handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [showCalculator, setShowCalculator] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Load existing form data if editing
  useEffect(() => {
    const loadFormData = async () => {
      const formId = location.state?.formId;
      if (formId) {
        try {
          const response = await axios.get(`${API_BASE_URL}/ausmall-finance-form/${formId}`);
          
          console.log('Form load response:', response.data); // Debug log
          
          if (response.data.success && response.data.data) {
            setSavedFormId(formId);
            const loadedData = response.data.data;
            console.log('Loaded form data from DB:', loadedData); // Debug log
            
            // Convert PascalCase backend fields to camelCase frontend fields for display
            const backendToFrontendMapping = {
              'BankName': 'bankName',
              'LoanAmount': 'loanAmount',
              'NameofvaluationAgency': 'nameOfvaluationAgency',
              'DateofTechnicalInitiation': 'dateOfTechnicalInitiation',
              'ApplicantsNames': 'applicantsName',
              'DateofSiteVisit': 'dateOfSiteVisit',
              'Requestform': 'requestFrom',
              'DateofReportrelease': 'dateOfReportRelease',
              'ProposalIdApplicationNo': 'proposalIdApplicationNo',
              'TransactionType': 'transactionType',
              'BranchnameID': 'branchNameId',
              'NameofCurrentOwnerSeller': 'currentOwnerSellerName',
              'NameofthePersonmetAtasite': 'personMetAtSiteName',
              'ContactDetailsOfPersonmetAtsite': 'contactNoForPersonMet',
              'AddressAsperTRF': 'addressAsPerTRF',
              'adressasperLegalDocuments': 'addressAsPerLegalDocuments',
              'AddressasperActualAtsite': 'addressAsPerActualSite',
              'StatusHolding': 'statusHolding',
              'DeleveryAgency': 'deliveryAgency',
              'TypeofProperty': 'typeOfProperty',
              'NameoftheState': 'nameOfState',
              'MainLocality': 'mainLocality',
              'SubLocality': 'subLocality',
              'StreetonwhichPropertyislocated': 'streetOnWhichPropertyIsLocated',
              'NearestLandmark': 'nearestLandmark',
              'Pincode': 'pincode',
              'Occupationstatus': 'occupationStatus',
              'LocalityzoningtypeasperlatestDevelopmentMasterPlan': 'localityZoningType',
              'NameoftheCityTownVillage': 'nameOfCityTownVillage',
              'RoofConstructionType': 'roofConstructionType',
              'TypeofStructure': 'typeOfStructure',
              'NumberofFloorsintheBuilding': 'numberOfFloorsInBuilding',
              'LocatedonfloorNo': 'locatedOnFloorNo',
              'ExternalFinishing': 'externalFinishing',
              'InternalFinishing': 'internalFinishing',
              'TypesofFlooring': 'typesOfFlooring',
              'PresentAgeofBuilding': 'presentAgeOfBuilding',
              'FuturePhysicalLifeofPropertyinyrs': 'futurePhysicalLife',
              'Latitude': 'latitude',
              'Longitude': 'longitude',
              'InfrastructureintheArea': 'infrastructureInArea',
              'AmenitiesintheArea': 'amenitiesInArea',
              'ClassofLocality': 'classOfLocality',
              'TypeOfRoad': 'typeOfRoad',
              'WidthOfRoad': 'widthOfRoad',
              'ElectricficationElectricpole': 'electrification',
              'DistanceFromBusStopKM': 'distanceFromBusStop',
              'DistanceFromRailwayStationKM': 'distanceFromRailwayStation',
              'DistanceFromMainMarketKM': 'distanceFromMainMarket',
              'PropertyfallsunderSeismicZone': 'seismicZone',
              'PropertyfallsunderFloodZone': 'floodZone',
              'PropertyfallsunderCycloneZone': 'cycloneZone',
              'Uploadphotosatelitemap': 'satelliteMap',
              'UploadphotoHall': 'hall',
              'UploadphotoKichen': 'kitchen',
              'UploadphotoBedroom': 'bedroom',
              'UploadphotoOtherroom': 'otherRoom',
              'UploadphotoOther': 'otherPhoto',
              'UploadphotoExternalPhoto': 'externalPhoto',
              'UploadphotoFrontSIte': 'frontSite',
              'UploadphotoRoadSIte': 'roadSite',
              'UploadphotoSelfiWithProperty': 'selfieWithProperty',
              'UploadphotoSelfiWithpersonAtProperty': 'selfieWithPerson'
            };
            
            const convertedData = {};
            
            // Convert backend fields to frontend fields
            for (const [backendKey, frontendKey] of Object.entries(backendToFrontendMapping)) {
              if (loadedData[backendKey] !== undefined && loadedData[backendKey] !== null && loadedData[backendKey] !== '') {
                convertedData[frontendKey] = loadedData[backendKey];
              }
            }
            
            // Also keep original PascalCase fields for compatibility
            for (const [key, value] of Object.entries(loadedData)) {
              if (!backendToFrontendMapping[key] && value !== undefined && value !== null && value !== '') {
                convertedData[key] = value;
              }
            }
            
            console.log('Converted data for frontend:', convertedData);
            console.log('Photo fields loaded:', {
              satelliteMap: convertedData.satelliteMap ? 'YES' : 'NO',
              hall: convertedData.hall ? 'YES' : 'NO',
              kitchen: convertedData.kitchen ? 'YES' : 'NO'
            });
            
            setFormData(convertedData);
          } else {
            console.error('Invalid response structure:', response.data);
            alert('Failed to load form data: Invalid response format');
          }
        } catch (error) {
          console.error('Error loading form:', error);
          console.error('Error details:', error.response?.data);
          alert(`Failed to load form data: ${error.response?.data?.message || error.message}`);
        }
      }
    };
    loadFormData();
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    console.log(`Field changed: ${name} = ${value}`); // Debug log
    
    // Handle file inputs
    if (type === 'file' && files && files[0]) {
      const file = files[0];
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
        
        console.log('Auto-calc triggered:', { name, value, sbua, adoptedRate }); // Debug
        
        // Calculate: SBUA × Adopted Rate = Total Value
        const totalValue = sbua * adoptedRate;
        
        console.log('Calculated TotalValue:', totalValue); // Debug
        
        // Only update if both values are present
        if (sbua > 0 && adoptedRate > 0) {
          updated.TotalValue = totalValue.toFixed(2);
          console.log('Updated TotalValue:', updated.TotalValue); // Debug
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
        } else {
          updated.TotalFairMarketValue = '0';
        }
      }
      
      // Auto-calculate TotalFairMarketValue (for Flat/Shop/Office) when TotalValue or AdditionalsCost changes
      if (name === 'TotalValue' || name === 'AdditionalsCost') {
        const totalValue = parseFloat(name === 'TotalValue' ? value : prev.TotalValue) || 0;
        const additionalsCost = parseFloat(name === 'AdditionalsCost' ? value : prev.AdditionalsCost) || 0;
        
        console.log('TotalValue + AdditionalsCost calculation:', {
          name,
          value,
          totalValue,
          additionalsCost
        }); // Debug
        
        // Calculate: Total Value + Additional Cost = Total Fair Market Value (for Flat/Shop/Office)
        const totalFairMarketValue = totalValue + additionalsCost;
        
        console.log('Calculated TotalFairMarketValue:', totalFairMarketValue); // Debug
        
        if (totalValue > 0 || additionalsCost > 0) {
          updated.TotalFairMarketValue = totalFairMarketValue.toFixed(2);
          
          console.log('Updated values:', {
            TotalFairMarketValue: updated.TotalFairMarketValue
          }); // Debug
        } else {
          updated.TotalFairMarketValue = '0';
        }
      }
      
      // Auto-calculate TotalLandValue when LandPlotArea, RecommendedRate, or SpecialAmenities changes
      if (name === 'LandPlotArea' || name === 'RecommendedRate' || name === 'SpecialAmenities') {
        const landPlotArea = parseFloat(name === 'LandPlotArea' ? value : prev.LandPlotArea) || 0;
        const recommendedRate = parseFloat(name === 'RecommendedRate' ? value : prev.RecommendedRate) || 0;
        const specialAmenities = parseFloat(name === 'SpecialAmenities' ? value : prev.SpecialAmenities) || 0;
        
        // Calculate: (Land Area × Recommended Rate)  = Total Land Value
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
        } else {
          updated.TotalFairMarketValues = '0';
        }
      }
      
      return updated;
    });
  };

  const handleImageChange = (fieldName, e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert file to base64 data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [fieldName]: reader.result // Store base64 data URL
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      
      // Convert camelCase frontend fields to PascalCase backend fields
      const convertedData = {};
      
      // Field name mapping from frontend (camelCase) to backend (PascalCase)
      const fieldMapping = {
        'bankName': 'BankName',
        'loanAmount': 'LoanAmount',
        'nameOfvaluationAgency': 'NameofvaluationAgency',
        'dateOfTechnicalInitiation': 'DateofTechnicalInitiation',
        'applicantsName': 'ApplicantsNames',
        'dateOfSiteVisit': 'DateofSiteVisit',
        'requestFrom': 'Requestform',
        'dateOfReportRelease': 'DateofReportrelease',
        'proposalIdApplicationNo': 'ProposalIdApplicationNo',
        'transactionType': 'TransactionType',
        'branchNameId': 'BranchnameID',
        'requestedFrom': 'Requestfrom',
        'currentOwnerSellerName': 'NameofCurrentOwnerSeller',
        'personMetAtSiteName': 'NameofthePersonmetAtasite',
        'contactNoForPersonMet': 'ContactDetailsOfPersonmetAtsite',
        'addressAsPerTRF': 'AddressAsperTRF',
        'addressAsPerLegalDocuments': 'adressasperLegalDocuments',
        'addressAsPerActualSite': 'AddressasperActualAtsite',
        'statusHolding': 'StatusHolding',
        'deliveryAgency': 'DeleveryAgency',
        'typeOfProperty': 'TypeofProperty',
        'nameOfState': 'NameoftheState',
        'mainLocality': 'MainLocality',
        'subLocality': 'SubLocality',
        'streetOnWhichPropertyIsLocated': 'StreetonwhichPropertyislocated',
        'nearestLandmark': 'NearestLandmark',
        'pincode': 'Pincode',
        'occupationStatus': 'Occupationstatus',
        'localityZoningType': 'LocalityzoningtypeasperlatestDevelopmentMasterPlan',
        'propertyUsage': 'propertyUsage',
        'propertyIdentified': 'propertyidentified',
        'propertyDemarcatedSeparately': 'propertyDemarcatedSeperatly',
        'propertyIdentifiedThrough': 'propertyidentifiedThrough',
        'nameOfCityTownVillage': 'NameoftheCityTownVillage',
        'roofConstructionType': 'RoofConstructionType',
        'typeOfStructure': 'TypeofStructure',
        'numberOfFloorsInBuilding': 'NumberofFloorsintheBuilding',
        'locatedOnFloorNo': 'LocatedonfloorNo',
        'externalFinishing': 'ExternalFinishing',
        'internalFinishing': 'InternalFinishing',
        'typesOfFlooring': 'TypesofFlooring',
        'presentAgeOfBuilding': 'PresentAgeofBuilding',
        'futurePhysicalLife': 'FuturePhysicalLifeofPropertyinyrs',
        'latitude': 'Latitude',
        'longitude': 'Longitude',
        'infrastructureInArea': 'InfrastructureintheArea',
        'amenitiesInArea': 'AmenitiesintheArea',
        'classOfLocality': 'ClassofLocality',
        'typeOfRoad': 'TypeOfRoad',
        'widthOfRoad': 'WidthOfRoad',
        'electrification': 'ElectricficationElectricpole',
        'distanceFromBusStop': 'DistanceFromBusStopKM',
        'distanceFromRailwayStation': 'DistanceFromRailwayStationKM',
        'distanceFromMainMarket': 'DistanceFromMainMarketKM',
        'seismicZone': 'PropertyfallsunderSeismicZone',
        'floodZone': 'PropertyfallsunderFloodZone',
        'cycloneZone': 'PropertyfallsunderCycloneZone',
        'satelliteMap': 'Uploadphotosatelitemap',
        'hall': 'UploadphotoHall',
        'kitchen': 'UploadphotoKichen',
        'bedroom': 'UploadphotoBedroom',
        'otherRoom': 'UploadphotoOtherroom',
        'otherPhoto': 'UploadphotoOther',
        'externalPhoto': 'UploadphotoExternalPhoto',
        'frontSite': 'UploadphotoFrontSIte',
        'roadSite': 'UploadphotoRoadSIte',
        'selfieWithProperty': 'UploadphotoSelfiWithProperty',
        'selfieWithPerson': 'UploadphotoSelfiWithpersonAtProperty'
      };
      
      // Convert all fields
      for (const [frontendKey, backendKey] of Object.entries(fieldMapping)) {
        if (formData[frontendKey] !== undefined && formData[frontendKey] !== null && formData[frontendKey] !== '') {
          convertedData[backendKey] = formData[frontendKey];
        }
      }
      
      // Also include any fields that are already in PascalCase (from loaded data)
      for (const [key, value] of Object.entries(formData)) {
        if (!fieldMapping[key] && value !== undefined && value !== null && value !== '') {
          convertedData[key] = value;
        }
      }
      
      // Send all form data directly (model expects flat structure)
      const payload = {
        ...convertedData,
        status: 'draft'
      };

      console.log('=== SAVE DRAFT DEBUG ===');
      console.log('Form Data being saved:', formData);
      console.log('Converted payload being sent:', payload);
      console.log('Number of fields:', Object.keys(payload).length);

      let response;
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      if (savedFormId) {
        // Update existing draft
        response = await axios.put(
          `${API_BASE_URL}/ausmall-finance-form/${savedFormId}`,
          payload,
          { headers }
        );
        console.log('Update response:', response.data);
        setSaveMessage('Draft updated successfully!');
        alert('Draft updated successfully!');
      } else {
        // Create new draft
        response = await axios.post(
          `${API_BASE_URL}/ausmall-finance-form/create`,
          payload,
          { headers }
        );
        console.log('Create response:', response.data);
        setSavedFormId(response.data.data._id);
        setSaveMessage('Draft saved successfully! You can continue editing or submit when ready.');
        alert('Draft saved successfully! You can continue editing or submit when ready.');
      }

      // DO NOT navigate - stay on the form page so user can continue editing
    } catch (error) {
      console.error('Error saving draft:', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to save draft: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    console.log('=== FORM SUBMISSION STARTED ===');
    console.log('Current formData:', formData);
    console.log('Number of fields:', Object.keys(formData).length);
    
    try {
      // Convert camelCase frontend fields to PascalCase backend fields
      const convertedData = {};
      
      // Field name mapping from frontend (camelCase) to backend (PascalCase)
      const fieldMapping = {
        'bankName': 'BankName',
        'loanAmount': 'LoanAmount',
        'nameOfvaluationAgency': 'NameofvaluationAgency',
        'dateOfTechnicalInitiation': 'DateofTechnicalInitiation',
        'applicantsName': 'ApplicantsNames',
        'dateOfSiteVisit': 'DateofSiteVisit',
        'requestFrom': 'Requestform',
        'dateOfReportRelease': 'DateofReportrelease',
        'proposalIdApplicationNo': 'ProposalIdApplicationNo',
        'transactionType': 'TransactionType',
        'branchNameId': 'BranchnameID',
        'requestedFrom': 'Requestfrom',
        'currentOwnerSellerName': 'NameofCurrentOwnerSeller',
        'personMetAtSiteName': 'NameofthePersonmetAtasite',
        'contactNoForPersonMet': 'ContactDetailsOfPersonmetAtsite',
        'addressAsPerTRF': 'AddressAsperTRF',
        'addressAsPerLegalDocuments': 'adressasperLegalDocuments',
        'addressAsPerActualSite': 'AddressasperActualAtsite',
        'statusHolding': 'StatusHolding',
        'deliveryAgency': 'DeleveryAgency',
        'typeOfProperty': 'TypeofProperty',
        'nameOfState': 'NameoftheState',
        'mainLocality': 'MainLocality',
        'subLocality': 'SubLocality',
        'streetOnWhichPropertyIsLocated': 'StreetonwhichPropertyislocated',
        'nearestLandmark': 'NearestLandmark',
        'pincode': 'Pincode',
        'occupationStatus': 'Occupationstatus',
        'localityZoningType': 'LocalityzoningtypeasperlatestDevelopmentMasterPlan',
        'propertyUsage': 'propertyUsage',
        'propertyIdentified': 'propertyidentified',
        'propertyDemarcatedSeparately': 'propertyDemarcatedSeperatly',
        'propertyIdentifiedThrough': 'propertyidentifiedThrough',
        'nameOfCityTownVillage': 'NameoftheCityTownVillage',
        'roofConstructionType': 'RoofConstructionType',
        'typeOfStructure': 'TypeofStructure',
        'numberOfFloorsInBuilding': 'NumberofFloorsintheBuilding',
        'locatedOnFloorNo': 'LocatedonfloorNo',
        'externalFinishing': 'ExternalFinishing',
        'internalFinishing': 'InternalFinishing',
        'typesOfFlooring': 'TypesofFlooring',
        'presentAgeOfBuilding': 'PresentAgeofBuilding',
        'futurePhysicalLife': 'FuturePhysicalLifeofPropertyinyrs',
        'latitude': 'Latitude',
        'longitude': 'Longitude',
        'infrastructureInArea': 'InfrastructureintheArea',
        'amenitiesInArea': 'AmenitiesintheArea',
        'classOfLocality': 'ClassofLocality',
        'typeOfRoad': 'TypeOfRoad',
        'widthOfRoad': 'WidthOfRoad',
        'electrification': 'ElectricficationElectricpole',
        'distanceFromBusStop': 'DistanceFromBusStopKM',
        'distanceFromRailwayStation': 'DistanceFromRailwayStationKM',
        'distanceFromMainMarket': 'DistanceFromMainMarketKM',
        'seismicZone': 'PropertyfallsunderSeismicZone',
        'floodZone': 'PropertyfallsunderFloodZone',
        'cycloneZone': 'PropertyfallsunderCycloneZone',
        'satelliteMap': 'Uploadphotosatelitemap',
        'hall': 'UploadphotoHall',
        'kitchen': 'UploadphotoKichen',
        'bedroom': 'UploadphotoBedroom',
        'otherRoom': 'UploadphotoOtherroom',
        'otherPhoto': 'UploadphotoOther',
        'externalPhoto': 'UploadphotoExternalPhoto',
        'frontSite': 'UploadphotoFrontSIte',
        'roadSite': 'UploadphotoRoadSIte',
        'selfieWithProperty': 'UploadphotoSelfiWithProperty',
        'selfieWithPerson': 'UploadphotoSelfiWithpersonAtProperty'
      };
      
      // Convert all fields
      for (const [frontendKey, backendKey] of Object.entries(fieldMapping)) {
        if (formData[frontendKey] !== undefined && formData[frontendKey] !== null && formData[frontendKey] !== '') {
          convertedData[backendKey] = formData[frontendKey];
        }
      }
      
      // Also include any fields that are already in PascalCase (from loaded data)
      for (const [key, value] of Object.entries(formData)) {
        if (!fieldMapping[key] && value !== undefined && value !== null && value !== '') {
          convertedData[key] = value;
        }
      }
      
      // Update status to submitted and save to backend
      const payload = {
        ...convertedData,
        status: 'submitted'
      };

      console.log('Submitting form with status=submitted to backend...');
      
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      let response;
      if (savedFormId) {
        // Update existing form with submitted status
        response = await axios.put(
          `${API_BASE_URL}/ausmall-finance-form/${savedFormId}`,
          payload,
          { headers }
        );
        console.log('Form updated with submitted status:', response.data);
      } else {
        // Create new form with submitted status
        response = await axios.post(
          `${API_BASE_URL}/ausmall-finance-form/create`,
          payload,
          { headers }
        );
        console.log('Form created with submitted status:', response.data);
        setSavedFormId(response.data.data._id);
      }
      
      // Build report payload for final report page
      const reportPayload = buildReportPayload(formData);
      
      console.log('Form data prepared for final report');
      console.log('Navigating to final report...');
      
      // Show success notification
      alert('Form submitted successfully! Redirecting to final report...');
      
      // Determine which final report to navigate to based on current path
      let reportRoute = '/Jana-report'; // default
      const currentPath = location.pathname;
      
      if (currentPath.includes('Sundaram')) {
        reportRoute = '/Sundaram-report';
      } else if (currentPath.includes('Cholamandalam')) {
        reportRoute = '/Cholamandalam-report';
      } else if (currentPath.includes('Godrejcapital')) {
        reportRoute = '/Godrejcapital-report';
      } else if (currentPath.includes('LandTfinance')) {
        reportRoute = '/LandTfinance-report';
      } else if (currentPath.includes('UgroCapital')) {
        reportRoute = '/UgroCapital-report';
      } else if (currentPath.includes('Nido')) {
        reportRoute = '/Nido-report';
      } else if (currentPath.includes('Idfc')) {
        reportRoute = '/Idfc-report';
      } else if (currentPath.includes('YesBank')) {
        reportRoute = '/YesBank-report';
      } else if (currentPath.includes('JalgaonBank')) {
        reportRoute = '/JalgaonBank-report';
      } else if (currentPath.includes('MotilalOswalBank')) {
        reportRoute = '/MotilalOswalBank-report';
      } else if (currentPath.includes('StarHousing')) {
        reportRoute = '/StarHousing-report';
      } else if (currentPath.includes('CapitalIndia')) {
        reportRoute = '/CapitalIndia-report';
      } else if (currentPath.includes('SvatantraHousingFinanceCorporation')) {
        reportRoute = '/SvatantraHousingFinanceCorporation-report';
      } else if (currentPath.includes('CreditSaisitionIndia')) {
        reportRoute = '/CreditSaisitionIndia-report';
      } else if (currentPath.includes('Jana')) {
        reportRoute = '/Jana-report';
      } else if (currentPath.includes('ausmallfinance')) {
        reportRoute = '/ausmallfinance-report';
      }
      
      console.log('Navigating to:', reportRoute);
      
      // Navigate to appropriate final report with formData
      navigate(reportRoute, {
        state: {
          formData: reportPayload
        }
      });
      
    } catch (error) {
      console.error('Error submitting form:', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to submit form: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

 

  return (
    <div className={styles.container}>
      {/* Quick Access Navbar */}
      <nav className={styles.quickAccessNav}>
        <h3 className={styles.navTitle}>Quick Access Tools</h3>
        <div className={styles.quickAccessButtons}>
          <a
            href="https://mail.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.quickAccessBtn} ${styles.gmail}`}
            title="Open Gmail"
          >
            <span className={styles.btnIcon}>✉</span>
            <span>Gmail</span>
          </a>
          <a
            href="https://web.whatsapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.quickAccessBtn} ${styles.whatsapp}`}
            title="Open WhatsApp"
          >
            <span className={styles.btnIcon}>💬</span>
            <span>WhatsApp</span>
          </a>
          <a
            href="https://www.google.com/maps"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.quickAccessBtn} ${styles.maps}`}
            title="Open Google Maps"
          >
            <span className={styles.btnIcon}>📍</span>
            <span>Maps</span>
          </a>
          <a
            href="https://chat.openai.com"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.quickAccessBtn} ${styles.chatgpt}`}
            title="Open ChatGPT"
          >
            <span className={styles.btnIcon}>🤖</span>
            <span>ChatGPT</span>
          </a>
          <a
            href="https://eASR.igrmaharashtra.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.quickAccessBtn} ${styles.esar}`}
            title="Maharashtra eSAR Rates"
          >
            <span className={styles.btnIcon}>₹</span>
            <span>eSAR Rates</span>
          </a>
          <a
            href="https://maharera.maharashtra.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.quickAccessBtn} ${styles.maharera}`}
            title="MahaRERA Search Project"
          >
            <span className={styles.btnIcon}>🏗</span>
            <span>MahaRERA</span>
          </a>
          <button
            type="button"
            onClick={() => setShowCalculator(!showCalculator)}
            className={`${styles.quickAccessBtn} ${styles.calculator}`}
            title="Stage Calculator"
          >
            <span className={styles.btnIcon}>🧮</span>
            <span>Stage Calculator</span>
          </button>
        </div>
      </nav>

      {/* Stage Calculator Modal */}
      {showCalculator && (
        <div className={styles.calculatorModal}>
          <div className={styles.calculatorModalContent}>
            <button
              className={styles.closeCalculator}
              onClick={() => setShowCalculator(false)}
              type="button"
            >
              ✕
            </button>
            <StageCalculater />
          </div>
        </div>
      )}
      {/* Progress Bar */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressBarFill} 
            style={{ width: `${((currentPage - 1) / (totalPages - 1)) * 100}%` }}
          />
          {pageConfig.map((config) => (
            <div
              key={config.page}
              className={`${styles.progressStep} ${
                currentPage === config.page ? styles.active : ''
              } ${currentPage > config.page ? styles.completed : ''}`}
              onClick={() => handlePageClick(config.page)}
            >
              <div className={styles.stepCircle}>
                {currentPage > config.page ? '' : config.page}
              </div>
              <span className={styles.stepLabel}>{config.title}</span>
            </div>
          ))}
        </div>
      </div>

      


      <form className={styles.form} onSubmit={handleSubmit}>

        <h2 className={styles.pageTitle}>TECHNICAL VALUVATION REPORT</h2>

        {/* Page Content Wrapper */}
        <div className={styles.pageContent}>
          <h3 className={styles.pageTitle}>{pageConfig[currentPage - 1].title}</h3>

        {/* PAGE 1: General Information */}
        {currentPage === 1 && (
          <>
        <label htmlFor="bankName">Bank Name :</label><br></br>
        <input list="BankNameList" name='bankName' id="bankName" className={styles.input} value={formData.bankName || formData.BankName || ''} onChange={handleChange} />
        <datalist id="BankNameList">
          <option value="AU Small Finance Bank">AU Small Finance Bank</option>
          <option value="HDFC Bank">HDFC Bank</option>
          <option value="ICICI Bank">ICICI Bank</option>
          <option value="State Bank of India">State Bank of India</option>
          <option value="Axis Bank">Axis Bank</option>
          <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
          <option value="Yes Bank">Yes Bank</option>
          <option value="IDFC First Bank">IDFC First Bank</option>
          <option value="Other">Other</option>
        </datalist><br></br>

        <label htmlFor="loanAmount">Loan Amount (₹) :</label><br></br>
        <input type='number' name='loanAmount' id="loanAmount" className={styles.input} value={formData.loanAmount || formData.LoanAmount || ''} onChange={handleChange} placeholder="Enter loan amount"></input><br></br>

        <label htmlFor="nameOfvaluationAgency">Name of valuation Agency :</label><br></br>
        <input list="NameOfValuationAgency" name='nameOfvaluationAgency' id="nameOfvaluationAgency" className={styles.input} value={formData.nameOfvaluationAgency || formData.NameofvaluationAgency || ''} onChange={handleChange} />
        <datalist id="NameOfValuationAgency">
          <option value="Vishal">Vishal</option>
          <option value="Vivek">Vivek</option>
        </datalist><br></br>

        <label htmlFor='dateOfTechnicalInitiation'>Date of Technical Initiation :</label>
        <input type='text' name='dateOfTechnicalInitiation' id="dateOfTechnicalInitiation" className={styles.input} value={formData.dateOfTechnicalInitiation || formData.DateofTechnicalInitiation || ''} onChange={handleChange}></input><br></br>

        <label htmlFor='applicantsName'>Applicant/s Name/s :</label><br></br>
        <input type='text' name='applicantsName' id="applicantsName" className={styles.input} value={formData.applicantsName || formData.ApplicantsNames || ''} onChange={handleChange}></input><br></br>

        <label htmlFor='dateOfSiteVisit'>Date of Site Visit :</label><br></br>
        <input type='text' name='dateOfSiteVisit' id="dateOfSiteVisit" className={styles.input} value={formData.dateOfSiteVisit || formData.DateofSiteVisit || ''} onChange={handleChange}></input><br></br>

        <label htmlFor='requestFrom'>Request from :</label><br></br>
        <input type='text' name='requestFrom' id="requestFrom" className={styles.input} value={formData.requestFrom || formData.Requestform || ''} onChange={handleChange}></input><br></br>

        <label htmlFor='dateOfReportRelease'>Date of Report release :</label><br></br>
        <input type='text' name='dateOfReportRelease' id="dateOfReportRelease" className={styles.input} value={formData.dateOfReportRelease || formData.DateofReportrelease || ''} onChange={handleChange}></input><br></br>

        <label htmlFor="proposalIdApplicationNo">Proposal ID/Application No :</label><br></br>
        <input type='text' name='proposalIdApplicationNo' id="proposalIdApplicationNo" className={styles.input} value={formData.proposalIdApplicationNo || formData.ProposalIdApplicationNo || ''} onChange={handleChange}></input><br></br>

        <div>
          <label htmlFor="transactionType">Transaction type :</label> <br></br>
          <input
            type="text"
            name="transactionType"
            id="transactionType" className={styles.input}
            value={formData.transactionType || formData.TransactionType || ''}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="branchNameId">Branch name/ID :</label><br></br>
          <input
            type="text"
            name="branchNameId"
            id="branchNameId" className={styles.input}
            value={formData.branchNameId || formData.BranchnameID || ''}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="requestedFrom">Requested From :</label><br></br>
          <input
            type="text"
            name="requestedFrom"
            id="requestedFrom" className={styles.input}
            value={formData.requestedFrom || formData.Requestfrom || ''}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="currentOwnerSellerName">Name of Current Owner/Seller :</label><br></br>
          <input
            type="text"
            name="currentOwnerSellerName"
            id="currentOwnerSellerName" className={styles.input}
            value={formData.currentOwnerSellerName || formData.NameofCurrentOwnerSeller || ''}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="personMetAtSiteName">Name of the person met at a site :</label><br></br>
          <input
            type="text"
            name="personMetAtSiteName"
            id="personMetAtSiteName" className={styles.input}
            value={formData.personMetAtSiteName || formData.NameofthePersonmetAtasite || ''}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="contactNoForPersonMet">Contact No for person met at site :</label><br></br>
          <input
            type="number"
            name="contactNoForPersonMet"
            id="contactNoForPersonMet" className={styles.input}
            value={formData.contactNoForPersonMet || formData.ContactDetailsOfPersonmetAtsite || ''}
            onChange={handleChange}
          /><br></br>
        </div>
          </>
        )}

        {/* PAGE 2: Basic Details */}
        {currentPage === 2 && (
          <>

        <div><h3>BASIC DETAILS :</h3></div>
        <div><h4>Address of the property being appraised :</h4></div>

        <div>
          <label htmlFor="addressAsPerTRF">Address As per TRF :</label><br></br>
          <input
            type="text"
            name="addressAsPerTRF"
            id="addressAsPerTRF" className={styles.input}
            value={formData.addressAsPerTRF || formData.AddressAsperTRF || ''}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="addressAsPerLegalDocuments">Address as per Legal documents :</label><br></br>
          <input
            type="text"
            name="addressAsPerLegalDocuments"
            id="addressAsPerLegalDocuments" className={styles.input}
            value={formData.addressAsPerLegalDocuments || formData.adressasperLegalDocuments || ''}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="addressAsPerActualSite">Address as per actual at site :</label><br></br>
          <input
            type="text"
            name="addressAsPerActualSite"
            id="addressAsPerActualSite" className={styles.input}
            value={formData.addressAsPerActualSite || formData.AddressasperActualAtsite || ''}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="documentsProvided">Documents as Provided :</label><br></br>
          <input
            type="text"
            name="documentsProvided"
            id="documentsProvided" className={styles.input}
            value={formData.documentsProvided || ''}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="statusHolding">Status Holding :</label><br></br>
          <input
            list="StatusHolding"
            name="statusHolding"
            id="statusHolding" className={styles.input}
            value={formData.statusHolding || formData.StatusHolding || ''}
            onChange={handleChange}
          />
          <datalist id="StatusHolding">
            <option value="Free Hold" />
            <option value="Lease Holding" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="deliveryAgency">Delivery Agency :</label><br></br>
          <input
            type="text"
            name="deliveryAgency"
            id="deliveryAgency" className={styles.input}
            value={formData.deliveryAgency || formData.DeleveryAgency || ''}
            onChange={handleChange}
          /><br />
        </div>

        <div>
          <label htmlFor="typeOfProperty">Type of Property :</label><br></br>
          <input
            list="TypeOfProperty"
            name="typeOfProperty"
            id="typeOfProperty" className={styles.input}
            value={formData.typeOfProperty || formData.TypeofProperty || ''}
            onChange={handleChange}
          />
          <datalist id="TypeOfProperty">
            <option value="Flat" />
            <option value="Bungalow" />
            <option value="Row House" />
            <option value="Duplex" />
            <option value="Shop" />
            <option value="Godown" />
            <option value="Office" />
            <option value="Industrial" />
            <option value="Plot" />
            <option value="Under-Construction" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="stateName">Name of the state :</label><br></br>
          <input
            list="State"
            name="stateName"
            id="stateName" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="State">
            <option value="Maharashtra" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="mainLocality">Main Locality :</label><br></br>
          <input
            list="Locality"
            name="mainLocality"
            id="mainLocality" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="Locality">
            <option value="Nashik" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="subLocality">Sub-Locality :</label><br />
          <input
            list="SubLocality"
            name="subLocality"
            id="subLocality" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="SubLocality">
            <option value="Nashik" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="Streetonwhichpropertyislocated">Street on which property is located :</label><br></br>
          <input
            type="text"
            name="Streetonwhichpropertyislocated"
            id="Streetonwhichpropertyislocated" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="NearestLandmark">Nearest Landmark :</label><br></br>
          <input
            type="text"
            name="NearestLandmark"
            id="NearestLandmark" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="Pincode">Pincode :</label><br></br>
          <input
            type="number"
            name="Pincode"
            id="Pincode" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="OccupationStatus">Occupation Status :</label><br></br>
          <input
            list="OccupationStatusList"
            name="OccupationStatus"
            id="OccupationStatus" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="OccupationStatusList">
            <option value="Fully" />
            <option value="Partly" />
            <option value="Vacant" />
            <option value="Under-Construction" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="LocalityzoningtypeasperLatestDevelopmentMasterPlan">
            Locality/zoning type as per Latest Development Master Plan
          </label><br></br>
          <input
            list="LocalityZoningType"
            name="LocalityzoningtypeasperLatestDevelopmentMasterPlan"
            id="LocalityzoningtypeasperLatestDevelopmentMasterPlan" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="LocalityZoningType">
            <option value="Residential" />
            <option value="Industrial" />
            <option value="Commercial" />
            <option value="Agriculture" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="PropertyUsage">Property Usage</label><br></br>
          <input
            list="PropertyUsageList"
            name="PropertyUsage"
            id="PropertyUsage" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="PropertyUsageList">
            <option value="Residential" />
            <option value="Shop" />
            <option value="Gowdown" />
            <option value="Office" />
            <option value="Industrial" />
            <option value="Plot" />
            <option value="Commercial" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="PropertyIdentifiable">Property Identifiable :</label><br></br>
          <input
            list="PropertyIdentifiableList"
            name="PropertyIdentifiable"
            id="PropertyIdentifiable" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="PropertyIdentifiableList">
            <option value="Yes" />
            <option value="No" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="PropertyDemarcatedSeparatly">Property Demarcated Separatly :</label><br></br>
          <input
            list="PropertyDemarcatedSeparatlyList"
            name="PropertyDemarcatedSeparatly"
            id="PropertyDemarcatedSeparatly" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="PropertyDemarcatedSeparatlyList">
            <option value="Yes" />
            <option value="No" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="PropertyIdentifiedThrough">Property Identified through :</label><br></br>
          <input
            list="PropertyIdentifiedThroughList"
            name="PropertyIdentifiedThrough"
            id="PropertyIdentifiedThrough" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="PropertyIdentifiedThroughList">
            <option value="Person met at Site" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="CityTownVillage">Name of City/Town/Village :</label><br></br>
          <input
            type="text"
            name="CityTownVillage"
            id="CityTownVillage" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="RoofConstruction">Roof Construction :</label><br></br>
          <input
            list="RoofConstructionList"
            name="RoofConstruction"
            id="RoofConstruction" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="RoofConstructionList">
            <option value="RCC" />
            <option value="Load Bearing" />
            <option value="Under-Construction" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="TypeOfStructure">Type of Structure :</label><br></br>
          <input
            list="TypeOfStructureList"
            name="TypeOfStructure"
            id="TypeOfStructure" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="TypeOfStructureList">
            <option value="RCC" />
            <option value="Load Bearing" />
            <option value="Steel Structure with bricks wall And AC Sheet roofing" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="NoOfFloors">No.of Floors in the Building :</label><br></br>
          <input
            list="NoOfFloorsList"
            name="NoOfFloors"
            id="NoOfFloors" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="NoOfFloorsList">
            <option value="Ground + one" />
            <option value="Ground + two" />
            <option value="Ground + Three" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="LocatedOnFloor">Located on Floor No.:</label><br></br>
          <input
            type="number"
            name="LocatedOnFloor"
            id="LocatedOnFloor"
            className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="ExternalFinishing">External Finishing :</label><br></br>
          <input
            list="ExternalFinishingList"
            name="ExternalFinishing"
            id="ExternalFinishing" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="ExternalFinishingList">
            <option value="Average" />
            <option value="Fair" />
            <option value="Good" />
            <option value="Very Good" />
            <option value="Under-Construction" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="InternalFinishing">Internal Finishing :</label><br></br>
          <input
            list="InternalFinishingList"
            name="InternalFinishing"
            id="InternalFinishing" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="InternalFinishingList">
            <option value="Average" />
            <option value="Fair" />
            <option value="Good" />
            <option value="Very Good" />
            <option value="Under-Construction" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="TypesOfFlooring">Types of flooring :</label><br></br>
          <input
            list="TypesOfFlooringList"
            name="TypesOfFlooring"
            id="TypesOfFlooring" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="TypesOfFlooringList">
            <option value="Vitrified" />
            <option value="Granite" />
            <option value="Marble" />
            <option value="Italian Marble Flooring" />
            <option value="Mosaic tile" />
            <option value="Kota" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="PresentAge">Present Age of the property in yrs :</label><br></br>
          <input
            type="number"
            name="PresentAge"
            id="PresentAge" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="FuturePhysicalLife">Future Physical Life of property in yrs :</label><br></br>
          <input
            type="number"
            name="FuturePhysicalLife"
            id="FuturePhysicalLife" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="Latitude">Latitude :</label><br></br>
          <input
            type="text"
            name="Latitude"
            id="Latitude" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="Longitude">Longitude :</label><br></br>
          <input
            type="text"
            name="Longitude"
            id="Longitude" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="InfrastructureInArea">Infrastructure in the area :</label><br></br>
          <input
            list="InfrastructureInAreaList"
            name="InfrastructureInArea"
            id="InfrastructureInArea" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="InfrastructureInAreaList">
            <option value="Average" />
            <option value="Fair" />
            <option value="Good" />
            <option value="Very Good" />
            <option value="Under Developed" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="ClassOfLocality">Class of Locality :</label><br></br>
          <input
            list="ClassOfLocalityList"
            name="ClassOfLocality"
            id="ClassOfLocality" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="ClassOfLocalityList">
            <option value="High-end Class" />
            <option value="Upper-Mid-end Class" />
            <option value="Mid-end Class" />
            <option value="Lower Class" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="TypeOfRoad">Type of Road :</label><br></br>
          <input
            list="TypeOfRoadList"
            name="TypeOfRoad"
            id="TypeOfRoad" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="TypeOfRoadList">
            <option value="Cocreat" />
            <option value="Tar" />
            <option value="WBM" />
            <option value="Pandhan Road" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="WidthOfRoad">Width of Road(Fit) :</label><br></br>
          <input
            list="WidthOfRoadList"
            name="WidthOfRoad"
            id="WidthOfRoad" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="WidthOfRoadList">
            <option value="5 feet" />
            <option value="10 Feet" />
            <option value="15 fett" />
            <option value="20 feet" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="Propertyareaiscommunitydominatedaret">
            Property Area is community dominated are:
          </label><br />
          <input
            list="Propertyareaiscommunitydominatedaret"
            name="Propertyareaiscommunitydominatedaret"

            id="Propertyareaiscommunitydominatedaret" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="PropertyareaiscommunitydominatedaretList">
            <option value="Yes" />
            <option value="No" />
          </datalist><br />
        </div>

        <div>
          <label htmlFor="DistanceFromBusStop">Distance from Bus Stop(KM) :</label><br></br>
          <input
            type="text"
            name="DistanceFromBusStop"
            id="DistanceFromBusStop" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="DistanceFromMainMarket">Distance from Main Market(KM) :</label><br></br>
          <input
            type="text"
            name="DistanceFromMainMarket"
            id="DistanceFromMainMarket" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="DistanceFromRailwayStation">Distance from Railway Station(KM) :</label><br></br>
          <input
            type="text"
            name="DistanceFromRailwayStation"
            id="DistanceFromRailwayStation" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="PropertyFallsUnderSeismicZone">Property falls under Seismic Zone :</label><br></br>
          <input
            list="PropertyFallsUnderSeismicZoneList"
            name="PropertyFallsUnderSeismicZone"
            id="PropertyFallsUnderSeismicZone" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="PropertyFallsUnderSeismicZoneList">
            <option value="Zone III" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="PropertyFallsUnderFloodZone">Property falls Under Flood Zone :</label><br></br>
          <input
            list="PropertyFallsUnderFloodZoneList"
            name="PropertyFallsUnderFloodZone"
            id="PropertyFallsUnderFloodZone" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="PropertyFallsUnderFloodZoneList">
            <option value="Yes" />
            <option value="No" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="PropertyfallsunderfloodZone">Property falls under flood Zone :</label><br></br>
          <input
            list="PropertyfallsunderfloodZoneList"
            name="PropertyfallsunderfloodZone"
            id="PropertyfallsunderfloodZone" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="PropertyfallsunderfloodZoneList">
            <option value="Yes" />
            <option value="No" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="PropertyFallsUnderCycloneZone">Property falls under Cyclone Zone :</label><br></br>
          <input
            list="PropertyFallsUnderCycloneZoneList"
            name="PropertyFallsUnderCycloneZone"
            id="PropertyFallsUnderCycloneZone" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="PropertyFallsUnderCycloneZoneList">
            <option value="Yes" />
            <option value="No" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="PropertyFallsInCRZone">Property falls in CR Zone :</label><br></br>
          <input
            list="PropertyFallsInCRZoneList"
            name="PropertyFallsInCRZone"
            id="PropertyFallsInCRZone" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="PropertyFallsInCRZoneList">
            <option value="Yes" />
            <option value="No" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="DegreeOfRiskAssociated">Degree of Risk Associated :</label><br></br>
          <input
            list="DegreeOfRiskAssociatedList"
            name="DegreeOfRiskAssociated"
            id="DegreeOfRiskAssociated" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="DegreeOfRiskAssociatedList">
            <option value="Low" />
            <option value="High" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="AnyRiskOfDemolition">Any risk of Demolition :</label><br></br>
          <input
            list="AnyRiskOfDemolitionList"
            name="AnyRiskOfDemolition"
            id="AnyRiskOfDemolition" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="AnyRiskOfDemolitionList">
            <option value="Low" />
            <option value="High" />
          </datalist><br></br>
        </div>
          </>
        )}

        {/* PAGE 3: Boundaries */}
        {currentPage === 3 && (
          <>

        <div><h3>BOUNDARIES</h3></div>
        <div><h4>Boundaries of Building/Apartment :</h4></div>

        <div>
          <div><h4>As per Documents/Plan</h4></div>
          <label htmlFor="boundaryDocumentEast">East :</label><br></br>
          <input
            type="text"
            name="boundaryDocumentEast"
            id="boundaryDocumentEast" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="boundaryDocumentWest">West :</label><br></br>
          <input
            type="text"
            name="boundaryDocumentWest"
            id="boundaryDocumentWest" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="boundaryDocumentNorth">North :</label><br></br>
          <input
            type="text"
            name="boundaryDocumentNorth"
            id="boundaryDocumentNorth" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="boundaryDocumentSouth">South :</label><br></br>
          <input
            type="text"
            name="boundaryDocumentSouth"
            id="boundaryDocumentSouth" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <div><h4>Actual at site :</h4></div>
          <label htmlFor="boundaryActualSiteEast">East</label><br></br>
          <input
            type="text"
            name="boundaryActualSiteEast"
            id="boundaryActualSiteEast" className={styles.input}
            placeholder="East"
            onChange={handleChange}
          /><br></br>
          <label htmlFor="boundaryActualSiteWest">West :</label><br></br>
          <input
            type="text"
            name="boundaryActualSiteWest"
            id="boundaryActualSiteWest" className={styles.input}
            placeholder="West"
            onChange={handleChange}
          /><br></br>
          <label htmlFor="boundaryActualSiteNorth">North :</label><br></br>
          <input
            type="text"
            name="boundaryActualSiteNorth"
            id="boundaryActualSiteNorth" className={styles.input}
            placeholder="North"
            onChange={handleChange}
          /><br></br>
          <label htmlFor="boundaryActualSiteSouth">South :</label><br></br>
          <input
            type="text"
            name="boundaryActualSiteSouth"
            id="boundaryActualSiteSouth" className={styles.input}
            placeholder="South"
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="BoundariesMatching">Boundaries Matching :</label><br></br>
          <input
            list="BoundariesMatchingList"
            type="text"
            name="BoundariesMatching"
            id="BoundariesMatching" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="BoundariesMatchingList">
            <option value="Yes" />
            <option value="No" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="ReasonForNonMatching">If No, then reason thereon :</label><br></br>
          <input
            type="text"
            name="ReasonForNonMatching"
            id="ReasonForNonMatching" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div><h4>Plot dimension details (In Ft) for Independent Built up :</h4></div>

        <div>
          <label htmlFor="LegalAreaEast">Legal Area East :</label><br></br>
          <input
            type="text"
            name="LegalAreaEast"
            id="LegalAreaEast" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="LegalAreaWest">Legal Area West :</label><br></br>
          <input
            type="text"
            name="LegalAreaWest"
            id="LegalAreaWest" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="LegalAreaNorth">Legal Area North :</label><br></br>
          <input
            type="text"
            name="LegalAreaNorth"
            id="LegalAreaNorth" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="LegalAreaSouth">Legal Area South :</label><br></br>
          <input
            type="text"
            name="LegalAreaSouth"
            id="LegalAreaSouth" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="LegalTotalArea">Legal Total Area :</label><br></br>
          <input
            type="text"
            name="LegalTotalArea"
            id="LegalTotalArea" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="ActualAreaEast">Actual Area East :</label><br></br>
          <input
            type="text"
            name="ActualAreaEast"
            id="ActualAreaEast" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="ActualAreaWest">Actual Area West :</label><br></br>
          <input
            type="text"
            name="ActualAreaWest"
            id="ActualAreaWest" className={styles.input}
            placeholder="West"
            onChange={handleChange}
          /><br></br>
          <label htmlFor="ActualAreaNorth">Actual Area North :</label><br></br>
          <input
            type="text"
            name="ActualAreaNorth"
            id="ActualAreaNorth" className={styles.input}
            onChange={handleChange}
          /><br></br>

          <label htmlFor="ActualAreaSouth">Actual Area South :</label><br></br>
          <input
            type="text"
            name="ActualAreaSouth"
            id="ActualAreaSouth" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="ActualTotalArea">Actual Total Area :</label><br></br>
          <input
            type="text"
            name="ActualTotalArea"
            id="ActualTotalArea" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>
          </>
        )}

        {/* PAGE 4: Area & Accommodation Details */}
        {currentPage === 4 && (
          <>

        <div><h3>Area & Accommodation Details :</h3></div>

        <div>
          <label htmlFor="Floor">Floor :</label><br></br>
          <input
            type="text"
            name="Floor"
            id="Floor" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="Accommodation">Accommodation :</label><br></br>
          <input
            type="text"
            name="Accommodation"
            id="Accommodation" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="CarpetAreaSanctioned">Carpet Area in sq.ft.As per Sanctioned Plan :</label><br></br>
          <input
            type="text"
            name="CarpetAreaSanctioned"
            id="CarpetAreaSanctioned" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="CarpetAreaSite">Carpet Area in sq.ft.As per Site Measurements :</label><br></br>
          <input
            type="text"
            name="CarpetAreaSite"
            id="CarpetAreaSite" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="PermissibleArea">Permissible/plan Area in sq.ft. :</label><br></br>
          <input
            type="text"
            name="PermissibleArea"
            id="PermissibleArea" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="AdoptedArea">Adopted Area in sq.ft. :</label><br></br>
          <input
            type="text"
            name="AdoptedArea"
            id="AdoptedArea" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="FloorFirst">Floor :</label><br></br>
          <input
            type="text"
            name="Floor"
            id="FloorFirst" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="AccommodationFirst">Accommodation :</label><br></br>
          <input
            type="text"
            name="Accommodation"
            id="AccommodationFirst" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="CarpetAreaSanctionedFirst">Carpet Area in sq.ft.As per Sanctioned Plan :</label><br></br>
          <input
            type="text"
            name="CarpetAreaSanctioned"
            id="CarpetAreaSanctionedFirst" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="CarpetAreaSiteFirst">Carpet Area in sq.ft.As per Site Measurements :</label><br></br>
          <input
            type="text"
            name="CarpetAreaSite"
            id="CarpetAreaSiteFirst" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="PermissibleAreaFirst">Permissible/plan Area in sq.ft. :</label><br></br>
          <input
            type="text"
            name="PermissibleArea"
            id="PermissibleAreaFirst" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="AdoptedAreaFirst">Adopted Area in sq.ft. :</label><br></br>
          <input
            type="text"
            name="AdoptedArea"
            id="AdoptedAreaFirst" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="FloorSecond">Floor :</label><br></br>
          <input
            type="text"
            name="Floor"
            id="FloorSecond" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="AccommodationSecond">Accommodation :</label><br></br>
          <input
            type="text"
            name="Accommodation"
            id="AccommodationSecond" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="CarpetAreaSanctionedSecond">Carpet Area in sq.ft.As per Sanctioned Plan :</label><br></br>
          <input
            type="text"
            name="CarpetAreaSanctioned"
            id="CarpetAreaSanctionedSecond" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="CarpetAreaSiteSecond">Carpet Area in sq.ft.As per Site Measurements :</label><br></br>
          <input
            type="text"
            name="CarpetAreaSite"
            id="CarpetAreaSiteSecond" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="PermissibleAreaSecond">Permissible/plan Area in sq.ft. :</label><br></br>
          <input
            type="text"
            name="PermissibleArea"
            id="PermissibleAreaSecond" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="AdoptedAreaSecond">Adopted Area in sq.ft. :</label><br></br>
          <input
            type="text"
            name="AdoptedArea"
            id="AdoptedAreaSecond" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="FloorThird">Floor :</label><br></br>
          <input
            type="text"
            name="Floor"
            id="FloorThird" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="AccommodationThird">Accommodation :</label><br></br>
          <input
            type="text"
            name="Accommodation"
            id="AccommodationThird" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="CarpetAreaSanctionedThird">Carpet Area in sq.ft.As per Sanctioned Plan :</label><br></br>
          <input
            type="text"
            name="CarpetAreaSanctioned"
            id="CarpetAreaSanctionedThird" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="CarpetAreaSiteThird">Carpet Area in sq.ft.As per Site Measurements :</label><br></br>
          <input
            type="text"
            name="CarpetAreaSite"
            id="CarpetAreaSiteThird" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="PermissibleAreaThird">Permissible/plan Area in sq.ft. :</label><br></br>
          <input
            type="text"
            name="PermissibleArea"
            id="PermissibleAreaThird" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="AdoptedAreaThird">Adopted Area in sq.ft. :</label><br></br>
          <input
            type="text"
            name="AdoptedArea"
            id="AdoptedAreaThird" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="FloorFourth">Floor :</label><br></br>
          <input
            type="text"
            name="Floor"
            id="FloorFourth" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="AccommodationFourth">Accommodation :</label><br></br>
          <input
            type="text"
            name="Accommodation"
            id="AccommodationFourth" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="CarpetAreaSanctionedFourth">Carpet Area in sq.ft.As per Sanctioned Plan :</label><br></br>
          <input
            type="text"
            name="CarpetAreaSanctioned"
            id="CarpetAreaSanctionedFourth" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="CarpetAreaSiteFourth">Carpet Area in sq.ft.As per Site Measurements :</label><br></br>
          <input
            type="text"
            name="CarpetAreaSite"
            id="CarpetAreaSiteFourth" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="PermissibleAreaFourth">Permissible/plan Area in sq.ft. :</label><br></br>
          <input
            type="text"
            name="PermissibleArea"
            id="PermissibleAreaFourth" className={styles.input}
            onChange={handleChange}
          /><br></br>
          <label htmlFor="AdoptedAreaFourth">Adopted Area in sq.ft. :</label><br></br>
          <input
            type="text"
            name="AdoptedArea"
            id="AdoptedAreaFourth" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="TotalLoadingPercent">
            Total-Loading % on Carpet Area +Balcony Area+Dry Balconey :
          </label><br></br>
          <input
            type="text"
            name="Total-Loading%onCarpetArea+BalconyArea+DryBalconey"
            id="TotalLoadingPercent" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="TotalAreaWithLoading">Total Area with Loading (Sq/ft) :</label><br></br>
          <input
            type="text"
            name="TotalAreaWithLoading"
            id="TotalAreaWithLoading" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>
          </>
        )}

        {/* PAGE 5: Building Approvals & Related Documents */}
        {currentPage === 5 && (
          <>

        <div><h3>Building Approvals & Related Documents :</h3></div>

        <div>
          <label htmlFor="LayoutplanDetails">Layout plan Details :</label><br></br>
          <input
            type="text"
            name="LayoutplanDetails"
            id="LayoutplanDetails" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="BuildingSanctionApprovedPlanDetails">
            Building sanction/Approved Plan Details :
          </label><br></br>
          <input
            type="text"
            name="BuildingSanctionApprovedPlanDetails"
            id="BuildingSanctionApprovedPlanDetails" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="CommencementCertificate">Commencement Certificate :</label><br></br>
          <input
            type="text"
            name="CommencementCertificate"
            id="CommencementCertificate" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="CompletionCertificate">
            Completion Certificate/Occupation Certificate No./BCC Details :
          </label><br></br>
          <input
            type="text"
            name="CompletionCertificate"
            id="CompletionCertificate" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="OtherDocuments">Other Documents :</label><br></br>
          <input
            type="text"
            name="OtherDocuments"
            id="OtherDocuments" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="OwnershipDocuments">Ownership Documents :</label><br></br>
          <input
            type="text"
            name="OwnershipDocuments"
            id="OwnershipDocuments" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="PropertyOwner">Property Owner as per Document :</label><br></br>
          <input
            type="text"
            name="PropertyOwner"
            id="PropertyOwner" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="isthepropertywithinmunicipalLimit">
            is the property within municipal Limit :
          </label><br></br>
          <input
            list="MunicipalLimitList"
            name="isthepropertywithinmunicipalLimit"
            id="isthepropertywithinmunicipalLimit" className={styles.input}
            onChange={handleChange}
          />
          <datalist id="MunicipalLimitList">
            <option value="Yes" />
            <option value="No" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="IfPlansNotAvailable">
            if plans not available whether the structure confirming to the local byelaws :
          </label><br></br>
          <input
            type="text"
            name="IfPlansNotAvailable"
            id="IfPlansNotAvailable" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>
          </>
        )}

        {/* PAGE 6: Property Valuation (Independent House/Bungalow) */}
        {currentPage === 6 && (
          <>

        <div><h3>Property Valuation</h3></div>
        <div><h3>Valuation of independent House/Bungalow :</h3></div>

        <div>
          <label htmlFor="LandPlotArea">Land/plot Area :</label><br></br>
          <input
            type="text"
            name="LandPlotArea"
            id="LandPlotArea" className={styles.input}
            value={formData.LandPlotArea || ''}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="RateRangeofinthelocality">
            Rate Range of in the locality(RS per sq.ft.) :
          </label><br></br>
          <input
            type="text"
            name="RateRangeofinthelocality"
            id="RateRangeofinthelocality" className={styles.input}
            value={formData.RateRangeofinthelocality || ''}
            onChange={handleChange}
          /><br></br>
        </div>

       <div>
          <label htmlFor="RecommendedRate">Recommended Rate of Lade(per sq.ft.) :</label><br></br>
          <input
            type="text"
            name="RecommendedRate"
            id="RecommendedRate" className={styles.input}
            value={formData.RecommendedRate || ''}
            onChange={handleChange}
          /><br></br>
        </div>

         <div>
          <label htmlFor="SpecialAmenities">
            pls specify if any Special Amenities Provided :
          </label><br />
          <input
            type="text"
            name="SpecialAmenities"
            id="SpecialAmenities" className={styles.input}
            value={formData.SpecialAmenities || ''}
            onChange={handleChange}
          /><br></br>
        </div>
          
           <div>
          <label htmlFor="TotalLandValue">Total Land Value(in Rs) :</label><br></br>
          <input
            type="text"
            name="TotalLandValue"
            id="TotalLandValue" className={styles.input}
            value={formData.TotalLandValue || ''}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="AdoptableBuiltUpArea">Adoptable Built-up Area(in Sq.ft.) :</label><br></br>
          <input
            type="text"
            name="AdoptableBuiltUpArea"
            id="AdoptableBuiltUpArea" className={styles.input}
            value={formData.AdoptableBuiltUpArea || ''}
            onChange={handleChange}
          /><br></br>
        </div>

        

        <div>
          <label htmlFor="ConstructionCost">Construction Cost (per sq.ft.) :</label><br></br>
          <input
            type="text"
            name="ConstructionCost"
            id="ConstructionCost" className={styles.input}
            value={formData.ConstructionCost || ''}
            onChange={handleChange}
          /><br></br>
        </div>

        

        

       

        <div>
          <label htmlFor="AdditionalCosts">
            Additional Cost incurred for Amenities Charges(in Rs) :
          </label><br></br>
          <input
            type="text"
            name="AdditionalCosts"
            id="AdditionalCosts" className={styles.input}
            value={formData.AdditionalCosts || ''}
            onChange={handleChange}
          /><br></br>
        </div>

       

        <div>
          <label htmlFor="TotalFairMarketValues">
            Total fair Market Value at 100% completion(in Rs) :
          </label><br></br>
          <input
            type="text"
            name="TotalFairMarketValues"
            id="TotalFairMarketValues" className={styles.input}
            value={formData.TotalFairMarketValues || ''}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="TotalRealizableValue">
            Total Realizable Value on present completion stage(in Rs) :
          </label><br />
          <input
            type="text"
            name="TotalRealizableValue"
            id="TotalRealizableValue" className={styles.input}
            value={formData.TotalRealizableValue || ''}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="TotalForcedDistressedValue">
            Total Forced/Distressed Value at 100% completion(in Rs) :
          </label><br></br>
          <input
            type="text"
            name="TotalForcedDistressedValue"
            id="TotalForcedDistressedValue" className={styles.input}
            value={formData.TotalForcedDistressedValue || ''}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="TotalForcedDistressedValuePresent">
            Total Forced/Distressed Value on present completion stage(in Rs) :
          </label><br></br>
          <input
            type="text"
            name="TotalForcedDistressedValuePresent"
            id="TotalForcedDistressedValuePresent" className={styles.input}
            value={formData.TotalForcedDistressedValuePresent || ''}
            onChange={handleChange}
          /><br></br>
        </div>
          </>
        )}

        {/* PAGE 7: Valuation of flat/shop/office/industrial/other unit */}
        {currentPage === 7 && (
          <>

        <div><h3>Valuation of flat/shop/office/industrial/other unit etc :</h3></div>

        <div>
          <label htmlFor="SBUA">SBUA(SFT) :</label><br></br>
          <input
            type="text"
            name="SBUA"
            id="SBUA" className={styles.input}
            value={formData.SBUA || ''}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="AdoptedRate">Adopted rate(in per sq.ft) :</label><br></br>
          <input
            type="text"
            name="AdoptedRate"
            id="AdoptedRate" className={styles.input}
            value={formData.AdoptedRate || ''}
            onChange={handleChange}
          /><br></br>
        </div>
         
         <div>
          <label htmlFor="AdditionalCostSecond">
            Additional Cost incurred for amenities(in Rs) :
          </label><br></br>
          <input
            type="text"
            name="AdditionalsCost"
            id="AdditionalCostSecond"
            className={styles.input}
            value={formData.AdditionalsCost || ''}
            onChange={handleChange}
          /><br></br>
        </div>
    
          <div>
            <label htmlFor="TotalValue">Total Value of flat/shop/flat/office on 100% Complate(in Rs) :</label><br></br>
            <input
              type="text"
              name="TotalValue"
              id="TotalValue" className={styles.input}
              value={formData.TotalValue || ''}
              onChange={handleChange}
            /><br></br>
          </div>

          <div>
          <label htmlFor="TotalFairMarketValueSecond">
            Total fair Market Value at 100% completion (in Rs) :
          </label><br></br>
          <input
            type="text"
            name="TotalFairMarketValue"
            id="TotalFairMarketValueSecond"
            className={styles.input}
            value={formData.TotalFairMarketValue || ''}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="TotalRealizableValuePresentSecond">
           Total fair Market Value on present completion stage (in Rs) :
          </label><br></br>
          <input
            type="text"
            name="TotalRealizableValuePresent"
            id="TotalRealizableValuePresentSecond" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>
        

        <div>
          <label htmlFor="TotalRealizableValueFlat">
            Total Realizable Value at 100% completion(in Rs) :
          </label><br></br>
          <input
            type="text"
            name="TotalRealizableValue"
            id="TotalRealizableValueFlat" className={styles.input}
            value={formData.TotalRealizableValue || ''}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="TotalRealizableValuePresent">
            Total Realizable Value on present completion stage(in Rs) :
          </label><br></br>
          <input
            type="text"
            name="TotalRealizableValuePresent"
            id="TotalRealizableValuePresent" className={styles.input}
            value={formData.TotalRealizableValuePresent || ''}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="TotalForcedDistressedValueFlat">
            Total Forced/Distressed Value at 100% completion(in Rs) :
          </label><br></br>
          <input
            type="text"
            name="TotalForcedDistressedValue"
            id="TotalForcedDistressedValueFlat" className={styles.input}
            value={formData.TotalForcedDistressedValue || ''}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="TotalForcedDistressedValuePresentFlat">
            Total Forced/Distressed Value on present completion stage(in Rs) :
          </label><br></br>
          <input
            type="text"
            name="TotalForcedDistressedValuePresent"
            id="TotalForcedDistressedValuePresentFlat" className={styles.input}
            value={formData.TotalForcedDistressedValuePresent || ''}
            onChange={handleChange}
          /><br></br>
        </div>

          </>
        )}

        {/* PAGE 8: Stage of Construction */}
        {currentPage === 8 && (
          <>

        <div><h3>Stage of Construction :</h3></div>

        <div>
          <label htmlFor="PercentageCompletion">% Completion :</label><br></br>
          <input
            type="text"
            name="PercentageCompletion"
            id="PercentageCompletion" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="RecommendedConstructionValue">
            Recommended Construction Value :
          </label><br></br>
          <input
            type="text"
            name="RecommendedConstructionValue"
            id="RecommendedConstructionValue" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>
          </>
        )}

        {/* PAGE 9: Guideline & Distress/Forced sale Value */}
        {currentPage === 9 && (
          <>

        <div><h3>Guideline & Distress/Forced sale Value :</h3></div>

        <div>
          <label htmlFor="GovernmentGuidelineLand">
            government Guideline/ Circle rate for Land ( Rate in sq ft.only) :
          </label><br></br>
          <input
            type="text"
            name="GovernmentGuidelineLand"
            id="GovernmentGuidelineLand" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="LandValue">Land Value as per Goverment Rate(Rs) :</label><br></br>
          <input
            type="text"
            name="LandValue"
            id="LandValue" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="GovernmentGuidelineFlat">
            government Guideline/ Circle rate for flate/unit/Built Up(RS) ( Rate in sq ft.only) :
          </label><br></br>
          <input
            type="text"
            name="GovernmentGuidelineFlat"
            id="GovernmentGuidelineFlat" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="FlatValue">
            Flat/Unit/Built up Value as per Goverment Rate (Rs per sq.ft.) :
          </label><br></br>
          <input
            type="text"
            name="FlatValue"
            id="FlatValue" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="ForcedSaleValue">Forced Sale Value(In Rs) :</label><br></br>
          <input
            type="text"
            name="ForcedSaleValue"
            id="ForcedSaleValue" className={styles.input}
            value={formData.ForcedSaleValue || ''}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="AverageRental">Avg Rental per sqft(in Rs):</label><br></br>
          <input
            type="text"
            name="AverageRental"
            id="AverageRental" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>

        <div>
          <label htmlFor="RealizableValue">Realizable value(in Rs) :</label><br></br>
          <input
            type="text"
            name="RealizableValue"
            id="RealizableValue" className={styles.input}
            onChange={handleChange}
          /><br></br>
        </div>
          </>
        )}

        {/* PAGE 10: Remarks/Observations */}
        {currentPage === 10 && (
          <>

        <h3>Remarks/Observations</h3>

        <div>
          <label htmlFor="Remark1">Remark 1 :</label><br></br>
          <input
            type="text"
            id="Remark1"
            name="remark1"
            list="Remark1List"
            className={styles.input}
            onChange={handleChange}
          />
          <datalist id="Remark1List">
            <option value="Subjected property 2BHK Residential flat in floor No 2" />
            <option value="Address - " />
            <option value="Area consider-635.18 sq.ft.Carpet Area + 69sq.ft.Balcony Area +55 sq.ft.Dry Balconey,Total-Loding 35% On Carpet Area + Balconey Area + Dry Balcony=913sq.ft.SBUA" />
            <option value="Report released on the basis of Sale Deed Draft,Sanction Plan,index II,Commencement Certificate,Approvedn Drawing plan" />
            <option value="Unit number,Name plate and socity board is not displayed on site.Property is identified  through Person met at the site" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="Remark2">Remark 2 :</label><br></br>
          <input
            type="text"
            id="Remark2"
            name="remark2"
            list="Remark2List"
            className={styles.input}
            onChange={handleChange}
          />
          <datalist id="Remark2List">
            <option value="Subjected property 2BHK Residential flat in floor No 2" />
            <option value="Address - " />
            <option value="Area consider-635.18 sq.ft.Carpet Area + 69sq.ft.Balcony Area +55 sq.ft.Dry Balconey,Total-Loding 35% On Carpet Area + Balconey Area + Dry Balcony=913sq.ft.SBUA" />
            <option value="Report released on the basis of Sale Deed Draft,Sanction Plan,index II,Commencement Certificate,Approvedn Drawing plan" />
            <option value="Unit number,Name plate and socity board is not displayed on site.Property is identified  through Person met at the site" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="Remark3">Remark 3 :</label><br></br>
          <input
            type="text"
            id="Remark3"
            name="remark3"
            list="Remark3List"
            className={styles.input}
            onChange={handleChange}
          />
          <datalist id="Remark3List">
            <option value="Subjected property 2BHK Residential flat in floor No 2" />
            <option value="Address - " />
            <option value="Area consider-635.18 sq.ft.Carpet Area + 69sq.ft.Balcony Area +55 sq.ft.Dry Balconey,Total-Loding 35% On Carpet Area + Balconey Area + Dry Balcony=913sq.ft.SBUA" />
            <option value="Report released on the basis of Sale Deed Draft,Sanction Plan,index II,Commencement Certificate,Approvedn Drawing plan" />
            <option value="Unit number,Name plate and socity board is not displayed on site.Property is identified  through Person met at the site" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="Remark4">Remark 4 :</label><br></br>
          <input
            type="text"
            id="Remark4"
            name="remark4"
            list="Remark4List"
            className={styles.input}
            onChange={handleChange}
          />
          <datalist id="Remark4List">
            <option value="Subjected property 2BHK Residential flat in floor No 2" />
            <option value="Address - " />
            <option value="Area consider-635.18 sq.ft.Carpet Area + 69sq.ft.Balcony Area +55 sq.ft.Dry Balconey,Total-Loding 35% On Carpet Area + Balconey Area + Dry Balcony=913sq.ft.SBUA" />
            <option value="Report released on the basis of Sale Deed Draft,Sanction Plan,index II,Commencement Certificate,Approvedn Drawing plan" />
            <option value="Unit number,Name plate and socity board is not displayed on site.Property is identified  through Person met at the site" />
          </datalist><br></br>
        </div>

        <div>
          <label htmlFor="Remark5">Remark 5 :</label><br></br>
          <input
            type="text"
            id="Remark5"
            name="remark5"
            list="Remark5List"
            className={styles.input}
            onChange={handleChange}
          />
          <datalist id="Remark5List">
            <option value="Subjected property 2BHK Residential flat in floor No 2" />
            <option value="Address - " />
            <option value="Area consider-635.18 sq.ft.Carpet Area + 69sq.ft.Balcony Area +55 sq.ft.Dry Balconey,Total-Loding 35% On Carpet Area + Balconey Area + Dry Balcony=913sq.ft.SBUA" />
            <option value="Report released on the basis of Sale Deed Draft,Sanction Plan,index II,Commencement Certificate,Approvedn Drawing plan" />
            <option value="Unit number,Name plate and socity board is not displayed on site.Property is identified  through Person met at the site" />
          </datalist><br></br>
        </div>


          </>
        )}

        {/* PAGE 11: Declaration */}
        {currentPage === 11 && (
          <>

        <div><h3>Declaration :</h3></div>
        <p className={styles.prose}>i/We hereby declare that Our Representive Mr.Vishal Jadhav Physically Inspected the property.
          We have no direct or indirect interest in the unit valued.
          the information furnished above is true and correct to the best of our Knowledge and belif and takes into account information and our document submitted or shown to us by the client.the client is free to obtain other independant opninons on the same.
          No Responsibility Is taken for any False Statement,Misrepresentation or Submission Made in the Documents Submitted or for Fraudulent Documents Submitted bye the borrower/representative/developer/institute.
          Market Value/Fair Market Value is derived In this Report by considering All Attributes In the Locality Which adeversely affects the Markeability.
          of the property and value is Derived Basis on Banks/FI Policies and Norms.
          This report is released soley for intended Banks/FI,and the content of this report is confidential in the nature and for internal use only.The recipient of this report should not
          disclose this report to any external party and should be strictly used for lending/investing purposes.
          Legal aspects are beyond the scope of this valuation exercise.
          Valuation Approach:Market Approach of valuation has been adopted for finding out the fair market value of the subject property.
        </p>
        <h4>Disclaimer :</h4>
        <p className={styles.prose}>This report is prepared for based on the documents furnished and/or the condition of the property as prevailed at the time of our visit for NIDO Home Finance. The report provides an indicative market value of the property in our opinion which may not necessarily reflect the guideline value. Cost of construction is estimated based on our opinion on prevailing market rates at the time of our visit. Builtup area considered for valuation in this report at presumed FSI basis revised allowable FSI Limits considered by NIDO Home Finance. Quality of construction is assessed based on the visual and corroborative evidence obtained at site during our visit. Measurement of the property is made to the extent reasonably possible considering the limitations at site. This report does not certify the ownership of the property. The ownership details shall be referred from the legal due diligence report.
          Report isvalidfor 90 days from the date of visit or report.
        </p>
          </>
        )}

        {/* PAGE 12: Photo Uploads */}
        {currentPage === 12 && (
          <>
        <h3>Satellite Map :</h3>
        <label htmlFor="satelliteMap">Upload photo satelite map</label><br></br>
        <input
          type="file"
          id="satelliteMap" className={styles.fileInput}
          name="satelliteMap"
          accept="image/*"
          onChange={(e) => handleImageChange("satelliteMap", e)}
        />
        {formData.satelliteMap && (
          <div className={styles.imagePreview}>
            <img src={formData.satelliteMap} alt="Satellite Map Preview" className={styles.previewImage} />
          </div>
        )}
        <h4>PHOTOGRAPHS OF PROPERTY</h4>
        <label htmlFor="hall">Upload photo Hall</label><br></br>
        <input
          type="file"
          id="hall" className={styles.fileInput}
          name="hall"
          accept="image/*"
          onChange={(e) => handleImageChange("hall", e)}
        />
        {formData.hall && (
          <div className={styles.imagePreview}>
            <img src={formData.hall} alt="Hall Preview" className={styles.previewImage} />
          </div>
        )}
        <br></br>

        <label htmlFor="kitchen">Upload photo Kichen :</label><br></br>
        <input
          type="file"
          id="kitchen" className={styles.fileInput}
          name="kitchen"
          accept="image/*"
          onChange={(e) => handleImageChange("kitchen", e)}
        />
        {formData.kitchen && (
          <div className={styles.imagePreview}>
            <img src={formData.kitchen} alt="Kitchen Preview" className={styles.previewImage} />
          </div>
        )}
        <br></br>

        <label htmlFor="bedroom">Upload photo Bedroom :</label><br></br>
        <input
          type="file"
          id="bedroom" className={styles.fileInput}
          name="bedroom"
          accept="image/*"
          onChange={(e) => handleImageChange("bedroom", e)}
        />
        {formData.bedroom && (
          <div className={styles.imagePreview}>
            <img src={formData.bedroom} alt="Bedroom Preview" className={styles.previewImage} />
          </div>
        )}
        <br></br>

        <label htmlFor="otherRoom">Upload photo other room :</label><br></br>
        <input
          type="file"
          id="otherRoom" className={styles.fileInput}
          name="otherRoom"
          accept="image/*"
          onChange={(e) => handleImageChange("otherRoom", e)}
        />
        {formData.otherRoom && (
          <div className={styles.imagePreview}>
            <img src={formData.otherRoom} alt="Other Room Preview" className={styles.previewImage} />
          </div>
        )}
        <br></br>

        <label htmlFor="otherPhoto">Upload photo other photo :</label><br></br>
        <input
          type="file"
          id="otherPhoto" className={styles.fileInput}
          name="otherPhoto"
          accept="image/*"
          onChange={(e) => handleImageChange("otherPhoto", e)}
        />
        {formData.otherPhoto && (
          <div className={styles.imagePreview}>
            <img src={formData.otherPhoto} alt="Other Photo Preview" className={styles.previewImage} />
          </div>
        )}
        <br></br>

        <label htmlFor="externalPhoto">Upload photo external photo :</label><br></br>
        <input
          type="file"
          id="externalPhoto" className={styles.fileInput}
          name="externalPhoto"
          accept="image/*"
          onChange={(e) => handleImageChange("externalPhoto", e)}
        />
        {formData.externalPhoto && (
          <div className={styles.imagePreview}>
            <img src={formData.externalPhoto} alt="External Photo Preview" className={styles.previewImage} />
          </div>
        )}
        <br></br>

        <label htmlFor="frontSite">Upload photo front site :</label><br></br>
        <input
          type="file"
          id="frontSite" className={styles.fileInput}
          name="frontSite"
          accept="image/*"
          onChange={(e) => handleImageChange("frontSite", e)}
        />
        {formData.frontSite && (
          <div className={styles.imagePreview}>
            <img src={formData.frontSite} alt="Front Site Preview" className={styles.previewImage} />
          </div>
        )}
        <br></br>

        <label htmlFor="roadSite">Upload photo road site :</label><br></br>
        <input
          type="file"
          id="roadSite" className={styles.fileInput}
          name="roadSite"
          accept="image/*"
          onChange={(e) => handleImageChange("roadSite", e)}
        />
        {formData.roadSite && (
          <div className={styles.imagePreview}>
            <img src={formData.roadSite} alt="Road Site Preview" className={styles.previewImage} />
          </div>
        )}
        <br></br>

        <label htmlFor="selfieWithProperty">Upload photo selfie with property :</label><br></br>
        <input
          type="file"
          id="selfieWithProperty"
          name="selfieWithProperty"
          accept="image/*"
          className={styles.fileInput}
          onChange={(e) => handleImageChange("selfieWithProperty", e)}
        />
        {formData.selfieWithProperty && (
          <div className={styles.imagePreview}>
            <img src={formData.selfieWithProperty} alt="Selfie with Property Preview" className={styles.previewImage} />
          </div>
        )}
        <br></br>

        <label htmlFor="selfieWithPerson">Upload photo selfie with person met at property :</label><br></br>
        <input
          type="file"
          id="selfieWithPerson" className={styles.fileInput}
          name="selfieWithPerson"
          accept="image/*"
          onChange={(e) => handleImageChange("selfieWithPerson", e)}
        />
        {formData.selfieWithPerson && (
          <div className={styles.imagePreview}>
            <img src={formData.selfieWithPerson} alt="Selfie with Person Preview" className={styles.previewImage} />
          </div>
        )}
        <br></br>


          </>
        )}

        </div>
        {/* End of Page Content */}

        {/* Navigation Buttons */}
        <div className={styles.navigationButtons}>
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`${styles.navBtn} ${styles.prevBtn}`}
          >
            ← Previous
          </button>

          <div className={styles.submitRow}>
            <button
              type="button"
              className={styles.saveDraftBtn}
              onClick={handleSaveDraft}
              disabled={isSaving || isUploading}
            >
              {isSaving ? "Saving..." : "Save Draft"}
            </button>
            {currentPage === totalPages && (
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isUploading || isSaving}
              >
                {isUploading ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`${styles.navBtn} ${styles.nextBtn}`}
          >
            Next →
          </button>
        </div>

        {saveMessage && (
          <div className={styles.saveMessage}>
            {saveMessage}
          </div>
        )}

      </form>

    </div>
  )
}

