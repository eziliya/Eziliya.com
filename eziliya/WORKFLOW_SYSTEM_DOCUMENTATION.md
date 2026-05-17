# Report Workflow System Documentation

## Overview
This document describes the complete workflow system for report creation and processing in the Eziliya application. The system implements a three-stage workflow where reports flow from Office Engineer → Site Engineer → Valuer.

## Workflow Stages

### Stage 1: Office Engineer (Initial Report Creation)
**Role**: Office Engineer  
**Status**: `office_engineer_pending` → `site_engineer_pending`  
**Backend Role**: Not mapped (creates reports)

#### Responsibilities:
1. Create initial report with property details
2. Fill out bank-specific forms
3. Add property information, measurements, and documentation
4. Submit report to Site Engineer

#### Process:
1. Office Engineer logs in and navigates to their profile
2. Clicks "Select Bank to Create Report"
3. Chooses the appropriate bank
4. Fills out the bank-specific form with property details
5. Uploads necessary documents/images
6. Submits the form

#### API Endpoint:
```
POST /submit-office-engineer/:reportId
Body: {
  bankName: string,
  formData: object
}
```

#### Database Updates:
- `workflowStatus`: "site_engineer_pending"
- `assignedTo`: "sideengineer"
- `officeEngineerData`: formData
- `officeEngineerSubmittedAt`: current timestamp
- `bankName`: selected bank name

---

### Stage 2: Site Engineer (Field Inspection)
**Role**: Site Engineer  
**Status**: `site_engineer_pending` → `valuer_pending`  
**Backend Role**: `sideengineer`

#### Responsibilities:
1. Review reports submitted by Office Engineers
2. Conduct on-site property inspections
3. Take photographs and measurements
4. Verify property boundaries and specifications
5. Add detailed site inspection data
6. Submit completed report to Valuer

#### Process:
1. Site Engineer logs in and views pending reports
2. Selects a report to process
3. Reviews Office Engineer's data
4. Adds field inspection details
5. Uploads site photographs
6. Submits the updated report

#### API Endpoint:
```
POST /submit-site-engineer/:reportId
Body: {
  formData: object
}
```

#### Database Updates:
- `workflowStatus`: "valuer_pending"
- `assignedTo`: "evaluator"
- `siteEngineerData`: formData
- `siteEngineerSubmittedAt`: current timestamp

---

### Stage 3: Valuer (Final Report & Valuation)
**Role**: Valuer  
**Status**: `valuer_pending` → `completed`  
**Backend Role**: `evaluator`

#### Responsibilities:
1. Review complete reports from Office and Site Engineers
2. Analyze all property details and site inspection data
3. Conduct final property valuations
4. Create comprehensive technical valuation reports
5. Combine all data into final report
6. Mark report as completed

#### Process:
1. Valuer logs in and views pending reports
2. Selects a report to process
3. Reviews Office Engineer and Site Engineer data
4. Adds valuation details and final assessment
5. Creates final comprehensive report
6. Submits completed report

#### API Endpoint:
```
POST /submit-valuer/:reportId
Body: {
  finalReport: object
}
```

#### Database Updates:
- `workflowStatus`: "completed"
- `valuerData`: finalReport
- `valuerSubmittedAt`: current timestamp
- `finalReport`: Combined data from all three stages
- `completedAt`: current timestamp

---

## Database Schema

### Report Model Fields

#### Basic Information
- `userId`: ObjectId - Creator of the report
- `taskTitle`: String - Report title
- `adminInstructions`: String - Instructions from admin
- `propertyType`: Enum - Type of property
- `address`: String - Property address
- `images`: Array[String] - Image URLs
- `description`: String - Property description

#### Workflow Fields
- `workflowStatus`: Enum
  - "draft"
  - "office_engineer_pending"
  - "site_engineer_pending"
  - "valuer_pending"
  - "completed"
- `bankName`: String - Selected bank name
- `assignedTo`: Enum - Current assignee role
  - "evaluator"
  - "technician"
  - "sideengineer"
  - "admin"

