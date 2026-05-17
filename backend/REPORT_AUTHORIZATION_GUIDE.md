# Report Authorization Guide

## Overview
This guide explains the role-based authorization system for creating and editing reports in the application. The system ensures that only authorized roles can perform specific actions on reports.

## Authorized Roles for Reports

### Roles That Can Create Reports
- **office-engineer** (Office Engineer)
- **site-engineer** (Site Engineer)
- **valuer** (Valuer)
- **technical-engineer** (Technical Engineer)
- **admin** (Administrator)

### Roles That Can Edit Reports
- **office-engineer** - Can edit their own reports
- **site-engineer** - Can edit their own reports
- **valuer** - Can edit their own reports
- **technical-engineer** - Can edit their own reports
- **admin** - Can edit ANY report (full access)

### Roles That Can View Reports
- **office-engineer**
- **site-engineer**
- **valuer**
- **technical-engineer**
- **sales-team**
- **admin**

### Roles That Can Manage Reports (Delete, Approve, Reject)
- **admin** only

## Authentication Middleware

### Available Middleware Functions

#### 1. `authorizeReportCreation`
Allows office engineers, site engineers, valuers, technical engineers, and admins to create reports.

**Usage:**
```javascript
router.post("/report/create", authenticate, authorizeReportCreation, createReport);
```

#### 2. `authorizeReportEdit`
Allows authorized roles to edit reports. Non-admin users can only edit their own reports, while admins can edit any report.

**Usage:**
```javascript
router.put("/report/:reportId", authenticate, authorizeReportEdit, updateReport);
```

**Important:** In your controller, verify ownership for non-admin users:
```javascript
// In your controller
if (!req.user.role === 'admin' && report.createdBy.toString() !== req.user._id.toString()) {
  return res.status(403).json({ message: "You can only edit your own reports" });
}
```

#### 3. `authorizeReportView`
Allows all engineer roles, sales team, and admin to view reports.

**Usage:**
```javascript
router.get("/report/:reportId", authenticate, authorizeReportView, getReport);
```

#### 4. `authorizeReportManagement`
Restricts management operations (delete, approve, reject) to admin only.

**Usage:**
```javascript
router.delete("/report/:reportId", authenticate, authorizeReportManagement, deleteReport);
router.post("/report/:reportId/approve", authenticate, authorizeReportManagement, approveReport);
router.post("/report/:reportId/reject", authenticate, authorizeReportManagement, rejectReport);
```

## Implementation Examples

### Example 1: Protected Report Routes
```javascript
import {
  authenticate,
  authorizeReportCreation,
  authorizeReportEdit,
  authorizeReportView,
  authorizeReportManagement
} from "./auth/authentication.mjs";

// Create report - Only authorized roles
router.post("/technical-report/create", 
  authenticate, 
  authorizeReportCreation, 
  createTechnicalReport
);

// View report - All engineer roles and sales team
router.get("/technical-report/:reportId", 
  authenticate, 
  authorizeReportView, 
  getTechnicalReport
);

// Edit report - Only report creator or admin
router.put("/technical-report/:reportId", 
  authenticate, 
  authorizeReportEdit, 
  updateTechnicalReport
);

// Delete report - Admin only
router.delete("/technical-report/:reportId", 
  authenticate, 
  authorizeReportManagement, 
  deleteTechnicalReport
);
```

### Example 2: Controller Implementation with Ownership Check
```javascript
export const updateTechnicalReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await TechnicalReport.findById(reportId);
    
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Check ownership for non-admin users
    if (req.user.role !== 'admin' && 
        report.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "You can only edit your own reports" 
      });
    }

    // Update the report
    const updatedReport = await TechnicalReport.findByIdAndUpdate(
      reportId,
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Report updated successfully",
      data: updatedReport
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update report",
      error: error.message
    });
  }
};
```

## Current Implementation

### Sales Team Forms
The sales team form routes have been updated with proper authorization:

