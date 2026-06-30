/**
 * Report Form Field Definitions
 * This file contains all form field configurations for the report creation and editing
 */

// Valuation Agency Options
export const valuationAgencyOptions = [
  { value: "Vishal", label: "Vishal" },
  { value: "Vivek", label: "Vivek" },
  { value: "Other", label: "Other" }
];

// Property Type Options
export const propertyTypes = [
  { value: "Flate", label: "Flat" },
  { value: "Bungalow", label: "Bungalow" },
  { value: "Row House", label: "Row House" },
  { value: "Duplex", label: "Duplex" },
  { value: "Shop", label: "Shop" },
  { value: "Godown", label: "Godown" },
  { value: "Office", label: "Office" },
  { value: "Industrial", label: "Industrial" },
  { value: "Plot", label: "Plot" },
  { value: "Under-Construction", label: "Under Construction" }
];

// Status Holding Options
export const statusHoldingOptions = [
  { value: "Lease Holding", label: "Lease Holding" },
  { value: "Free Holding", label: "Free Holding" }
];

// Occupation Status Options
export const occupationStatusOptions = [
  { value: "Self", label: "Self" },
  { value: "Seller", label: "Seller" },
  { value: "Relative", label: "Relative" },
  { value: "Vacant", label: "Vacant" },
  { value: "Tenat", label: "Tenant" },
  { value: "UnderConstruction", label: "Under Construction" }
];

// Locality Zoning Type Options
export const localityZoningOptions = [
  { value: "Residential", label: "Residential" },
  { value: "Commercial", label: "Commercial" },
  { value: "Industrial", label: "Industrial" },
  { value: "Agriculture", label: "Agriculture" }
];

// Property Demarcated Options
export const yesNoOptions = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" }
];

// Property Identified Through Options
export const propertyIdentifiedThroughOptions = [
  { value: "Person met at site", label: "Person met at site" }
];

// Roof Construction Type Options
export const roofConstructionTypes = [
  { value: "RCC", label: "RCC" },
  { value: "Load Bearing", label: "Load Bearing" },
  { value: "Steel Structure", label: "Steel Structure" },
  { value: "Wooden", label: "Wooden" },
  { value: "Other", label: "Other" }
];

// Type of Structure Options
export const structureTypes = [
  { value: "Residential", label: "Residential" },
  { value: "Commercial", label: "Commercial" },
  { value: "Industrial", label: "Industrial" },
  { value: "Agricultural", label: "Agricultural" },
  { value: "Mixed Use", label: "Mixed Use" },
  { value: "Other", label: "Other" }
];

// Finishing Quality Options
export const finishingQualityOptions = [
  { value: "Very Good", label: "Very Good" },
  { value: "Good", label: "Good" },
  { value: "Average", label: "Average" },
  { value: "Poor", label: "Poor" }
];

// Types of Flooring Options
export const flooringTypes = [
  { value: "Vitrified Tiles", label: "Vitrified Tiles" },
  { value: "Ceramic Tiles", label: "Ceramic Tiles" },
  { value: "Marble", label: "Marble" },
  { value: "Granite", label: "Granite" },
  { value: "Wooden Flooring", label: "Wooden Flooring" },
  { value: "Other", label: "Other" }
];

// Infrastructure/Amenities Quality Options
export const qualityOptions = [
  { value: "Good", label: "Good" },
  { value: "Average", label: "Average" },
  { value: "Poor", label: "Poor" }
];

// Class of Locality Options
export const localityClassOptions = [
  { value: "High-end", label: "High-end" },
  { value: "Upper-Middle", label: "Upper-Middle" },
  { value: "Middle-end", label: "Middle-end" },
  { value: "Lower-end", label: "Lower-end" },
  { value: "Slum", label: "Slum" }
];

// Type of Road Options
export const roadTypes = [
  { value: "Tar", label: "Tar" },
  { value: "Concrete", label: "Concrete" },
  { value: "WBM", label: "WBM" },
  { value: "Pandhan Road", label: "Pandhan Road" },
  { value: "Kutcha Road", label: "Kutcha Road" }
];

// Width of Road Options
export const roadWidthOptions = [
  { value: "5feet", label: "5 feet" },
  { value: "10feet", label: "10 feet" },
  { value: "15feet", label: "15 feet" },
  { value: "20feet", label: "20 feet" },
  { value: "25feet", label: "25 feet" },
  { value: "30feet", label: "30 feet" },
  { value: "35feet", label: "35 feet" },
  { value: "40feet", label: "40 feet" },
  { value: "45feet", label: "45 feet" },
  { value: "50feet", label: "50 feet" }
];

// Seismic Zone Options
export const seismicZoneOptions = [
  { value: "Zone II", label: "Zone II" },
  { value: "Zone III", label: "Zone III" },
  { value: "Zone IV", label: "Zone IV" },
  { value: "Zone V", label: "Zone V" }
];

