# Valuer Workflow Guide

## Overview
This guide explains how the Valuer role works within the system, including viewing pending reports, processing them, and accessing completed reports.

## Valuer Profile Features

### 1. Select Bank Template
- Click "Select Bank Template" button to choose a bank and create a new valuation report
- This allows valuers to initiate reports directly

### 2. View Reports & Workflow
- Click "Show Pending Reports & Workflow" button to display the report management interface
- Two tabs are available:
  - **Pending Reports**: Reports waiting for valuer action
  - **Completed Reports**: Finalized reports ready for viewing

## Workflow Process

### Step 1: Office Engineer
- Creates initial report with property details
- Submits to Site Engineer

### Step 2: Site Engineer
- Conducts field inspection
- Adds site details and photographs
- Submits to Valuer

### Step 3: Valuer (Your Role)
- Reviews all data from Office and Site Engineers
- Analyzes property details and inspection data
- Conducts final property valuation
- Creates comprehensive technical valuation report
- Submits completed report

## Working with Reports

### Viewing Pending Reports

1. Click "Show Pending Reports & Workflow" button
2. View list of reports pending your action
3. Each report card shows:
   - Task Title
   - Status Badge
   - Bank Name
   - Property Type
   - Address
   - Creation Date
   - Admin Instructions (if any)

4. Click "Process Report" button to work on a report
5. System navigates to bank selection page with report data
6. Select appropriate bank template
7. Fill in valuation details
8. Submit completed report

### Viewing Completed Reports

1. Click "Show Pending Reports & Workflow" button
2. Switch to "Completed Reports" tab
3. View list of all completed reports
4. Each completed report card shows:
   - Task Title
   - Status: Completed
   - Bank Name
   - Property Type
   - Address
   - Completion Date
   - Office Engineer submission date
   - Site Engineer submission date
   - Valuer submission date

5. Click "View Full Report" button to see complete report details
6. System navigates to `/report-view/{reportId}` to display full report

## Report Status Flow

```
Draft
  ↓
Office Engineer Pending
  ↓
Site Engineer Pending
  ↓
Valuer Pending (Your Action Required)
  ↓
Completed (View Full Report Available)
```

## Key Features

### For Pending Reports:
- **Process Report**: Opens bank template with pre-filled data
- **Status Tracking**: See current workflow stage
- **Instructions**: View admin instructions if provided
- **Date Tracking**: See when report was created

### For Completed Reports:
- **View Full Report**: Access complete finalized report
- **Timeline**: See submission dates for all stages
- **Archive**: All completed reports are preserved
- **Reference**: Use for future valuations

## Best Practices

1. **Review Thoroughly**: Check all data from Office and Site Engineers before finalizing
2. **Verify Photos**: Ensure site photos are clear and relevant
3. **Accurate Valuation**: Provide precise property valuations based on all available data
4. **Complete Documentation**: Fill all required fields in the report
5. **Timely Submission**: Process pending reports promptly
6. **Quality Check**: Review completed report before final submission

## Navigation

### From Valuer Profile:
- **Home**: Return to main dashboard
- **Select Bank Template**: Create new report
- **Show/Hide Workflow**: Toggle report view
- **Process Report**: Work on pending report
- **View Full Report**: See completed report details

### Report Processing Flow:
```
Valuer Profile
  → Show Workflow
    → Pending Reports Tab
      → Process Report
        → Select Bank Template
          → Fill Valuation Form
            → Submit
              → Completed Reports Tab
                → View Full Report
```

## Troubleshooting

### No Pending Reports?
- Check if Office and Site Engineers have submitted reports
- Verify you're logged in with correct role
- Refresh the workflow view

### Cannot View Completed Report?
- Ensure report status is "Completed"
- Check if report ID is valid
- Verify navigation route is correct

### Report Data Missing?
- Confirm Office Engineer filled initial data
- Verify Site Engineer added inspection details
- Check for any error messages

## Technical Details

### API Endpoints Used:
- `GET /pending-reports` - Fetch pending reports
- `GET /completed-reports` - Fetch completed reports
- `GET /report-view/:id` - View specific report

### Report Data Structure:
```javascript
{
  _id: "report-id",
  taskTitle: "Property Valuation",
  bankName: "Bank Name",
  propertyType: "Residential/Commercial",
  address: "Property Address",
  workflowStatus: "valuer_pending/completed",
  createdAt: "timestamp",
  completedAt: "timestamp",
  officeEngineerSubmittedAt: "timestamp",
  siteEngineerSubmittedAt: "timestamp",
  valuerSubmittedAt: "timestamp",
  adminInstructions: "Special instructions",
  // ... other report fields
}
```

## Summary

The Valuer role is the final step in the report workflow. After Office and Site Engineers complete their parts, valuers:

1. Review all collected data
2. Analyze property information
3. Create final valuation
4. Submit completed report
5. Access completed reports anytime via "Completed Reports" tab

The system automatically tracks all submissions and maintains a complete history of each report's progress through the workflow.

---

**Created by:** Bob  
**Last Updated:** 2026-04-26  
**Version:** 1.0.0