#### Stage-Specific Data
- `officeEngineerData`: Mixed - Office Engineer's form data
- `officeEngineerSubmittedAt`: Date - Submission timestamp
- `siteEngineerData`: Mixed - Site Engineer's form data
- `siteEngineerSubmittedAt`: Date - Submission timestamp
- `valuerData`: Mixed - Valuer's form data
- `valuerSubmittedAt`: Date - Submission timestamp
- `finalReport`: Mixed - Combined final report
- `completedAt`: Date - Completion timestamp

---

## API Endpoints

### Report Workflow Endpoints

#### 1. Submit Office Engineer Report
```
POST /submit-office-engineer/:reportId
Headers: Authorization: Bearer <token>
Body: {
  bankName: string,
  formData: object
}
Response: {
  message: "Office Engineer report submitted successfully",
  report: Report
}
```

#### 2. Submit Site Engineer Report
```
POST /submit-site-engineer/:reportId
Headers: Authorization: Bearer <token>
Body: {
  formData: object
}
Response: {
  message: "Site Engineer report submitted successfully",
  report: Report
}
```

#### 3. Submit Valuer Report
```
POST /submit-valuer/:reportId
Headers: Authorization: Bearer <token>
Body: {
  finalReport: object
}
Response: {
  message: "Valuer report submitted successfully. Report completed!",
  report: Report
}
```

#### 4. Get Pending Reports
```
GET /pending-reports
Headers: Authorization: Bearer <token>
Response: {
  message: "Pending reports found",
  reports: Report[]
}
```
Returns reports based on user role:
- Site Engineer: Reports with status "site_engineer_pending"
- Valuer: Reports with status "valuer_pending"

#### 5. Get Completed Reports
```
GET /completed-reports
Headers: Authorization: Bearer <token>
Response: {
  message: "Completed reports found",
  reports: Report[]
}
```

#### 6. Get Report by ID
```
GET /report/:reportId
Headers: Authorization: Bearer <token>
Response: {
  message: "Report found",
  report: Report
}
```

---

## Frontend Components

### 1. ReportWorkflow Component
**Location**: `src/components/report/ReportWorkflow.jsx`

**Features**:
- Displays pending and completed reports in tabs
- Shows report cards with key information
- Provides action buttons to process reports
- Filters reports based on user role
- Real-time status updates

**Props**:
- `userRole`: string - Current user's role

### 2. Role-Specific Profile Pages

#### Office Engineer Profile
**Location**: `src/pages/role wise profile/office engineer/Officeengineer.jsx`

**Features**:
- Create new reports button
- Toggle to show/hide workflow
- Workflow visualization
- Responsibilities list

#### Site Engineer Profile
**Location**: `src/pages/role wise profile/site engineer/Siteengineer.jsx`

**Features**:
- View pending reports from Office Engineers
- Toggle to show/hide workflow
- Workflow visualization with current stage highlighted
- Responsibilities list

#### Valuer Profile
**Location**: `src/pages/role wise profile/valuer/valuer.jsx`

**Features**:
- View pending reports from Site Engineers
- Toggle to show/hide workflow
- Workflow visualization with current stage highlighted
- Responsibilities list

---

## User Flow Examples

### Example 1: Complete Report Flow

1. **Office Engineer**:
   - Logs in → Goes to profile
   - Clicks "Select Bank to Create Report"
   - Selects "AU Small Finance"
   - Fills form with property details
   - Submits form
   - Report status: `site_engineer_pending`

2. **Site Engineer**:
   - Logs in → Goes to profile
   - Clicks "Show Pending Reports & Workflow"
   - Sees report in "Pending Reports" tab
   - Clicks "Process Report"
   - Reviews Office Engineer's data
   - Adds site inspection details and photos
   - Submits form
   - Report status: `valuer_pending`

3. **Valuer**:
   - Logs in → Goes to profile
   - Clicks "Show Pending Reports & Workflow"
   - Sees report in "Pending Reports" tab
   - Clicks "Process Report"
   - Reviews all previous data
   - Adds valuation and final assessment
   - Submits final report
   - Report status: `completed`

