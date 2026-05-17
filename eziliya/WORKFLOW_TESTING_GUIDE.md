# Workflow Testing Guide

## How Site Engineer Fetches Office Engineer Reports

### System Flow

```
Office Engineer                    Backend                      Site Engineer
     |                                |                               |
     | 1. Creates & Submits Report    |                               |
     |------------------------------->|                               |
     |                                |                               |
     |    Status: site_engineer_pending                              |
     |    assignedTo: sideengineer    |                               |
     |                                |                               |
     |                                |   2. Logs in & Views Profile  |
     |                                |<------------------------------|
     |                                |                               |
     |                                |   3. Clicks "Show Pending"    |
     |                                |<------------------------------|
     |                                |                               |
     |    4. GET /pending-reports     |                               |
     |                                |<------------------------------|
     |                                |                               |
     |    5. Returns filtered reports |                               |
     |    (workflowStatus = site_engineer_pending)                   |
     |                                |------------------------------>|
     |                                |                               |
     |                                |   6. Displays reports list    |
     |                                |                               |
```

### Step-by-Step Testing

#### Step 1: Office Engineer Creates Report

1. **Login as Office Engineer**
   - Email: officeengineer@example.com
   - Role: `technician`

2. **Navigate to Profile**
   - Go to `/office-engineer`
   - Click "Select Bank to Create Report"

3. **Fill Yes Bank Form**
   - Select "Yes Bank"
   - Fill all required fields:
     - Name of Applicant
     - Property Address
     - Property Type
     - Upload photos
   - Click Submit

4. **Verify Report Created**
   - Report navigates to preview
   - Check browser console: "Report submitted to workflow successfully"
   - Report should be created with:
     ```json
     {
       "workflowStatus": "site_engineer_pending",
       "assignedTo": "sideengineer",
       "bankName": "Yes Bank",
       "officeEngineerData": { /* form data */ }
     }
     ```

#### Step 2: Site Engineer Fetches Report

1. **Logout and Login as Site Engineer**
   - Email: siteengineer@example.com
   - Role: `sideengineer`

2. **Navigate to Site Engineer Profile**
   - Go to `/site-engineer`
   - Click "Show Pending Reports & Workflow"

3. **Verify Reports Display**
   - Should see the report created by Office Engineer
   - Report card shows:
     - Task Title (Applicant Name)
     - Bank Name: "Yes Bank"
     - Property Type
     - Property Address
     - Status Badge: "Site Engineer"
     - "Process Report" button

4. **Check API Call**
   - Open Browser DevTools → Network tab
   - Should see: `GET /pending-reports`
   - Response should contain:
     ```json
     {
       "message": "Pending reports retrieved successfully",
       "count": 1,
       "workflowStatus": "site_engineer_pending",
       "reports": [
         {
           "_id": "...",
           "taskTitle": "...",
           "bankName": "Yes Bank",
           "workflowStatus": "site_engineer_pending",
           "officeEngineerData": { /* data */ }
         }
       ]
     }
     ```

#### Step 3: Site Engineer Processes Report

1. **Click "Process Report"**
   - Navigates to bank form with existing data
   - URL: `/YesBank` with state containing reportId and reportData

2. **Add Field Inspection Data**
   - Review Office Engineer's data
   - Add site inspection details
   - Upload field photos
   - Click Submit

3. **Verify Submission**
   - Report status changes to `valuer_pending`
   - Report assigned to `evaluator`
   - Report moves from Site Engineer's pending to completed

### Backend API Verification

#### Check Pending Reports Endpoint

**Request:**
```bash
curl -X GET http://localhost:3000/pending-reports \
  -H "Authorization: Bearer <site_engineer_token>" \
  -H "Content-Type: application/json"
```

**Expected Response (for Site Engineer):**
```json
{
  "message": "Pending reports retrieved successfully",
  "count": 1,
  "workflowStatus": "site_engineer_pending",
  "reports": [
    {
      "_id": "report_id_here",
      "userId": "office_engineer_user_id",
      "taskTitle": "John Doe Property",
      "bankName": "Yes Bank",
      "propertyType": "house",
      "address": "123 Main St",
      "workflowStatus": "site_engineer_pending",
      "assignedTo": "sideengineer",
      "officeEngineerData": {
        "NameofApplicant": "John Doe",
        "PropertyAddress": "123 Main St",
        // ... all form fields
      },
      "officeEngineerSubmittedAt": "2026-04-24T07:00:00.000Z",
      "createdAt": "2026-04-24T06:55:00.000Z",
      "updatedAt": "2026-04-24T07:00:00.000Z"
    }
  ]
}
```

### Database Verification

**Check MongoDB:**
```javascript
// Connect to MongoDB
use your_database_name;

// Find reports pending for Site Engineer
db.reports.find({
  workflowStatus: "site_engineer_pending",
  assignedTo: "sideengineer"
}).pretty();

// Should show reports with:
// - officeEngineerData populated
// - officeEngineerSubmittedAt timestamp
// - siteEngineerData: null
// - workflowStatus: "site_engineer_pending"
```

### Troubleshooting

#### Problem: Site Engineer sees no pending reports

**Check:**
1. Office Engineer actually submitted the report
2. Report status is `site_engineer_pending`
3. Report `assignedTo` is `sideengineer`
4. Site Engineer is logged in with correct role
5. Backend API is running
6. Check browser console for errors
7. Check Network tab for API response

**Solution:**
```javascript
// Manually update report in MongoDB if needed
db.reports.updateOne(
  { _id: ObjectId("report_id") },
  {
    $set: {
      workflowStatus: "site_engineer_pending",
      assignedTo: "sideengineer"
    }
  }
);
```

#### Problem: API returns 400 or 403

**Check:**
1. JWT token is valid
2. User role is `sideengineer`
3. Token is included in Authorization header
4. Backend authentication middleware is working

#### Problem: Reports show but can't process

**Check:**
1. `handleReportClick` function in ReportWorkflow.jsx
2. Navigation state includes reportId and reportData
3. Bank form can receive and display existing data

### Success Criteria

✅ Office Engineer can create and submit reports
✅ Reports appear in Site Engineer's pending list
✅ Site Engineer can view Office Engineer's data
✅ Site Engineer can add field inspection data
✅ Report progresses through workflow correctly
✅ All timestamps are recorded
✅ Status badges display correctly

### API Endpoints Summary

| Endpoint | Method | Role | Purpose |
|----------|--------|------|---------|
| `/create` | POST | Office Engineer | Create new report |
| `/submit-office-engineer/:id` | POST | Office Engineer | Submit initial data |
| `/pending-reports` | GET | Site Engineer | Fetch pending reports |
| `/submit-site-engineer/:id` | POST | Site Engineer | Submit field data |
| `/completed-reports` | GET | All | View completed reports |

### Role & Status Mapping

| Stage | Role | Status | Assigned To |
|-------|------|--------|-------------|
| 1. Create | Office Engineer (technician) | draft | technician |
| 2. Submit | Office Engineer | site_engineer_pending | sideengineer |
| 3. Process | Site Engineer (sideengineer) | site_engineer_pending | sideengineer |
| 4. Submit | Site Engineer | valuer_pending | evaluator |
| 5. Process | Valuer (evaluator) | valuer_pending | evaluator |
| 6. Complete | Valuer | completed | - |

---

**Last Updated:** 2026-04-24
**Version:** 1.0
**Status:** Production Ready