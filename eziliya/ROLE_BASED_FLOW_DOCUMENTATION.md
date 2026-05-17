# Role-Based Profile and Bank Report System Documentation

## Overview
This system implements a complete role-based workflow for creating bank reports. Users can select their role, choose a bank, fill out the appropriate form, and generate final reports.

## Complete User Flow

### 1. Home Page (`/`)
- **Location**: `src/page/Home.jsx`
- **Features**:
  - Displays all available roles
  - Quick access to bank selection
  - User profile access
  - Authentication check

### 2. Role Selection
Users can choose from 5 different roles:

#### a) Valuer (`/role/valuer`)
- **Location**: `src/pages/role wise profile/valuer/valuer.jsx`
- **Responsibilities**:
  - Conduct property valuations
  - Prepare technical valuation reports
  - Submit reports to respective banks
  - Maintain accuracy and compliance

#### b) Sales Team (`/role/salesteam`)
- **Location**: `src/pages/role wise profile/sale team/Salesteam.jsx`
- **Responsibilities**:
  - Initiate customer loan applications
  - Collect customer information and documents
  - Submit applications to banks
  - Follow up on application status
  - Maintain customer relationships

#### c) Office Engineer (`/role/office-engineer`)
- **Location**: `src/pages/role wise profile/office engineer/Officeengineer.jsx`
- **Responsibilities**:
  - Review technical documentation
  - Prepare technical valuation reports
  - Verify property details and measurements
  - Coordinate with site engineers
  - Ensure compliance with bank requirements

#### d) Site Engineer (`/role/site-engineer`)
- **Location**: `src/pages/role wise profile/site engineer/Siteengineer.jsx`
- **Responsibilities**:
  - Conduct on-site property inspections
  - Take photographs and measurements
  - Verify property boundaries and specifications
  - Assess construction quality and progress
  - Prepare detailed site inspection reports
  - Document property conditions accurately

#### e) Technical Engineer (`/role/technical-engineer`)
- **Location**: `src/pages/role wise profile/technical engineer/technicalengineer.jsx`
- **Responsibilities**:
  - Conduct technical property assessments
  - Evaluate structural integrity
  - Review construction specifications
  - Verify compliance with building codes
  - Prepare detailed technical reports
  - Provide recommendations and risk assessments

### 3. Bank Selection (`/select-banks`)
- **Location**: `src/components/select banks/Bankname.jsx`
- **Features**:
  - Lists all available banks
  - Back button to return to previous page
  - Home button for quick navigation
  - Direct links to bank-specific forms

#### Available Banks:
1. ICICI BANK (`/icic`)
2. JANA BANK (`/Jana`)
3. KOTAK MAHINDRA BANK (`/kotak`)
4. CHOLAMANDALAM FINANCE (`/Cholamandalam`)
5. SUNDARAM FINANCE (`/Sundaram`)
6. GODREJ CAPITAL (`/Godrejcapital`)
7. L&T FINANCE (`/LandTfinance`)
8. AU SMALL FINANCE (`/ausmallfinanceform`)
9. UGRO CAPITAL LTD (`/UgroCapital`)
10. NIDO FINANCE (`/Nido`)
11. IDFC BANK (`/Idfc`)
12. BHFL (`/Bhfl`)
13. YES BANK (`/YesBank`)
14. JALGAON JANTA BANK (`/JalgaonBank`)
15. MOTILAL OSWAL HOME FINANCE (`/MotilalOswalBank`)
16. STAR HOUSING (`/StarHousing`)
17. CAPITAL INDIA (`/CapitalIndia`)
18. SVATANTRA HOUSING FINANCE CORPORATION (`/SvatantraHousingFinanceCorporation`)
19. CREDIT SAISON INDIA (`/CreditSaisitionIndia`)

### 4. Bank Form Submission
- **Location**: `src/pages/[bank-name]/[BankName]Form.jsx`
- **Process**:
  1. User fills out the bank-specific form
  2. Form data is collected and validated
  3. Images/documents are uploaded
  4. On submit, data is sent to backend API
  5. User is automatically redirected to the final report page

**Example Flow (AU Small Finance)**:
```javascript
// Form submission in Ausmallfinanceform.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  const reportPayload = buildReportPayload(formData);
  navigate('/ausmallfinance', { state: { formData: reportPayload } });
  // ... API call to save data
};
```