- **Public Routes** (No authentication):
  - `POST /sales-team-form/submit` - Public form submission
  - `POST /sales-team-form/create` - Public form creation

- **Protected View Routes** (Requires authentication + view permission):
  - `GET /sales-team-form/all` - View all forms
  - `GET /sales-team-form/status/:status` - View forms by status
  - `GET /sales-team-form/stats` - View form statistics
  - `GET /sales-team-form/:formId` - View specific form

- **Protected Edit Routes** (Requires authentication + edit permission):
  - `PUT /sales-team-form/:formId` - Update form

- **Admin Only Routes** (Requires authentication + admin role):
  - `DELETE /sales-team-form/:formId` - Delete form
  - `POST /sales-team-form/:formId/approve` - Approve form
  - `POST /sales-team-form/:formId/reject` - Reject form

### Ausmall Finance Final Report Routes (Template)
When implementing the final report controller, use these protected routes:

```javascript
// Create report - Engineers and admin only
router.post("/ausmall-finance-final-report/create", 
  authenticate, 
  authorizeReportCreation, 
  createAusmallFinanceFinalReport
);

// View reports - All authorized roles
router.get("/ausmall-finance-final-report/all", 
  authenticate, 
  authorizeReportView, 
  getAllAusmallFinanceFinalReports
);

// Edit report - Report creator or admin
router.put("/ausmall-finance-final-report/:reportId", 
  authenticate, 
  authorizeReportEdit, 
  updateAusmallFinanceFinalReport
);

// Manage report - Admin only
router.delete("/ausmall-finance-final-report/:reportId", 
  authenticate, 
  authorizeReportManagement, 
  deleteAusmallFinanceFinalReport
);
```

## Testing Authorization

### Test Create Report (Should succeed for authorized roles)
```bash
# Login as office-engineer
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"engineer@example.com","password":"password123"}'

# Use the token to create a report
curl -X POST http://localhost:3000/api/report/create \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Report","content":"Report content"}'
```

### Test Edit Report (Should fail if not owner or admin)
```bash
# Try to edit someone else's report (should fail)
curl -X PUT http://localhost:3000/api/report/REPORT_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'
```

### Test Delete Report (Should fail for non-admin)
```bash
# Try to delete as non-admin (should fail)
curl -X DELETE http://localhost:3000/api/report/REPORT_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```
**Cause:** No token provided or invalid token

### 403 Forbidden
```json
{
  "message": "Access denied. Only office-engineer, site-engineer, valuer, technical-engineer, admin can create reports."
}
```
**Cause:** User role doesn't have permission for the requested action

### 403 Forbidden (Ownership)
```json
{
  "message": "You can only edit your own reports"
}
```
**Cause:** Non-admin user trying to edit another user's report

## Best Practices

1. **Always use `authenticate` first** before any authorization middleware
2. **Check ownership in controllers** for edit operations when using `authorizeReportEdit`
3. **Store creator information** in reports (createdBy field) for ownership verification
4. **Use appropriate middleware** based on the operation:
   - Create → `authorizeReportCreation`
   - View → `authorizeReportView`
   - Edit → `authorizeReportEdit`
   - Delete/Approve/Reject → `authorizeReportManagement`

## Security Notes

- JWT tokens must be included in the `Authorization` header as `Bearer TOKEN`
- Tokens are verified using the secret key from `config.secretMessage`
- Role information is extracted from the decoded JWT token
- Admin role has full access to all operations
- Non-admin users can only edit their own reports (ownership must be verified in controller)

## Summary

The authorization system provides granular control over report operations:
- ✅ **Create**: Office Engineer, Site Engineer, Valuer, Technical Engineer, Admin
- ✅ **View**: All engineer roles, Sales Team, Admin
- ✅ **Edit**: Report owner or Admin
- ✅ **Delete/Approve/Reject**: Admin only

This ensures proper access control while maintaining flexibility for different user roles.