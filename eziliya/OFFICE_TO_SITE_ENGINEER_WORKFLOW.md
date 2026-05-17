# Office Engineer to Site Engineer Workflow Documentation

## Overview
This document describes the complete workflow for report creation and submission from Office Engineer to Site Engineer, and eventually to Valuer for final approval.

## Workflow Stages

### Stage 1: Office Engineer Creates Report
**Status:** `draft` → `site_engineer_pending`

1. **Office Engineer logs in** and navigates to their profile
2. **Clicks "Select Bank to Create Report"** button
3. **Selects a bank** from the list (e.g., Yes Bank)
4. **Fills out the bank-specific form** with property details:
   - Property information
   - Applicant details
   - Site measurements
   - Upload photos
   - Technical specifications

5. **Submits the form** which triggers:
   - Creates a new report in the database
   - Saves Office Engineer data
   - Sets `workflowStatus` to `site_engineer_pending`
   - Sets `assignedTo` to `sideengineer`
   - Records `officeEngineerSubmittedAt` timestamp

### Stage 2: Site Engineer Reviews and Adds Field Data
**Status:** `site_engineer_pending` → `valuer_pending`

1. **Site Engineer logs in** and navigates to their profile
2. **Clicks "Show Pending Reports & Workflow"** button
3. **Views all pending reports** assigned to them
4. **Clicks "Process Report"** on a specific report
5. **Adds field inspection data**:
   - On-site measurements
   - Field photographs
   - Construction quality assessment
   - Boundary verification
   - Additional observations

6. **Submits the updated report** which triggers:
   - Saves Site Engineer data
   - Sets `workflowStatus` to `valuer_pending`
   - Sets `assignedTo` to `evaluator`
   - Records `siteEngineerSubmittedAt` timestamp

### Stage 3: Valuer Creates Final Report
**Status:** `valuer_pending` → `completed`

1. **Valuer logs in** and navigates to their profile
2. **Views pending reports** requiring valuation
3. **Reviews both Office Engineer and Site Engineer data**
4. **Creates final valuation report** with:
   - Property valuation
   - Market analysis
   - Risk assessment
   - Final recommendations

5. **Submits final report** which triggers:
   - Saves Valuer data
   - Combines all three stages into `finalReport`
   - Sets `workflowStatus` to `completed`
   - Records `valuerSubmittedAt` and `completedAt` timestamps

## API Endpoints

### Create Report
```
POST /create
Headers: Authorization: Bearer <token>
Body: {
  taskTitle: string,
  propertyType: string,
  address: string,
  assignedTo: string
}
```

### Submit Office Engineer Report
```
POST /submit-office-engineer/:reportId
Headers: Authorization: Bearer <token>
Body: {
  bankName: string,
  formData: object
}
```

### Submit Site Engineer Report
```
POST /submit-site-engineer/:reportId
Headers: Authorization: Bearer <token>
Body: {
  formData: object
}
```

### Submit Valuer Report
```
POST /submit-valuer/:reportId
Headers: Authorization: Bearer <token>
Body: {
  finalReport: object
}
```

### Get Pending Reports
```
GET /pending-reports
Headers: Authorization: Bearer <token>
Returns: Reports filtered by user role and workflow status
```

### Get Completed Reports
```
GET /completed-reports
Headers: Authorization: Bearer <token>
Returns: All completed reports
```

### Get Report by ID
```
GET /report/:reportId
Headers: Authorization: Bearer <token>
Returns: Full report details with all stages
```

## Database Schema

### Report Model Fields

