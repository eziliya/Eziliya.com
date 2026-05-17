# Quick Reference Guide: Form to PDF Report System

## 🚀 Quick Start

### For Each Bank, You Need:
1. **Form Component** - Collects data
2. **Final Report Component** - Displays and generates PDF
3. **Two Routes** - One for form, one for report

---

## 📋 Implementation Checklist

### ✅ Form Component (`[BankName]Form.jsx`)

```javascript
// Required imports
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './[BankName]Form.module.css';

// Required state
const [formData, setFormData] = useState({});
const [isUploading, setIsUploading] = useState(false);
const navigate = useNavigate();

// Required handlers
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

const handleImageChange = (fieldName, e) => {
  const file = e.target.files[0];
  if (file) {
    setFormData(prev => ({ ...prev, [fieldName]: file }));
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const reportPayload = buildReportPayload(formData);
  navigate('/bank-report-route', { state: { formData: reportPayload } });
  
  // Optional: Backend submission
  setIsUploading(true);
  try {
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    await axios.post('/api/submit-form', data);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setIsUploading(false);
  }
};

// Helper function
function buildReportPayload(formData) {
  const out = {};
  for (const [k, v] of Object.entries(formData)) {
    if (v !== undefined && v !== null && v !== '') {
      out[k] = v;
    }
  }
  return out;
}
```

### ✅ Final Report Component (`[BankName]FinalReport.jsx`)

```javascript
// Required imports
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import styles from './[BankName]FinalReport.module.css';

// Required state
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

// Dynamic PDF filename
const pdfFileName = useMemo(() => {
  const safe = (v) => String(v || '').trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '_').slice(0, 60);
  
  const date = new Date();
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  
  const base = safe(formData.proposalIdApplicationNo) || 
               safe(formData.applicantsName) || 
               `report_${yyyy}${mm}${dd}`;
  
  return `TECHNICAL_VALUATION_${base}_${yyyy}${mm}${dd}.pdf`;
}, [formData.applicantsName, formData.proposalIdApplicationNo]);

// PDF download handler (see full implementation in main docs)
const handleDownloadPdf = async () => { /* ... */ };
```

### ✅ Routes in `App.jsx`

```javascript
import BankForm from './pages/bank/BankForm.jsx';
import BankFinalReport from './pages/bank/BankFinalReport.jsx';

// In Routes:
<Route path="/bank-form" element={<BankForm />} />
<Route path="/bank-report" element={<BankFinalReport />} />
```

---

## 🎯 Common Form Fields

### Basic Information
```javascript
nameOfvaluationAgency
dateOfTechnicalInitiation
applicantsName
dateOfSiteVisit
requestFrom
dateOfReportRelease
proposalIdApplicationNo
transactionType
```

### Property Address
```javascript
addressAsPerTRF
addressAsPerLegalDocuments
addressAsPerActualSite
mainLocality
subLocality
cityTownVillage
stateName
pincode
```

### Property Details
```javascript
typeOfProperty
propertyUsage
occupationStatus
typeOfStructure
noOfFloors
locatedOnFloor
```

### Measurements
```javascript
legalAreaNorth
legalAreaSouth
legalAreaEast
legalAreaWest
actualAreaNorth
actualAreaSouth
actualAreaEast
actualAreaWest
```

### Valuation
```javascript
landValue
constructionCost
totalFairMarketValue
realizableValue
forcedSaleValue
```

### Images
```javascript
satelliteMap
hall
kitchen
bedroom
externalPhoto
selfieWithProperty
selfieWithPerson
```

---

## 🔧 HTML Form Input Examples

### Text Input
```jsx
<input 
  type="text" 
  name="applicantsName" 
  value={formData.applicantsName || ''} 
  onChange={handleChange}
  className={styles.input}
/>
```

### Date Input
```jsx
<input 
  type="date" 
  name="dateOfSiteVisit" 
  value={formData.dateOfSiteVisit || ''} 
  onChange={handleChange}
  className={styles.input}
/>
```

### Number Input
```jsx
<input 
  type="number" 
  name="landValue" 
  value={formData.landValue || ''} 
  onChange={handleChange}
  className={styles.input}
/>
```

