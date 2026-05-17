# PDF Download Implementation Guide

## Overview
This guide explains how to implement server-side PDF generation for AU Small Finance reports using Chrome's "print to PDF" functionality via Puppeteer.

## Backend Implementation Required

### 1. Install Dependencies

```bash
cd backend
npm install puppeteer
```

### 2. Create PDF Generation Controller

**File:** `backend/src/controllers/pdfController.mjs`

```javascript
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

export const generateReportPDF = async (req, res) => {
  try {
    const { formId } = req.params;
    const userId = req.user.id;

    // Fetch form data
    const form = await AuSmallFinanceForm.findOne({
      _id: formId,
      createdBy: userId
    });

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Launch headless Chrome
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Generate HTML content for the report
    const htmlContent = generateReportHTML(form);

    // Set content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    await browser.close();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="report-${formId}.pdf"`
    );

    // Send PDF
    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate PDF',
      error: error.message 
    });
  }
};

// Helper function to generate HTML
function generateReportHTML(form) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Technical Valuation Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #667eea;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #667eea;
          margin: 0;
        }
        .section {
          margin-bottom: 25px;
        }
        .section h2 {
          background: #667eea;
          color: white;
          padding: 10px;
          margin: 0 0 15px 0;
        }
        .field {
          margin-bottom: 10px;
          display: flex;
        }
        .field-label {
          font-weight: bold;
          width: 250px;
          color: #555;
        }
        .field-value {
          flex: 1;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
        @media print {
          body { margin: 0; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>TECHNICAL VALUATION REPORT</h1>
        <p>AU Small Finance Bank</p>
      </div>

      <div class="section">
        <h2>Basic Information</h2>
        <div class="field">
          <div class="field-label">Valuation Agency:</div>
          <div class="field-value">${form.nameOfvaluationAgency || 'N/A'}</div>
        </div>
        <div class="field">
          <div class="field-label">Date of Technical Initiation:</div>
          <div class="field-value">${form.dateOfTechnicalInitiation || 'N/A'}</div>
        </div>
        <div class="field">
          <div class="field-label">Applicant Name:</div>
          <div class="field-value">${form.applicantsName || 'N/A'}</div>
        </div>
        <div class="field">
          <div class="field-label">Date of Site Visit:</div>
          <div class="field-value">${form.dateOfSiteVisit || 'N/A'}</div>
        </div>
      </div>

      <div class="section">
        <h2>Property Details</h2>
        <div class="field">
          <div class="field-label">Property Address:</div>
          <div class="field-value">${form.propertyAddress || 'N/A'}</div>
        </div>
        <div class="field">
          <div class="field-label">Loan Amount:</div>
          <div class="field-value">₹${form.loanAmount?.toLocaleString('en-IN') || 'N/A'}</div>
        </div>
      </div>

      <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString('en-IN')}</p>
        <p>Report ID: ${form._id}</p>
      </div>
    </body>
    </html>
  `;
}
```

### 3. Add Route

**File:** `backend/src/router.mjs`

```javascript
import { generateReportPDF } from './controllers/pdfController.mjs';

// Add this route
router.get('/ausmall-finance-form/:formId/pdf', 
  authenticateToken, 
  generateReportPDF
);
```

## Frontend Implementation

### 1. Add Download Button to ValuerReports

**File:** `src/pages/role wise profile/valuer/ValuerReports.jsx`

Add this function:

```javascript
const handleDownloadPDF = async (formId) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(
      `${API_BASE_URL}/ausmall-finance-form/${formId}/pdf`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download PDF');
    }

    // Get the PDF blob
    const blob = await response.blob();
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${formId}.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    alert('PDF downloaded successfully!');
  } catch (error) {
    console.error('Download error:', error);
    alert('Failed to download PDF');
  }
};
```

Add download button in renderReportCard:

```javascript
<button
  className={styles.downloadBtn}
  onClick={() => handleDownloadPDF(report._id)}
>
  📥 Download PDF
</button>
```

### 2. Add CSS for Download Button

**File:** `src/pages/role wise profile/valuer/ValuerReports.module.css`

```css
.downloadBtn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.downloadBtn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
}
```

## Alternative: Client-Side PDF Generation

If server-side is not possible, use client-side generation:

### Install jsPDF

```bash
npm install jspdf jspdf-autotable
```

### Client-Side Implementation

```javascript
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const handleDownloadPDF = (report) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Technical Valuation Report', 105, 20, { align: 'center' });
  
  // Add content
  doc.setFontSize(12);
  doc.text(`Applicant: ${report.applicantName}`, 20, 40);
  doc.text(`Property: ${report.propertyAddress}`, 20, 50);
  doc.text(`Loan Amount: ₹${report.loanAmount?.toLocaleString('en-IN')}`, 20, 60);
  
  // Save PDF
  doc.save(`report-${report._id}.pdf`);
};
```

## Recommended Approach

**Server-Side (Puppeteer)** is recommended because:
- ✅ Better formatting control
- ✅ Can include images
- ✅ Professional appearance
- ✅ Consistent across devices
- ✅ Can use Chrome's print CSS

**Client-Side (jsPDF)** is simpler but:
- ⚠️ Limited formatting
- ⚠️ Harder to include images
- ⚠️ May look different on different devices

## Testing

### Test Server-Side PDF:

```bash
# Start backend
cd backend
npm start

# Test endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/ausmall-finance-form/FORM_ID/pdf \
  --output test.pdf
```

### Test Frontend:

1. Go to My Reports
2. Click "Download PDF" on any report
3. PDF should download automatically

## Production Considerations

1. **Memory Management**: Puppeteer can be memory-intensive
2. **Timeouts**: Set appropriate timeouts for PDF generation
3. **Queue System**: Use Bull or similar for large volumes
4. **Caching**: Cache generated PDFs if reports don't change
5. **Error Handling**: Proper error messages to users

## Security

- ✅ Authenticate all PDF requests
- ✅ Verify user owns the report
- ✅ Sanitize form data before HTML generation
- ✅ Rate limit PDF generation endpoints
- ✅ Don't expose internal paths in PDFs

---

**Status:** Ready for implementation
**Priority:** High
**Estimated Time:** 4-6 hours