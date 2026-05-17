# Form to PDF Report Workflow Documentation

## Overview
This document explains how the form data collection and PDF report generation system works in the Eziliya application, using AU Small Finance Bank as the reference implementation.

## Architecture Pattern

### 1. Two-Component System
Each bank has two main components:
- **Form Component** (e.g., `Ausmallfinanceform.jsx`) - Data collection
- **Final Report Component** (e.g., `AusmallfinanceFinalReport.jsx`) - Report display and PDF generation

### 2. Workflow Steps

```
User fills form → Submit → Navigate to Final Report → Display Report → Download PDF
```

## Detailed Implementation

### Step 1: Form Component Structure

**File Location**: `src/pages/[bank-name]/[BankName]Form.jsx`

**Key Features**:
```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function BankForm() {
  const [formData, setFormData] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file/image uploads
  const handleImageChange = (fieldName, e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: file
      }));
    }
  };

  // Submit form and navigate to report
  const handleSubmit = async (e) => {
    e.preventDefault();
    const reportPayload = buildReportPayload(formData);
    
    // Navigate to final report with form data
    navigate('/bank-final-report', { 
      state: { formData: reportPayload } 
    });
    
    // Optional: Save to backend
    setIsUploading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      await axios.post('/api/submit-form', data);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <input 
        type="text" 
        name="applicantsName" 
        onChange={handleChange}
        value={formData.applicantsName || ''}
      />
      
      <input 
        type="file" 
        onChange={(e) => handleImageChange('propertyPhoto', e)}
      />
      
      <button type="submit">Submit & Generate Report</button>
    </form>
  );
}
```

**Helper Function - buildReportPayload**:
```javascript
function buildReportPayload(formData) {
  const out = {};
  
  // Copy all form fields
  for (const [k, v] of Object.entries(formData)) {
    if (v !== undefined && v !== null && v !== '') {
      out[k] = v;
    }
  }
  
  // Transform file objects to report format if needed
  const fileToReport = {
    satelliteMap: formData.satelliteMap,
    hall: formData.hall,
    kitchen: formData.kitchen,
    bedroom: formData.bedroom,
    otherRoom: formData.otherRoom,
    otherPhoto: formData.otherPhoto,
    externalPhoto: formData.externalPhoto,
    frontSite: formData.frontSite,
    roadSite: formData.roadSite,
    selfieWithProperty: formData.selfieWithProperty,
    selfieWithPerson: formData.selfieWithPerson,
  };
  
  return { ...out, ...fileToReport };
}
```

### Step 2: Final Report Component Structure

**File Location**: `src/pages/[bank-name]/[BankName]FinalReport.jsx`