### Example 2: Viewing Completed Reports

Any role can view completed reports:
1. Go to their profile page
2. Click "Show Pending Reports & Workflow"
3. Switch to "Completed Reports" tab
4. Click "View Full Report" on any completed report

---

## Status Flow Diagram

```
Draft
  ↓
Office Engineer Creates Report
  ↓
office_engineer_pending → site_engineer_pending
  ↓
Site Engineer Adds Data
  ↓
site_engineer_pending → valuer_pending
  ↓
Valuer Creates Final Report
  ↓
valuer_pending → completed
```

---

## Role Mapping

| Frontend Role | Backend Role | Workflow Status Access |
|--------------|--------------|----------------------|
| Office Engineer | (creator) | Creates reports |
| Site Engineer | sideengineer | site_engineer_pending |
| Valuer | evaluator | valuer_pending |
| Admin | admin | All reports |

---

## Security & Permissions

### Authentication
- All workflow endpoints require authentication
- JWT token must be provided in Authorization header

### Authorization
- Users can only access reports assigned to their role
- Site Engineers see only `site_engineer_pending` reports
- Valuers see only `valuer_pending` reports
- Admins have access to all reports

### Data Validation
- Report ID must be valid MongoDB ObjectId
- Report must exist in database
- Report must be in correct workflow stage for the action
- User role must match the required stage

---

## Error Handling

### Common Errors

1. **Report Not Found** (404)
   - Report ID doesn't exist
   - Solution: Verify report ID

2. **Invalid Workflow Stage** (400)
   - Report not in expected stage
   - Solution: Check current workflow status

3. **Unauthorized** (401)
   - Missing or invalid token
   - Solution: Login again

4. **Forbidden** (403)
   - User role doesn't match required stage
   - Solution: Verify user role and report status

5. **Internal Server Error** (500)
   - Database connection issues
   - Validation errors
   - Solution: Check server logs

---

## Testing Checklist

### Backend Testing
- [ ] Create report with Office Engineer data
- [ ] Submit Site Engineer data to existing report
- [ ] Submit Valuer data to complete report
- [ ] Get pending reports for Site Engineer
- [ ] Get pending reports for Valuer
- [ ] Get completed reports
- [ ] Get report by ID
- [ ] Test role-based access control
- [ ] Test invalid workflow transitions

### Frontend Testing
- [ ] Office Engineer can create reports
- [ ] Office Engineer sees workflow visualization
- [ ] Site Engineer sees pending reports
- [ ] Site Engineer can process reports
- [ ] Valuer sees pending reports
- [ ] Valuer can complete reports
- [ ] All roles can view completed reports
- [ ] Workflow component displays correctly
- [ ] Status badges show correct colors
- [ ] Date formatting works correctly

---

## Future Enhancements

1. **Notifications**
   - Email notifications when report moves to next stage
   - In-app notifications for pending reports

2. **Comments & Communication**
   - Add comments between stages
   - Request clarifications or additional information

3. **Report History**
   - Track all changes made to a report
   - Show who made what changes and when

4. **Analytics Dashboard**
   - Reports completed per day/week/month
   - Average time per stage
   - Performance metrics per user

5. **Bulk Operations**
   - Process multiple reports at once
   - Export multiple reports

6. **Advanced Search & Filters**
   - Filter by bank, property type, date range
   - Search by address, report ID, etc.

7. **PDF Generation**
   - Auto-generate PDF from final report
   - Customizable templates per bank

8. **Mobile App**
   - Native mobile app for field work
   - Offline support for Site Engineers

---

## Support & Maintenance

### Logs
- All workflow transitions are logged with timestamps
- User actions are tracked in database
- Error logs available in server console

### Backup
- Regular database backups recommended
- Store report images in cloud storage with redundancy

### Monitoring
- Monitor API response times
- Track workflow completion rates
- Alert on stuck reports (too long in one stage)

---

## Contact
For technical support or questions about the workflow system, contact the development team.

**Last Updated**: 2026-04-24  
**Version**: 1.0.0