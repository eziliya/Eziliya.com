# Sales Team Form Documentation

## Overview
This document describes the Sales Team Customer Application Form implementation, which allows sales team members to create comprehensive customer loan applications with all required documents and information.

## Files Created/Modified

### 1. SalesTeamForm.jsx
**Location:** `src/pages/role wise profile/sale team/SalesTeamForm.jsx`

**Purpose:** Main form component for sales team to create customer applications

**Features:**
- Comprehensive form with all required fields
- File upload functionality for documents
- Image preview for Aadhar and PAN cards
- PDF file handling for sale draft and valuation reports
- Form validation
- Reset functionality
- Navigation integration

**Form Fields:**

#### Firm Information
- **Firm Name** (required) - Text input
- **Property Type** (required) - Dropdown select with options:
  - Residential
  - Commercial
  - Industrial
  - Agricultural
  - Plot
  - Apartment
  - Villa
  - Other

#### Customer Information
- **Customer Name** (required) - Text input
- **Customer Contact Number** (required) - 10-digit phone number
- **Customer Alternative Contact Number** (optional) - 10-digit phone number
- **Customer Address** (required) - Textarea

#### Financial Information
- **Property Unit Rate** (required) - Number input (₹ per sq.ft.)
- **Customer Pay Amount** (required) - Number input (₹)
- **Customer Loan Amount** (required) - Number input (₹)

#### Document Uploads
- **Customer Aadhar Card Photo** (required) - Image file with preview
- **Customer PAN Card Photo** (required) - Image file with preview
- **Sale Draft PDF File** (required) - PDF file
- **Property Valuation Report PDF File** (required) - PDF file

### 2. SalesTeamForm.module.css
**Location:** `src/pages/role wise profile/sale team/SalesTeamForm.module.css`

**Purpose:** Styling for the Sales Team form

**Features:**
- Modern, responsive design
- Clean layout with sections
- Image preview functionality
- File upload styling
- Button hover effects
- Mobile-responsive breakpoints
- Professional color scheme

### 3. Salesteam.jsx (Updated)
**Location:** `src/pages/role wise profile/sale team/Salesteam.jsx`

**Changes:**
- Added link to new Sales Team form
- Enhanced UI with feature cards
- Improved action buttons
- Better organization of responsibilities

### 4. salesteam.module.css (Updated)
**Location:** `src/pages/role wise profile/sale team/salesteam.module.css`

**Changes:**
- Complete styling overhaul
- Gradient backgrounds
- Feature card grid layout
- Responsive design
- Modern button styles

### 5. App.jsx (Updated)
**Location:** `src/App.jsx`

**Changes:**
- Added import for SalesTeamForm component
- Added routes:
  - `/salesteam` - Sales team profile page
  - `/salesteam/form` - Sales team application form

## Usage

### Accessing the Form

1. **From Sales Team Profile:**
   - Navigate to `/salesteam` or `/role/salesteam`
   - Click on "📝 Create Customer Application" button

2. **Direct Access:**
   - Navigate directly to `/salesteam/form`

### Filling the Form

1. **Firm Information Section:**
   - Enter the firm name
   - Select property type from dropdown

2. **Customer Information Section:**
   - Enter customer's full name
   - Provide primary contact number (10 digits)
   - Optionally add alternative contact number
   - Fill in complete customer address

3. **Financial Information Section:**
   - Enter property unit rate per square foot
   - Specify amount customer will pay
   - Enter loan amount required

4. **Document Uploads Section:**
   - Upload Aadhar card photo (image format)
   - Upload PAN card photo (image format)
   - Upload sale draft PDF
   - Upload property valuation report PDF

5. **Submit or Reset:**
   - Click "Submit Application" to submit the form
   - Click "Reset Form" to clear all fields

### Form Validation

All required fields are marked with a red asterisk (*). The form will not submit until all required fields are filled:
- All text inputs must have values
- Contact numbers must be exactly 10 digits
- All file uploads must be completed
- Images must be in image format
- PDFs must be in PDF format

## Technical Details

### State Management
The form uses React's `useState` hook to manage:
- Form data object containing all field values
- File uploads (converted to base64 for images, stored as File objects for PDFs)
- Submission state

### File Handling

**Images (Aadhar & PAN):**
- Converted to base64 data URLs using FileReader
- Stored in state for preview
- Displayed as image previews below upload inputs

**PDFs (Sale Draft & Valuation Report):**
- Stored as File objects
- File name displayed after selection
- Ready for FormData submission to backend

### Form Submission

Current implementation:
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  try {
    // Form data is ready for API submission
    console.log('Form Data:', formData);
    
    // Example API call (commented out):
    // const formDataToSend = new FormData();
    // Object.keys(formData).forEach((key) => {
    //   formDataToSend.append(key, formData[key]);
    // });
    // await axios.post('/api/sales-team/submit', formDataToSend);
    
    alert('Sales form submitted successfully!');
    navigate('/salesteam');
  } catch (error) {
    console.error('Error submitting form:', error);
    alert('Error submitting form. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
```

### Navigation Flow

```
Home (/) 
  → Sales Team Profile (/salesteam)
    → Sales Team Form (/salesteam/form)
      → [Submit] → Back to Sales Team Profile
      → [Back Button] → Sales Team Profile
```

## Responsive Design

The form is fully responsive with breakpoints:

- **Desktop (>768px):** Full-width layout with optimal spacing
- **Tablet (768px):** Adjusted padding and font sizes
- **Mobile (<480px):** Single column layout, stacked buttons

## Future Enhancements

### Backend Integration
1. Create API endpoint: `POST /api/sales-team/submit`
2. Handle file uploads on server
3. Store data in database
4. Generate application reference number

### Additional Features
1. **Form Auto-save:** Save draft to localStorage
2. **Application Tracking:** View submitted applications
3. **Edit Functionality:** Modify submitted applications
4. **Status Updates:** Track application progress
5. **Notifications:** Email/SMS confirmations
6. **Document Verification:** Validate uploaded documents
7. **Multi-step Form:** Break into wizard-style steps
8. **Print/Export:** Generate PDF of application

### Validation Enhancements
1. Real-time field validation
2. File size limits
3. Image dimension requirements
4. PAN/Aadhar format validation
5. Duplicate application check

## Security Considerations

1. **File Upload Security:**
   - Validate file types on both client and server
   - Implement file size limits
   - Scan uploaded files for malware
   - Store files securely with encryption

2. **Data Protection:**
   - Encrypt sensitive data (Aadhar, PAN)
   - Implement HTTPS for all communications
   - Add CSRF protection
   - Sanitize all inputs

3. **Access Control:**
   - Verify user role before allowing form access
   - Implement authentication checks
   - Add authorization for form submission

## Testing Checklist

- [ ] All required fields show validation errors when empty
- [ ] Phone number validation works (10 digits)
- [ ] Image uploads show preview correctly
- [ ] PDF uploads display file name
- [ ] Reset button clears all fields
- [ ] Submit button is disabled during submission
- [ ] Navigation works correctly
- [ ] Form is responsive on all screen sizes
- [ ] File upload accepts only specified formats
- [ ] Form data structure is correct for backend

## Support

For issues or questions regarding the Sales Team form:
1. Check this documentation
2. Review the component code
3. Test in development environment
4. Contact development team

---

**Created by:** Bob  
**Last Updated:** 2026-04-26  
**Version:** 1.0.0