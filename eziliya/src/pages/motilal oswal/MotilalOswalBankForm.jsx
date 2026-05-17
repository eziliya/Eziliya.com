import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import styles from './MotilalOswalBankForm.module.css'

export default function MotilalOswalBankForm() {
  const [formData, setFormData] = useState({})
  const [isUploading, setIsUploading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleImageChange = (fieldName, e) => {
    const file = e.target.files[0]
    if (file) {
      // Convert file to base64 data URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          [fieldName]: reader.result, // Store base64 data URL
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const buildReportPayload = (data) => {
    const out = {}
    for (const [k, v] of Object.entries(data)) {
      // Pass through all values including base64 data URLs
      if (v != null && v !== '') {
        out[k] = v
      }
    }

    const copyIf = (from, to) => {
      if (out[from] != null && out[from] !== '') out[to] = out[from]
    }

    copyIf('RateRangeofinthelocality', 'RateRangeofinthelocality(RSpersq.ft.)')
    copyIf(
      'LocalityzoningtypeasperLatestDevelopmentMasterPlan',
      'Locality/zoning typeasperLatestDevelopmentMasterPlan'
    )
    copyIf(
      'Total-Loading%onCarpetArea+BalconyArea+DryBalconey',
      'Total-Loading%onCarpetArea+BalconyArea+DryBalconey'
    )

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
    }
    for (const [from, to] of Object.entries(fileToReport)) {
      copyIf(from, to)
    }

    return out
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsUploading(true)
    
    const reportPayload = buildReportPayload(formData)
    navigate('/MotilalOswalBank-report', { state: { formData: reportPayload } })

    const formDataToSend = new FormData()
    for (const key in formData) {
      if (formData[key] instanceof File) {
        formDataToSend.append(key, formData[key])
      } else {
        formDataToSend.append(key, formData[key])
      }
    }

    try {
      const response = await axios.post('http://localhost:3000/api/reports', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      console.log('Form submitted successfully:', response.data)
      toast.success('Form submitted successfully!')
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error('Error submitting form. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
     <div className={styles.container}>
       <form className={styles.form} onSubmit={handleSubmit}>
 
         <h2 className={styles.pageTitle}>TECHNICAL VALUVATION REPORT</h2>
 
         <label htmlFor="nameOfvaluationAgency">Name of valuation Agency :</label><br></br>
         <input list="NameOfValuationAgency" name='nameOfvaluationAgency' id="nameOfvaluationAgency" className={styles.input} onChange={handleChange} />
         <datalist id="NameOfValuationAgency">
           <option value="Vishal">Vishal</option>
           <option value="Vivek">Vivek</option>
         </datalist><br></br>
 
         <label htmlFor='dateOfTechnicalInitiation'>Date of Technical Initiation :</label>
         <input type='text' name='dateOfTechnicalInitiation' id="dateOfTechnicalInitiation" className={styles.input} onChange={handleChange}></input><br></br>
 
         <label htmlFor='applicantsName'>Applicant/s Name/s :</label><br></br>
         <input type='text' name='applicantsName' id="applicantsName" className={styles.input} onChange={handleChange}></input><br></br>
 
         <label htmlFor='dateOfSiteVisit'>Date of Site Visit :</label><br></br>
         <input type='text' name='dateOfSiteVisit' id="dateOfSiteVisit" className={styles.input} onChange={handleChange}></input><br></br>
 
         <label htmlFor='requestFrom'>Request from :</label><br></br>
         <input type='text' name='requestFrom' id="requestFrom" className={styles.input} onChange={handleChange}></input><br></br>
 
         <label htmlFor='dateOfReportRelease'>Date of Report release :</label><br></br>
         <input type='text' name='dateOfReportRelease' id="dateOfReportRelease" className={styles.input} onChange={handleChange}></input><br></br>
 
         <label htmlFor="proposalIdApplicationNo">Proposal ID/Application No :</label><br></br>
         <input type='text' name='proposalIdApplicationNo' id="proposalIdApplicationNo" className={styles.input} onChange={handleChange}></input><br></br>
 
         <div>
           <label htmlFor="transactionType">Transaction type :</label> <br></br>
           <input
             type="text"
             name="transactionType"
             id="transactionType" className={styles.input}
             onChange={handleChange}
           /><br></br>
         </div>
 
         <div>
           <label htmlFor="branchNameId">Branch name/ID :</label><br></br>
           <input
             type="text"
             name="branchNameId"
             id="branchNameId" className={styles.input}
             onChange={handleChange}
           /><br></br>
           <label htmlFor="requestedFrom">Requested From :</label><br></br>
           <input
             type="text"
             name="requestedFrom"
             id="requestedFrom" className={styles.input}
             onChange={handleChange}
           /><br></br>
         </div>
 
         <div>
           <label htmlFor="currentOwnerSellerName">Name of Current Owner/Seller :</label><br></br>
           <input
             type="text"
             name="currentOwnerSellerName"
             id="currentOwnerSellerName" className={styles.input}
             onChange={handleChange}
           /><br></br>
           <label htmlFor="personMetAtSiteName">Name of the person met at a site :</label><br></br>
           <input
             type="text"
             name="personMetAtSiteName"
             id="personMetAtSiteName" className={styles.input}
             onChange={handleChange}
           /><br></br>
         </div>
 
         <div>
           <label htmlFor="contactNoForPersonMet">Contact No for person met at site :</label><br></br>
           <input
             type="number"
             name="contactNoForPersonMet"
             id="contactNoForPersonMet" className={styles.input}
             onChange={handleChange}
           /><br></br>
         </div>
 
         <div><h3>BASIC DETAILS :</h3></div>
         <div><h4>Address of the property being appraised :</h4></div>
 
         <div>
           <label htmlFor="addressAsPerTRF">Address As per TRF :</label><br></br>
           <input
             type="text"
             name="addressAsPerTRF"
             id="addressAsPerTRF" className={styles.input}
             onChange={handleChange}
           /><br></br>
         </div>
 
         <div>
           <label htmlFor="addressAsPerLegalDocuments">Address as per Legal documents :</label><br></br>
           <input
             type="text"
             name="addressAsPerLegalDocuments"
             id="addressAsPerLegalDocuments" className={styles.input}
             onChange={handleChange}
           /><br></br>
         </div>
 
         <div>
           <label htmlFor="addressAsPerActualSite">Address as per actual at site :</label><br></br>
           <input
             type="text"
             name="addressAsPerActualSite"
             id="addressAsPerActualSite" className={styles.input}
             onChange={handleChange}
           /><br></br>
         </div>
 
         <div>
           <label htmlFor="documentsProvided">Documents as Provided :</label><br></br>
           <input
             type="text"
             name="documentsProvided"
             id="documentsProvided" className={styles.input}
             onChange={handleChange}
           /><br></br>
         </div>
 
         <div>
           <label htmlFor="statusHolding">Status Holding :</label><br></br>
           <input
             list="StatusHolding"
             name="statusHolding"
             id="statusHolding" className={styles.input}
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
             onChange={handleChange}
           /><br />
         </div>
 
         <div>
           <label htmlFor="typeOfProperty">Type of Property :</label><br></br>
           <input
             list="TypeOfProperty"
             name="typeOfProperty"
             id="typeOfProperty" className={styles.input}
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
           <label htmlFor="ElectrificationElectricPolesObserved">
             Electrification/Electric poles observed :
           </label><br />
           <input
             list="ElectrificationElectricPolesObservedList"
             name="ElectrificationElectricPolesObserved"
             id="ElectrificationElectricPolesObserved" className={styles.input}
             onChange={handleChange}
           />
           <datalist id="ElectrificationElectricPolesObservedList">
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
 
         <div><h3>Property Valuation</h3></div>
         <div><h3>Valuation of independent House/Bungalow :</h3></div>
 
         <div>
           <label htmlFor="LandPlotArea">Land/plot Area :</label><br></br>
           <input
             type="text"
             name="LandPlotArea"
             id="LandPlotArea" className={styles.input}
             onChange={handleChange}
           /><br></br>
         </div>
 
         <div>
           <label htmlFor="AdoptableBuiltUpArea">Adoptable Built-up Area(in Sq.ft.) :</label><br></br>
           <input
             type="text"
             name="AdoptableBuiltUpArea"
             id="AdoptableBuiltUpArea" className={styles.input}
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
             onChange={handleChange}
           /><br></br>
         </div>
 
         <div>
           <label htmlFor="ConstructionCost">Construction Cost (per sq.ft.) :</label><br></br>
           <input
             type="text"
             name="ConstructionCost"
             id="ConstructionCost" className={styles.input}
             onChange={handleChange}
           /><br></br>
         </div>
 
         <div>
           <label htmlFor="RecommendedRate">Recommended Rate of Lade(per sq.ft.) :</label><br></br>
           <input
             type="text"
             name="RecommendedRate"
             id="RecommendedRate" className={styles.input}
             onChange={handleChange}
           /><br></br>
         </div>
 
         <div>
           <label htmlFor="TotalConstructionValue">
             Total Construction Value at Present Construction stage(in RS) :
           </label><br></br>
           <input
             type="text"
             name="TotalConstructionValue"
             id="TotalConstructionValue" className={styles.input}
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
             onChange={handleChange}
           /><br></br>
         </div>
 
         <div>
           <label htmlFor="AdditionalCost">
             Additional Cost incurred for Amenities Charges(in Rs) :
           </label><br></br>
           <input
             type="text"
             name="AdditionalCost"
             id="AdditionalCost" className={styles.input}
             onChange={handleChange}
           /><br></br>
         </div>
  
         <div>
           <label htmlFor="TotalLandValue">Total Land Value(in Rs) :</label><br></br>
           <input
             type="text"
             name="TotalLandValue"
             id="TotalLandValue" className={styles.input}
             onChange={handleChange}
           /><br></br>
         </div>
 
         <div>
           <label htmlFor="TotalFairMarketValue">
             Total fair Market Value at 100% completion(in Rs) :
           </label><br></br>
           <input
             type="text"
             name="TotalFairMarketValue"
             id="TotalFairMarketValue" className={styles.input}
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
             onChange={handleChange}
           /><br></br>
         </div>
 
         <div><h3>Valuation of flat/shop/office/industrial/other unit etc :</h3></div>
 
         <div>
           <label htmlFor="SBUA">SBUA(SFT) :</label><br></br>
           <input
             type="text"
             name="SBUA"
             id="SBUA" className={styles.input}
             onChange={handleChange}
           /><br></br>
         </div>
 
         <div>
           <label htmlFor="AdoptedRate">Adopted rate(in per sq.ft) :</label><br></br>
           <input
             type="text"
             name="AdoptedRate"
             id="AdoptedRate" className={styles.input}
             onChange={handleChange}
           /><br></br>
         </div>
 
         <div>
           <label htmlFor="TotalValue">Total Value of flat/shop/flat/office on 100% Complate(in Rs) :</label><br></br>
           <input
             type="text"
             name="TotalValue"
             id="TotalValue" className={styles.input}
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
             onChange={handleChange}
           /><br></br>
         </div>
 
         <div>
           <label htmlFor="AdoptedRateSecond">Adopted rate(in per sq.ft) :</label><br></br>
           <input
             type="text"
             name="AdoptedRate"
             id="AdoptedRateSecond" className={styles.input}
             onChange={handleChange}
           /><br></br>
         </div>
 
         <div>
           <label htmlFor="TotalValueSecond">Total Value of flat/shop/flat/office on 100% Complate(in Rs) :</label><br></br>
           <input
             type="text"
             name="TotalValue"
             id="TotalValueSecond"
             className={styles.input}
             onChange={handleChange}
           /><br></br>
         </div>
 
         <div>
           <label htmlFor="AdditionalCostSecond">
             Additional Cost incurred for amenities(in Rs) :
           </label><br></br>
           <input
             type="text"
             name="AdditionalCost"
             id="AdditionalCostSecond"
             className={styles.input}
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
             onChange={handleChange}
           /><br></br>
         </div>
 
         <div>
           <label htmlFor="TotalRealizableValueSecond">
             Total Realizable Value at 100% completion(in Rs) :
           </label><br></br>
           <input
             type="text"
             name="TotalRealizableValue"
             id="TotalRealizableValueSecond" className={styles.input}
             onChange={handleChange}
           /><br></br>
         </div>
 
         <div>
           <label htmlFor="TotalRealizableValuePresentSecond">
             Total Realizable Value on present completion stage(in Rs) :
           </label><br></br>
           <input
             type="text"
             name="TotalRealizableValuePresent"
             id="TotalRealizableValuePresentSecond" className={styles.input}
             onChange={handleChange}
           /><br></br>
         </div>
 
         <div>
           <label htmlFor="TotalForcedDistressedValueSecond">
             Total Forced/Distressed Value at 100% completion(in Rs) :
           </label><br></br>
           <input
             type="text"
             name="TotalForcedDistressedValue"
             id="TotalForcedDistressedValueSecond" className={styles.input}
             onChange={handleChange}
           /><br></br>
         </div>
 
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
         <p className={styles.prose}>This report is prepared for based on the documents furnished and/or the condition of the property as prevailed at the time of our visit for Motilal Oswal Financial Services. The report provides an indicative market value of the property in our opinion which may not necessarily reflect the guideline value. Cost of construction is estimated based on our opinion on prevailing market rates at the time of our visit. Builtup area considered for valuation in this report at presumed FSI basis revised allowable FSI Limits considered by NIDO Home Finance. Quality of construction is assessed based on the visual and corroborative evidence obtained at site during our visit. Measurement of the property is made to the extent reasonably possible considering the limitations at site. This report does not certify the ownership of the property. The ownership details shall be referred from the legal due diligence report.
           Report isvalidfor 90 days from the date of visit or report.
         </p>
         <h3>Satellite Map :</h3>
         <label htmlFor="satelliteMap">Upload photo satelite map</label><br></br>
         <input
           type="file"
           id="satelliteMap" className={styles.fileInput}
           name="satelliteMap"
           accept="image/*"
           onChange={(e) => handleImageChange("satelliteMap", e)}
         />
         <h4>PHOTOGRAPHS OF PROPERTY</h4>
         <label htmlFor="hall">Upload photo Hall</label><br></br>
         <input
           type="file"
           id="hall" className={styles.fileInput}
           name="hall"
           accept="image/*"
           onChange={(e) => handleImageChange("hall", e)}
         /><br></br>
 
         <label htmlFor="kitchen">Upload photo Kichen :</label><br></br>
         <input
           type="file"
           id="kitchen" className={styles.fileInput}
           name="kitchen"
           accept="image/*"
           onChange={(e) => handleImageChange("kitchen", e)}
         /><br></br>
 
         <label htmlFor="bedroom">Upload photo Bedroom :</label><br></br><br></br>
         <input
           type="file"
           id="bedroom" className={styles.fileInput}
           name="bedroom"
           accept="image/*"
           onChange={(e) => handleImageChange("bedroom", e)}
         /><br></br>
 
         <label htmlFor="otherRoom">Upload photo other room :</label><br></br><br></br>
         <input
           type="file"
           id="otherRoom" className={styles.fileInput}
           name="otherRoom"
           accept="image/*"
           onChange={(e) => handleImageChange("otherRoom", e)}
         /><br></br>
 
         <label htmlFor="otherPhoto">Upload photo other photo :</label><br></br>
         <input
           type="file"
           id="otherPhoto" className={styles.fileInput}
           name="otherPhoto"
           accept="image/*"
           onChange={(e) => handleImageChange("otherPhoto", e)}
         /><br></br>
 
         <label htmlFor="externalPhoto">Upload photo external photo :</label><br></br>
         <input
           type="file"
           id="externalPhoto" className={styles.fileInput}
           name="externalPhoto"
           accept="image/*"
           onChange={(e) => handleImageChange("externalPhoto", e)}
         /><br></br>
 
         <label htmlFor="frontSite">Upload photo front site :</label><br></br>
         <input
           type="file"
           id="frontSite" className={styles.fileInput}
           name="frontSite"
           accept="image/*"
           onChange={(e) => handleImageChange("frontSite", e)}
         /><br></br>
 
         <label htmlFor="roadSite">Upload photo road site :</label><br></br>
         <input
           type="file"
           id="roadSite" className={styles.fileInput}
           name="roadSite"
           accept="image/*"
           onChange={(e) => handleImageChange("roadSite", e)}
         /><br></br>
 
         <label htmlFor="selfieWithProperty">Upload photo selfie with property :</label><br></br>
         <input
           type="file"
           id="selfieWithProperty"
           name="selfieWithProperty"
           accept="image/*"
           className={styles.fileInput}
           onChange={(e) => handleImageChange("selfieWithProperty", e)}
         /><br></br>
         <label htmlFor="selfieWithPerson">Upload photo selfie with person met at property :</label><br></br>
         <input
           type="file"
           id="selfieWithPerson" className={styles.fileInput}
           name="selfieWithPerson"
           accept="image/*"
           onChange={(e) => handleImageChange("selfieWithPerson", e)}
         /><br></br>
         <div className={styles.submitRow}>
           <button
             type="submit"
             className={styles.submitBtn}
             disabled={isUploading}
           >
             {isUploading ? "Uploading..." : "Submit"}
           </button>
         </div>
 
 
       </form>
 
     </div>
   )
 }
