# AU Small Finance Form - Save Draft & Continue Workflow

## Overview
This document describes the complete workflow for saving AU Small Finance forms as drafts and continuing work from the valuer profile's pending reports section.

## Features Implemented

### 1. Save Draft Functionality in Form
**Location:** `src/pages/au small finance/Ausmallfinanceform.jsx`

#### New Features:
- **Save Draft Button**: Allows users to save their progress without submitting
- **Auto-load Existing Drafts**: When opening a form with a `formId` in state, it loads the saved data
- **Update Existing Drafts**: If a draft already exists, the save button updates it instead of creating a new one
- **Success Messages**: Visual feedback when drafts are saved or updated
- **Submit with Draft**: Forms can be submitted even if they were previously saved as drafts

#### Key Functions:
```javascript
handleSaveDraft() - Saves or updates draft form
handleSubmit() - Submits form (creates or updates then submits)
useEffect() - Loads existing form data when editing
```

### 2. Valuer Profile - Pending Reports Section
**Location:** `src/pages/role wise profile/valuer/valuer.jsx`

#### New Features:
- **AU Small Finance Drafts Toggle**: New button to show/hide saved drafts
- **Draft Forms Grid**: Displays all saved draft forms in a card layout
- **Continue Editing**: Button to resume work on any saved draft
- **Delete Draft**: Option to remove unwanted drafts
- **Form Details Display**: Shows applicant name, property address, loan amount, and timestamps

#### Key Functions:
```javascript
fetchAuSmallForms() - Fetches all draft forms from backend
handleContinueForm(formId) - Navigates to form with formId to continue editing
handleDeleteForm(formId) - Deletes a draft form
formatDate(dateString) - Formats dates for display
```

### 3. Styling Updates
**Files Modified:**
- `src/pages/au small finance/Ausmallfinanceform.module.css`
- `src/pages/role wise profile/valuer/valuer.module.css`

#### New Styles:
- `.saveDraftBtn` - Green save draft button
- `.submitBtn` - Blue submit button
- `.saveMessage` - Success/error message display
- `.auSmallFormsSection` - Container for draft forms
- `.formCard` - Individual draft form card
- `.continueBtn` - Continue editing button
- `.deleteBtn` - Delete draft button

## Backend Integration

### Existing Endpoints Used:
1. **Create Form**: `POST /ausmall-finance-form/create`
   - Creates a new draft form
   - Status: "draft"

2. **Update Form**: `PUT /ausmall-finance-form/:formId`
   - Updates existing draft form
   - Preserves draft status

3. **Get All Forms**: `GET /ausmall-finance-form/all?status=draft`
   - Fetches all draft forms for the user
   - Filtered by status

4. **Get Form by ID**: `GET /ausmall-finance-form/:formId`
   - Retrieves specific form data for editing

5. **Submit Form**: `POST /ausmall-finance-form/:formId/submit`
   - Changes status from "draft" to "submitted"

6. **Delete Form**: `DELETE /ausmall-finance-form/:formId`
   - Removes draft form (only drafts can be deleted)

## User Workflow

### Scenario 1: Creating and Saving a New Draft
1. User navigates to AU Small Finance form
2. User fills in form fields
3. User clicks "Save Draft" button
4. Form data is saved to backend with status "draft"
5. Success message appears
6. User can continue editing or navigate away

### Scenario 2: Continuing Work on Saved Draft
1. User goes to Valuer Profile
2. User clicks "Show AU Small Finance Drafts" button
3. List of saved drafts appears
4. User clicks "Continue Editing" on desired draft
5. Form opens with all previously saved data
6. User can make changes and save again or submit

### Scenario 3: Submitting a Draft Form
1. User opens a saved draft (or creates new form)
2. User completes all required fields
3. User clicks "Submit" button
4. Form is submitted and status changes to "submitted"
5. User is redirected to final report page

### Scenario 4: Deleting a Draft
1. User goes to Valuer Profile
2. User clicks "Show AU Small Finance Drafts"
3. User clicks "Delete" on unwanted draft
4. Confirmation dialog appears
5. Upon confirmation, draft is permanently deleted

## Data Structure

### Form Data Saved:
```javascript
{
  applicantName: String,
  loanAmount: Number,
  propertyAddress: String,
  formData: {
    // All form fields including:
    // - Personal details
    // - Property information
    // - Images (base64)
    // - All other form inputs
  },
  status: "draft" | "submitted" | "approved" | "rejected",
  createdAt: Date,
  updatedAt: Date
}
```

## Testing Checklist

### Frontend Testing:
- [ ] Save Draft button appears on form
- [ ] Save Draft button saves form data
- [ ] Success message appears after saving
- [ ] Draft counter updates in valuer profile
- [ ] Draft forms display in grid layout
- [ ] Continue Editing loads correct form data
- [ ] Delete button removes draft
- [ ] Submit button works with saved drafts
- [ ] Form validation works correctly
- [ ] Responsive design works on mobile

### Backend Testing:
- [ ] Create endpoint accepts form data
- [ ] Update endpoint modifies existing draft
- [ ] Get all endpoint returns user's drafts
- [ ] Get by ID endpoint returns correct form
- [ ] Submit endpoint changes status
- [ ] Delete endpoint removes draft
- [ ] Authorization works correctly
- [ ] Only draft forms can be deleted

### Integration Testing:
- [ ] Save → Continue → Save again workflow
- [ ] Save → Submit workflow
- [ ] Multiple drafts can be managed
- [ ] Form data persists correctly
- [ ] Images/files are saved properly
- [ ] Date fields format correctly
- [ ] Navigation works between pages

## Error Handling

### Frontend:
- Network errors show user-friendly messages
- Failed saves display error message
- Loading states prevent duplicate submissions
- Confirmation dialogs for destructive actions

### Backend:
- Validates required fields
- Checks user permissions
- Prevents unauthorized access
- Returns appropriate error codes

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Users can only access their own forms
3. **Validation**: Backend validates all input data
4. **Status Protection**: Only draft forms can be deleted
5. **Data Sanitization**: Form data is sanitized before storage

## Future Enhancements

1. **Auto-save**: Implement periodic auto-save functionality
2. **Version History**: Track changes to drafts over time
3. **Collaboration**: Allow multiple users to work on same form
4. **Templates**: Save common form configurations as templates
5. **Offline Support**: Enable offline form editing with sync
6. **Export/Import**: Allow exporting drafts for backup

## Troubleshooting

### Common Issues:

**Issue**: Draft not saving
- Check network connection
- Verify authentication token is valid
- Check browser console for errors
- Ensure required fields have values

**Issue**: Draft not loading
- Verify formId is passed correctly in navigation state
- Check backend endpoint is accessible
- Verify user has permission to access form

**Issue**: Delete not working
- Ensure form status is "draft"
- Check user permissions
- Verify backend endpoint is working

## API Environment Variables

Ensure `.env` file contains:
```
VITE_API_BASE_URL=http://localhost:3000
```

## Conclusion

The AU Small Finance form now supports a complete draft workflow, allowing valuers to:
- Save work in progress
- View all saved drafts
- Continue editing from where they left off
- Submit when ready
- Manage multiple drafts efficiently

This improves user experience and prevents data loss during long form-filling sessions.

---
**Made with Bob**
**Last Updated**: 2026-05-01