// Risk Level Options
export const riskLevelOptions = [
  { value: "Low", label: "Low" },
  { value: "Moderate", label: "Moderate" },
  { value: "High", label: "High" }
];

// Floor Accommodation Options
export const floorAccommodationOptions = [
  { value: "Residential", label: "Residential" },
  { value: "Commercial", label: "Commercial" },
  { value: "Industrial", label: "Industrial" },
  { value: "Agricultural", label: "Agricultural" },
  { value: "Mixed Use", label: "Mixed Use" },
  { value: "Other", label: "Other" }
];

// User Role Options
export const userRoles = [
  { value: "evaluator", label: "Evaluator/Valuer" },
  { value: "technician", label: "Office Engineer/Technician" },
  { value: "sideengineer", label: "Site Engineer" },
  { value: "valuer", label: "Valuer" }
];

// Workflow Status Options
export const workflowStatusOptions = [
  { value: "draft", label: "Draft" },
  { value: "office_engineer_pending", label: "Office Engineer Pending" },
  { value: "site_engineer_pending", label: "Site Engineer Pending" },
  { value: "valuer_pending", label: "Valuer Pending" },
  { value: "completed", label: "Completed" }
];

// Form Sections Configuration
export const formSections = {
  basicInfo: {
    title: "Basic Information",
    fields: [
      { name: "taskTitle", label: "Task Title", type: "text", required: true },
      { name: "officeInstructions", label: "Office Instructions", type: "textarea" },
      { name: "assignedTo", label: "Assigned To", type: "select", options: userRoles, required: true },
      { name: "NameofvaluationAgency", label: "Name of valuation Agency", type: "datalist", options: valuationAgencyOptions },
      { name: "DateofTechnicalInitiation", label: "Date of Technical Initiation", type: "date" },
      { name: "ApplicantsNames", label: "Applicant's Names", type: "text" },
      { name: "DateofSiteVisit", label: "Date of Site Visit", type: "date" },
      { name: "Requestform", label: "Request Form", type: "text" },
      { name: "DateofReportrelease", label: "Date of Report Release", type: "date" },
      { name: "ProposalIdApplicationNo", label: "Proposal ID/Application No", type: "text" },
      { name: "TransactionType", label: "Transaction Type", type: "text" },
      { name: "BranchnameID", label: "Branch Name/ID", type: "text" },
      { name: "Requestfrom", label: "Request From", type: "text" },
      { name: "NameofCurrentOwnerSeller", label: "Name of Current Owner/Seller", type: "text" },
      { name: "NameofthePersonmetAtasite", label: "Name of Person met at Site", type: "text" },
      { name: "ContactDetailsOfPersonmetAtsite", label: "Contact Details of Person met at Site", type: "text" }
    ]
  },
  
  propertyDetails: {
    title: "Property Details",
    fields: [
      { name: "TypeofProperty", label: "Type of Property", type: "select", options: propertyTypes },
      { name: "propertyUsage", label: "Property Usage", type: "text" },
      { name: "StatusHolding", label: "Status Holding", type: "select", options: statusHoldingOptions },
      { name: "Occupationstatus", label: "Occupation Status", type: "select", options: occupationStatusOptions }
    ]
  },
  
  locationDetails: {
    title: "Location Details",
    fields: [
      { name: "AddressAsperTRF", label: "Address as per TRF", type: "textarea" },
      { name: "adressasperLegalDocuments", label: "Address as per Legal Documents", type: "textarea" },
      { name: "AddressasperActualAtsite", label: "Address as per Actual Site", type: "textarea" },
      { name: "NameoftheState", label: "State", type: "text" },
      { name: "MainLocality", label: "Main Locality", type: "text" },
      { name: "SubLocality", label: "Sub Locality", type: "text" },
      { name: "Pincode", label: "Pincode", type: "text" },
      { name: "Latitude", label: "Latitude", type: "number" },
      { name: "Longitude", label: "Longitude", type: "number" }
    ]
  },
  
  constructionDetails: {
    title: "Construction Details",
    fields: [
      { name: "RoofConstructionType", label: "Roof Construction Type", type: "select", options: roofConstructionTypes },
      { name: "TypeofStructure", label: "Type of Structure", type: "select", options: structureTypes },
      { name: "NumberofFloorsintheBuilding", label: "Number of Floors", type: "number" },
      { name: "LocatedonfloorNo", label: "Located on Floor No", type: "number" },
      { name: "ExternalFinishing", label: "External Finishing", type: "select", options: finishingQualityOptions },
      { name: "InternalFinishing", label: "Internal Finishing", type: "select", options: finishingQualityOptions },
      { name: "TypesofFlooring", label: "Types of Flooring", type: "select", options: flooringTypes },
      { name: "PresentAgeofBuilding", label: "Present Age of Building (years)", type: "number" },
      { name: "FuturePhysicalLifeofPropertyinyrs", label: "Future Physical Life (years)", type: "number" }
    ]
  },
  
  areaDetails: {
    title: "Area & Infrastructure",
    fields: [
      { name: "InfrastructureintheArea", label: "Infrastructure in Area", type: "select", options: qualityOptions },
      { name: "AmenitiesintheArea", label: "Amenities in Area", type: "select", options: qualityOptions },
      { name: "ClassofLocality", label: "Class of Locality", type: "select", options: localityClassOptions },
      { name: "TypeOfRoad", label: "Type of Road", type: "select", options: roadTypes },
      { name: "WidthOfRoad", label: "Width of Road", type: "select", options: roadWidthOptions }
    ]
  },
  
  valuationDetails: {
    title: "Valuation Details",
    fields: [
      { name: "LandPlotAreainSqft", label: "Land/Plot Area (Sq.ft)", type: "text" },
      { name: "AdoptableBuiltUpAreaInSqft", label: "Adoptable Built-up Area (Sq.ft)", type: "text" },
      { name: "RateRangeofinthelocalityperSqft", label: "Rate Range per Sq.ft", type: "text" },
      { name: "ConstructionCostperSqft", label: "Construction Cost per Sq.ft", type: "text" },
      { name: "RecommendedRateofLandperSqft", label: "Recommended Rate of Land per Sq.ft", type: "text" }
    ]
  }
};