### File Input
```jsx
<input 
  type="file" 
  accept="image/*"
  onChange={(e) => handleImageChange('propertyPhoto', e)}
/>
```

### Select Dropdown
```jsx
<select 
  name="propertyUsage" 
  value={formData.propertyUsage || ''} 
  onChange={handleChange}
  className={styles.input}
>
  <option value="">Select...</option>
  <option value="Residential">Residential</option>
  <option value="Commercial">Commercial</option>
</select>
```

### Textarea
```jsx
<textarea 
  name="remarks" 
  value={formData.remarks || ''} 
  onChange={handleChange}
  className={styles.textarea}
  rows="4"
/>
```

---

## 📦 Required Dependencies

```bash
npm install html2canvas jspdf react-router-dom react-toastify
```

**package.json:**
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

---

## 🎨 CSS Module Structure

### Form Styles (`[BankName]Form.module.css`)
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.pageTitle {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.submitButton {
  background: #007bff;
  color: white;
  padding: 12px 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
}

.submitButton:hover {
  background: #0056b3;
}

.submitButton:disabled {
  background: #ccc;
  cursor: not-allowed;
}
```

### Report Styles (`[BankName]FinalReport.module.css`)
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.downloadButton {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #28a745;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.downloadButton:hover {
  background: #218838;
}

.downloadButton:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.reportContent {
  background: white;
  padding: 40px;
  margin-top: 80px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.reportContent h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.reportContent section {
  margin-bottom: 30px;
}

.reportContent table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.reportContent table th,
.reportContent table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.reportContent table th {
  background: #f5f5f5;
  font-weight: bold;
}

.reportContent img {
  max-width: 100%;
  height: auto;
  margin: 10px 0;
}
```

---

## 🐛 Common Issues & Solutions

### Issue: Form data not passing to report
**Solution:** Check navigation state:
```javascript
navigate('/report', { state: { formData: reportPayload } });
```

### Issue: Images not showing in PDF
**Solution:** Add `useCORS: true` to html2canvas:
```javascript
const canvas = await html2canvas(element, {
  useCORS: true,
  allowTaint: false,
});
```

### Issue: PDF cuts off content
**Solution:** Check page slicing logic and ensure proper margins

### Issue: handleChange/handleSubmit not defined
**Solution:** Ensure all handlers are defined before the return statement

---

## 📊 Testing Checklist

- [ ] Form renders all fields
- [ ] All inputs are controlled (have value and onChange)
- [ ] Form submits without errors
- [ ] Navigation passes data correctly
- [ ] Report displays all form data
- [ ] PDF download button works
- [ ] PDF contains all content
- [ ] PDF filename is descriptive
- [ ] Images render in PDF
- [ ] Multi-page PDFs work correctly

---

## 🔗 Navigation Flow

```
User → Select Bank → Fill Form → Submit → View Report → Download PDF
  ↓         ↓           ↓          ↓          ↓            ↓
Home → Bankname → BankForm → navigate → FinalReport → PDF File
```

---

## 💡 Pro Tips

1. **Always use controlled components** - Every input should have `value` and `onChange`
2. **Handle undefined values** - Use `|| ''` for default values
3. **Test with real data** - Fill all fields to test PDF generation
4. **Optimize images** - Large images can slow PDF generation
5. **Use meaningful names** - Field names should match backend expectations
6. **Add loading states** - Show feedback during form submission and PDF generation
7. **Error handling** - Always wrap async operations in try-catch
8. **Validate inputs** - Add validation before submission
9. **Responsive design** - Ensure forms work on mobile devices
10. **Accessibility** - Add proper labels and ARIA attributes

---

## 📚 Additional Resources

- Full Documentation: `FORM_TO_PDF_WORKFLOW_DOCUMENTATION.md`
- html2canvas Docs: https://html2canvas.hertzen.com/
- jsPDF Docs: https://github.com/parallax/jsPDF
- React Router Docs: https://reactrouter.com/

---

## 🆘 Need Help?

1. Check the AU Small Finance implementation (reference example)
2. Review the full documentation
3. Verify all required imports are present
4. Ensure routes are properly configured
5. Check browser console for errors