**Key Features**:
```javascript
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import styles from './BankFinalReport.module.css';

export default function BankFinalReport() {
  const location = useLocation();
  const [formData, setFormData] = useState(() => location.state?.formData ?? {});
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const reportRef = useRef(null);

  // Sync with navigation state
  useEffect(() => {
    if (location.state?.formData && Object.keys(location.state.formData).length > 0) {
      setFormData((prev) => ({ ...prev, ...location.state.formData }));
    }
  }, [location.state]);

  // Generate dynamic PDF filename
  const pdfFileName = useMemo(() => {
    const safe = (v) =>
      String(v || '')
        .trim()
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
        .replace(/\s+/g, '_')
        .slice(0, 60);

    const date = new Date();
    const yyyy = String(date.getFullYear());
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    const base =
      safe(formData.proposalIdApplicationNo) ||
      safe(formData.applicantsName) ||
      `report_${yyyy}${mm}${dd}`;

    return `TECHNICAL_VALUATION_${base}_${yyyy}${mm}${dd}.pdf`;
  }, [formData.applicantsName, formData.proposalIdApplicationNo]);

  // PDF Download Handler
  const handleDownloadPdf = async () => {
    if (!reportRef.current || isDownloadingPdf) return;

    setIsDownloadingPdf(true);
    try {
      const element = reportRef.current;
      const prevScrollX = window.scrollX;
      const prevScrollY = window.scrollY;

      // Scroll to top for proper rendering
      element.scrollIntoView({ behavior: 'instant', block: 'start', inline: 'start' });

      // Generate canvas from HTML
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (cloned) => {
          const clonedElement = cloned.querySelector(`[data-report-ref]`);
          if (clonedElement) {
            clonedElement.style.transform = 'none';
          }
        },
      });

      // Create PDF
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidthMm = pageWidth - 2 * margin;
      const contentHeightMm = pageHeight - 2 * margin;

      const pxPerMm = canvas.width / contentWidthMm;
      const pageSliceHeightPx = contentHeightMm * pxPerMm;

      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = canvas.width;
      const sliceCtx = sliceCanvas.getContext('2d');

      let renderedHeightPx = 0;
      let pageIndex = 0;

      while (renderedHeightPx < canvas.height) {
        const sliceHeightPx = Math.min(pageSliceHeightPx, canvas.height - renderedHeightPx);
        sliceCanvas.height = sliceHeightPx;

        sliceCtx.clearRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        sliceCtx.drawImage(
          canvas,
          0, renderedHeightPx,
          canvas.width, sliceHeightPx,
          0, 0,
          canvas.width, sliceHeightPx
        );

        if (pageIndex > 0) {
          pdf.addPage();
        }

        const imgData = sliceCanvas.toDataURL('image/jpeg', 0.92);
        const sliceHeightMm = sliceHeightPx / pxPerMm;
        pdf.addImage(imgData, 'JPEG', margin, margin, contentWidthMm, sliceHeightMm);

        renderedHeightPx += sliceHeightPx;
        pageIndex++;
      }

      // Save PDF
      pdf.save(pdfFileName);

      // Restore scroll position
      window.scrollTo(prevScrollX, prevScrollY);

      toast.success('PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF generation error:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      toast.error(`Failed to generate PDF: ${message}`);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Extract form data for display
  const {
    applicantsName,
    dateOfSiteVisit,
    proposalIdApplicationNo,
    // ... other fields
  } = formData;

  return (
    <div className={styles.container}>
      <button 
        onClick={handleDownloadPdf} 
        disabled={isDownloadingPdf}
        className={styles.downloadButton}
      >
        {isDownloadingPdf ? 'Generating PDF...' : 'Download PDF Report'}
      </button>

      <div ref={reportRef} data-report-ref className={styles.reportContent}>
        <h1>TECHNICAL VALUATION REPORT</h1>
        
        {/* Display all form data in report format */}
        <section>
          <h2>Applicant Information</h2>
          <p><strong>Name:</strong> {applicantsName}</p>
          <p><strong>Date of Visit:</strong> {dateOfSiteVisit}</p>
          <p><strong>Proposal ID:</strong> {proposalIdApplicationNo}</p>
        </section>

        {/* Property Details */}
        <section>
          <h2>Property Details</h2>
          {/* Add all property fields */}
        </section>

        {/* Images */}
        <section>
          <h2>Property Images</h2>
          {formData.propertyPhoto && (
            <img 
              src={URL.createObjectURL(formData.propertyPhoto)} 
              alt="Property" 
            />
          )}
        </section>

        {/* Valuation Details */}
        <section>
          <h2>Valuation Summary</h2>
          {/* Add valuation fields */}
        </section>
      </div>
    </div>
  );
}
```

### Step 3: Routing Configuration

**File**: `src/App.jsx`

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AusmallfinanceForm from './pages/au small finance/Ausmallfinanceform';
import AusmallfinanceFinalReport from './pages/au small finance/AusmallfinanceFinalReport';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/ausmallfinance-form" element={<AusmallfinanceForm />} />
        <Route path="/ausmallfinance" element={<AusmallfinanceFinalReport />} />
        {/* Add routes for other banks */}
      </Routes>
    </BrowserRouter>
  );
}
```

## PDF Generation Technology Stack

### Required Dependencies
```json
{
  "dependencies": {
    "html2canvas": "^1.4.1",
    "jspdf": "^2.5.1",
    "react-router-dom": "^6.x.x",
    "react-toastify": "^9.x.x"
  }
}
```

### Installation
```bash
npm install html2canvas jspdf react-router-dom react-toastify
```

## Utility Function (Optional)

**File**: `src/utils/reportPdf.js`

```javascript
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Renders a DOM node to a multi-page A4 PDF and triggers download.
 */