// Initial Form Values
export const initialFormValues = {
  taskTitle: "",
  officeInstructions: "",
  assignedTo: "technician",
  NameofvaluationAgency: "",
  DateofTechnicalInitiation: "",
  ApplicantsNames: "",
  DateofSiteVisit: "",
  Requestform: "",
  DateofReportrelease: "",
  ProposalIdApplicationNo: "",
  TransactionType: "",
  BranchnameID: "",
  Requestfrom: "",
  NameofCurrentOwnerSeller: "",
  NameofthePersonmetAtasite: "",
  ContactDetailsOfPersonmetAtsite: "",
  TypeofProperty: "",
  propertyUsage: "",
  StatusHolding: "Free Holding",
  Occupationstatus: "Self",
  AddressAsperTRF: "",
  adressasperLegalDocuments: "",
  AddressasperActualAtsite: "",
  NameoftheState: "",
  MainLocality: "",
  SubLocality: "",
  Pincode: "",
  Latitude: 0,
  Longitude: 0,
  RoofConstructionType: "RCC",
  TypeofStructure: "Residential",
  NumberofFloorsintheBuilding: 1,
  LocatedonfloorNo: 1,
  ExternalFinishing: "Good",
  InternalFinishing: "Good",
  TypesofFlooring: "Vitrified Tiles",
  PresentAgeofBuilding: 0,
  FuturePhysicalLifeofPropertyinyrs: 0,
  InfrastructureintheArea: "Good",
  AmenitiesintheArea: "Good",
  ClassofLocality: "Middle-end",
  TypeOfRoad: "Tar",
  WidthOfRoad: "5feet",
  LandPlotAreainSqft: "0",
  AdoptableBuiltUpAreaInSqft: "0",
  RateRangeofinthelocalityperSqft: "0",
  ConstructionCostperSqft: "0",
  RecommendedRateofLandperSqft: "0"
};

// Validation Rules
export const validationRules = {
  taskTitle: {
    required: true,
    minLength: 3,
    maxLength: 200
  },
  assignedTo: {
    required: true
  },
  Pincode: {
    pattern: /^\d{6}$/,
    message: "Pincode must be 6 digits"
  },
  NumberofFloorsintheBuilding: {
    min: 0,
    max: 100
  },
  LocatedonfloorNo: {
    min: 0,
    max: 100
  },
  PresentAgeofBuilding: {
    min: 0,
    max: 60
  },
  FuturePhysicalLifeofPropertyinyrs: {
    min: 0,
    max: 60
  }
};

export default {
  valuationAgencyOptions,
  propertyTypes,
  statusHoldingOptions,
  occupationStatusOptions,
  localityZoningOptions,
  yesNoOptions,
  propertyIdentifiedThroughOptions,
  roofConstructionTypes,
  structureTypes,
  finishingQualityOptions,
  flooringTypes,
  qualityOptions,
  localityClassOptions,
  roadTypes,
  roadWidthOptions,
  seismicZoneOptions,
  riskLevelOptions,
  floorAccommodationOptions,
  userRoles,
  workflowStatusOptions,
  formSections,
  initialFormValues,
  validationRules
};

// Made with Bob