### 5. Final Report Generation
- **Location**: `src/pages/[bank-name]/[BankName]FinalReport.jsx`
- **Features**:
  - Displays all submitted form data
  - Formatted report layout
  - Option to download/print report
  - Navigation back to home or create new report

#### Report Routes:
- ICICI: `/icic-report`
- JANA: `/Jana-report`
- KOTAK: `/kotak-report`
- CHOLAMANDALAM: `/Cholamandalam-report`
- SUNDARAM: `/Sundaram-report`
- GODREJ: `/Godrejcapital-report`
- L&T: `/LandTfinance-report`
- AU SMALL FINANCE: `/ausmallfinance`
- UGRO CAPITAL: `/UgroCapital-report`
- NIDO: `/Nido-report`
- IDFC: `/Idfc-report`
- BHFL: `/Bhfl-report`
- YES BANK: `/YesBank-report`
- JALGAON: `/JalgaonBank-report`
- MOTILAL OSWAL: `/MotilalOswalBank-report`
- STAR HOUSING: `/StarHousing-report`
- CAPITAL INDIA: `/CapitalIndia-report`
- SVATANTRA: `/SvatantraHousingFinanceCorporation-report`
- CREDIT SAISON: `/CreditSaisitionIndia-report`

## Complete Navigation Flow

```
Home (/)
  ↓
Role Selection (/role/[role-name])
  ↓
Bank Selection (/select-banks)
  ↓
Bank Form (/[bank-name])
  ↓ (on submit)
Final Report (/[bank-name]-report)
  ↓
Back to Home or Create New Report
```

## Key Features

### 1. Role-Based Access
- Each role has a dedicated profile page
- Clear description of responsibilities
- Direct access to bank selection

### 2. Bank Selection
- Comprehensive list of all supported banks
- Easy navigation with back and home buttons
- Clear instructions for users

### 3. Form Submission
- Bank-specific forms with relevant fields
- File upload support for documents/images
- Form validation
- Automatic navigation to report page

### 4. Report Generation
- Professional report layout
- All form data displayed
- Download/print capabilities
- Easy navigation options

## Technical Implementation

### Routing Structure (App.jsx)
```javascript
// Role-wise Profile Routes
<Route path="/role/valuer" element={<Valuer />} />
<Route path="/role/salesteam" element={<Salesteam />} />
<Route path="/role/office-engineer" element={<Officeengineer />} />
<Route path="/role/site-engineer" element={<Siteengineer />} />
<Route path="/role/technical-engineer" element={<Technicalengineer />} />

// Bank Selection
<Route path="/select-banks" element={<Bankname />} />

// Bank Forms and Reports
<Route path="/[bank]" element={<BankForm />} />
<Route path="/[bank]-report" element={<BankFinalReport />} />
```

### State Management
- Form data stored in component state
- Navigation uses React Router's `useNavigate` hook
- Report data passed via navigation state
- User authentication stored in localStorage

### File Structure
```
src/
├── page/
│   └── Home.jsx                    # Main home page with role selection
├── pages/
│   ├── role wise profile/          # Role-specific pages
│   │   ├── valuer/
│   │   ├── sale team/
│   │   ├── office engineer/
│   │   ├── site engineer/
│   │   └── technical engineer/
│   └── [bank-name]/                # Bank-specific forms and reports
│       ├── [BankName]Form.jsx
│       └── [BankName]FinalReport.jsx
├── components/
│   └── select banks/
│       └── Bankname.jsx            # Bank selection page
└── App.jsx                         # Main routing configuration
```

## Usage Instructions

### For End Users:
1. **Login** to the system
2. **Select your role** from the home page
3. **Click "Select Bank to Create Report"** button
4. **Choose the bank** you want to create a report for
5. **Fill out the form** with all required information
6. **Upload necessary documents/images**
7. **Submit the form** to generate the final report
8. **View/Download** the generated report

### For Developers:
1. All role pages follow the same structure
2. Bank forms should navigate to their respective report pages on submit
3. Report pages receive data via navigation state
4. Add new banks by creating form and report components, then updating routes in App.jsx

## Future Enhancements
- Role-based permissions and access control
- Report history and tracking
- Email notifications
- PDF export functionality
- Advanced search and filtering
- Dashboard with analytics
- Multi-language support

## Support
For issues or questions, please contact the development team.