export async function downloadReportPdf(element, filename = 'report.pdf') {
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false,
    useCORS: true,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.92);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const marginX = 12;
  const imgWidth = pdf.internal.pageSize.getWidth() - 2 * marginX;
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'JPEG', marginX, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', marginX, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
}
```

## Common Form Fields Structure

### Basic Information
- `nameOfvaluationAgency` - Valuation agency name
- `dateOfTechnicalInitiation` - Technical initiation date
- `applicantsName` - Applicant's name
- `dateOfSiteVisit` - Site visit date
- `requestFrom` - Request source
- `dateOfReportRelease` - Report release date
- `proposalIdApplicationNo` - Proposal/Application ID

### Property Details
- `addressAsPerTRF` - Address as per TRF
- `addressAsPerLegalDocuments` - Legal document address
- `addressAsPerActualSite` - Actual site address
- `typeOfProperty` - Property type
- `propertyUsage` - Usage type
- `occupationStatus` - Occupation status

### Location Details
- `mainLocality` - Main locality
- `subLocality` - Sub locality
- `cityTownVillage` - City/Town/Village
- `stateName` - State
- `pincode` - PIN code
- `latitude` - GPS latitude
- `longitude` - GPS longitude

### Property Measurements
- `legalAreaNorth` - Legal area (North)
- `legalAreaSouth` - Legal area (South)
- `legalAreaEast` - Legal area (East)
- `legalAreaWest` - Legal area (West)
- `actualAreaNorth` - Actual area (North)
- `actualAreaSouth` - Actual area (South)
- `actualAreaEast` - Actual area (East)
- `actualAreaWest` - Actual area (West)

### Valuation Details
- `landValue` - Land value
- `constructionCost` - Construction cost
- `totalFairMarketValue` - Total fair market value
- `realizableValue` - Realizable value
- `forcedSaleValue` - Forced sale value

### Images/Documents
- `satelliteMap` - Satellite map image
- `hall` - Hall photo
- `kitchen` - Kitchen photo
- `bedroom` - Bedroom photo
- `externalPhoto` - External photo
- `selfieWithProperty` - Selfie with property
- `selfieWithPerson` - Selfie with person

## Best Practices

### 1. State Management
- Use `useState` for form data
- Initialize with empty object: `useState({})`
- Use controlled components for all inputs

### 2. Navigation
- Use `useNavigate` hook from react-router-dom
- Pass data via `state` object
- Access in destination component via `useLocation`

### 3. PDF Generation
- Use `useRef` to reference the report container
- Disable button during PDF generation
- Show loading state to user
- Handle errors gracefully with toast notifications

### 4. File Handling
- Store files as File objects in state
- Convert to URLs for display: `URL.createObjectURL(file)`
- Clean up object URLs when component unmounts

### 5. Styling
- Use CSS modules for component-specific styles
- Ensure print-friendly styles for PDF generation
- Test PDF output with various content lengths

## Testing Checklist

- [ ] Form validation works correctly
- [ ] All fields are captured in formData
- [ ] Navigation passes data correctly
- [ ] Final report displays all form data
- [ ] PDF generates without errors
- [ ] PDF contains all pages
- [ ] PDF filename is descriptive
- [ ] Images render correctly in PDF
- [ ] Multi-page content splits properly
- [ ] Download works in all browsers

## Troubleshooting

### PDF Generation Issues

**Problem**: Images not showing in PDF
**Solution**: Ensure `useCORS: true` in html2canvas options

**Problem**: Content cut off in PDF
**Solution**: Check page slicing logic and margins

**Problem**: PDF generation is slow
**Solution**: Reduce `scale` parameter or optimize images

**Problem**: Navigation state is lost
**Solution**: Verify `location.state` is properly passed and accessed

## Example Banks Implementation

All banks follow this pattern:
1. **AU Small Finance** - Reference implementation
2. **Yes Bank** - Similar structure
3. **IDFC Bank** - Similar structure
4. **Kotak Bank** - Similar structure
5. **BHFL** - Similar structure
6. **Jalgaon Bank** - Similar structure
7. **Jana Bank** - Similar structure
8. **L&T Finance** - Similar structure
9. **Motilal Oswal** - Similar structure
10. **Nido** - Similar structure
11. **Star Housing** - Similar structure
12. **Sundaram Finance** - Similar structure
13. **Svatantra Housing** - Similar structure
14. **Ugrow Capital** - Similar structure
15. **Capital India** - Similar structure
16. **Cholamandalam** - Similar structure
17. **Credit Saision India** - Similar structure
18. **Godrej Capital** - Similar structure

## Summary

The form-to-PDF workflow is a two-step process:
1. **Data Collection**: User fills form → Data stored in state → Navigate to report
2. **Report Generation**: Display data → Convert HTML to canvas → Generate multi-page PDF → Download

This pattern is consistent across all bank implementations in the Eziliya application.