```javascript
{
  userId: ObjectId,              // Creator of the report
  taskTitle: String,             // Report title
  propertyType: String,          // house, apartment, office, shop, other
  address: String,               // Property address
  
  // Workflow fields
  workflowStatus: String,        // draft, office_engineer_pending, 
                                 // site_engineer_pending, valuer_pending, completed
  assignedTo: String,            // evaluator, technician, sideengineer, admin
  bankName: String,              // Bank name
  
  // Office Engineer data
  officeEngineerData: Mixed,     // Complete form data from office engineer
  officeEngineerSubmittedAt: Date,
  
  // Site Engineer data
  siteEngineerData: Mixed,       // Field inspection data
  siteEngineerSubmittedAt: Date,
  
  // Valuer data
  valuerData: Mixed,             // Final valuation data
  valuerSubmittedAt: Date,
  
  // Final combined report
  finalReport: {
    officeEngineer: Mixed,
    siteEngineer: Mixed,
    valuer: Mixed
  },
  
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Frontend Components

### 1. Office Engineer Profile (`Officeengineer.jsx`)
- Displays workflow information
- "Select Bank to Create Report" button
- Shows/hides ReportWorkflow component
- Lists responsibilities

### 2. Site Engineer Profile (`Siteengineer.jsx`)
- Displays pending reports
- Shows/hides ReportWorkflow component
- Lists responsibilities
- Highlights current stage in workflow

### 3. ReportWorkflow Component (`ReportWorkflow.jsx`)
- Fetches pending and completed reports
- Displays reports in tabs
- Shows report details (bank, property type, address, dates)
- "Process Report" button for pending reports
- "View Full Report" button for completed reports
- Status badges for workflow stages

### 4. Bank Forms (e.g., `YesBankForm.jsx`)
- Collects property and applicant information
- Handles image uploads (converts to base64)
- Integrates with workflow API
- Creates report and submits Office Engineer data
- Navigates to report preview on success

## User Roles

### Office Engineer
- **Role Code:** `technician` (in user model)
- **Permissions:**
  - Create new reports
  - Fill bank-specific forms
  - Submit reports to Site Engineers
  - View their created reports

### Site Engineer
- **Role Code:** `sideengineer`
- **Permissions:**
  - View reports assigned to them
  - Add field inspection data
  - Submit reports to Valuers
  - View completed reports

### Valuer
- **Role Code:** `evaluator`
- **Permissions:**
  - View reports assigned to them
  - Review Office Engineer and Site Engineer data
  - Create final valuation reports
  - Mark reports as completed

### Admin
- **Role Code:** `admin`
- **Permissions:**
  - View all reports
  - Create reports for any role
  - Override workflow stages
  - Manage users

## Testing the Workflow

### Prerequisites
1. Backend server running on port 3000
2. MongoDB connected
3. Frontend running on Vite dev server
4. Users created for each role (Office Engineer, Site Engineer, Valuer)

### Test Steps

#### 1. Test Office Engineer Report Creation
```
1. Login as Office Engineer
2. Navigate to Office Engineer profile
3. Click "Select Bank to Create Report"
4. Select "Yes Bank"
5. Fill out the form with test data
6. Upload required photos
7. Click Submit
8. Verify success message
9. Check that report appears in "My Reports"
```

#### 2. Test Site Engineer Receives Report
```
1. Logout and login as Site Engineer
2. Navigate to Site Engineer profile
3. Click "Show Pending Reports & Workflow"
4. Verify the report appears in Pending Reports tab
5. Check that status shows "Site Engineer"
6. Click "Process Report"
7. Verify navigation to bank form with existing data
```

#### 3. Test Site Engineer Submission
```
1. Add field inspection data
2. Upload site photos
3. Submit the form
4. Verify success message
5. Check that report moves to Completed Reports
```

#### 4. Test Valuer Receives Report
```
1. Logout and login as Valuer
2. Navigate to Valuer profile
3. View pending reports
4. Verify the report appears
5. Process and submit final valuation
6. Verify report is marked as completed
```

## Troubleshooting

### Report Not Appearing for Site Engineer
- Check `workflowStatus` is `site_engineer_pending`
- Check `assignedTo` is `sideengineer`
- Verify Site Engineer is logged in with correct role
- Check backend logs for API errors

### Submission Fails
- Verify JWT token is valid
- Check network requests in browser DevTools
- Verify backend server is running
- Check MongoDB connection
- Review backend error logs

### Images Not Uploading
- Verify images are converted to base64
- Check file size limits
- Verify image fields in form data
- Check backend accepts base64 strings

## Security Considerations

1. **Authentication:** All API endpoints require valid JWT token
2. **Authorization:** Users can only access reports assigned to their role
3. **Data Validation:** Backend validates all input data
4. **Role-Based Access:** Workflow stages enforce role-based progression
5. **Audit Trail:** All submissions are timestamped with user information

## Future Enhancements

1. **Email Notifications:** Notify users when reports are assigned to them
2. **Report Comments:** Allow users to add comments at each stage
3. **Report History:** Track all changes and revisions
4. **Bulk Operations:** Process multiple reports at once
5. **Report Templates:** Pre-fill common fields
6. **Mobile App:** Native mobile application for field work
7. **Offline Mode:** Allow Site Engineers to work offline
8. **Report Analytics:** Dashboard with workflow statistics
9. **Document Management:** Attach additional documents to reports
10. **Integration:** Connect with bank APIs for automated submission

## Support

For issues or questions:
- Check this documentation
- Review WORKFLOW_SYSTEM_DOCUMENTATION.md
- Check backend logs
- Contact system administrator

---

**Last Updated:** 2026-04-24
**Version:** 1.0
**Author:** Bob (AI Assistant)