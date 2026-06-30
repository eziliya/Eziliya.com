# Ausmall Finance Form - Draft Endpoints Documentation

## Problem Fixed
Previously, saved drafts were not visible in the reports drafts section because:
1. The `getAllAusmallFinanceForms` endpoint required authentication and filtered by userId and role
2. There were no dedicated draft endpoints for Ausmall Finance Forms
3. Drafts were being created but couldn't be retrieved separately

## Solution Implemented
Added three new endpoints specifically for handling drafts:

### 1. Save Draft
**Endpoint:** `POST /ausmall-finance-form/save-draft`
**Authentication:** Public (No authentication required)
**Description:** Saves a new draft of an Ausmall Finance Form

**Request Body:** Any fields from the Ausmall Finance Form schema
```json
{
  "BankName": "Example Bank",
  "ApplicantsNames": "John Doe",
  "LoanAmount": 500000,
  // ... any other form fields
}
```

**Response:**
```json
{
  "success": true,
  "message": "Draft saved successfully",
  "data": {
    "draftId": "507f1f77bcf86cd799439011",
    "ApplicantsNames": "John Doe",
    "BankName": "Example Bank",
    "createdAt": "2026-06-26T02:40:00.000Z"
  }
}
```

### 2. Get All Drafts
**Endpoint:** `GET /ausmall-finance-form/drafts`
**Authentication:** Public (No authentication required, but filters by user if authenticated)
**Description:** Retrieves all draft forms

**Query Parameters:** None

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "BankName": "Example Bank",
      "ApplicantsNames": "John Doe",
      "status": "draft",
      "createdAt": "2026-06-26T02:40:00.000Z",
      // ... other form fields
    }
  ]
}
```

### 3. Delete Draft
**Endpoint:** `DELETE /ausmall-finance-form/drafts/:draftId`
**Authentication:** Public (No authentication required, but validates ownership if authenticated)
**Description:** Deletes a specific draft

**URL Parameters:**
- `draftId`: The ID of the draft to delete

**Response:**
```json
{
  "success": true,
  "message": "Draft deleted successfully"
}
```

## Key Features

### User Filtering
- If a user is authenticated, drafts are automatically filtered by:
  - `userId`: The user's ID
  - `createdByRole`: The user's role (valuer, site-engineer, technical-engineer, office-engineer)
- This ensures users only see their own drafts

### Status Management
- All drafts are saved with `status: "draft"`
- The `workflowStage` is set to "office-engineer" by default
- Drafts can be submitted later using the existing submit endpoint

### Security
- Public endpoints allow form submission without authentication
- If authenticated, ownership is validated for delete operations
- Drafts are isolated by user and role to prevent unauthorized access

## Usage Example

### Frontend Integration
```javascript
// Save a draft
const saveDraft = async (formData) => {
  const response = await fetch('http://localhost:8080/ausmall-finance-form/save-draft', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Include auth token if user is logged in
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(formData)
  });
  return response.json();
};

// Get all drafts
const getDrafts = async () => {
  const response = await fetch('http://localhost:8080/ausmall-finance-form/drafts', {
    headers: {
      // Include auth token if user is logged in
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// Delete a draft
const deleteDraft = async (draftId) => {
  const response = await fetch(`http://localhost:8080/ausmall-finance-form/drafts/${draftId}`, {
    method: 'DELETE',
    headers: {
      // Include auth token if user is logged in
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

## Testing

### Test Save Draft
```bash
curl -X POST http://localhost:8080/ausmall-finance-form/save-draft \
  -H "Content-Type: application/json" \
  -d '{"BankName":"Test Bank","ApplicantsNames":"Test User"}'
```

### Test Get Drafts
```bash
curl http://localhost:8080/ausmall-finance-form/drafts
```

### Test Delete Draft
```bash
curl -X DELETE http://localhost:8080/ausmall-finance-form/drafts/YOUR_DRAFT_ID
```

## Files Modified
1. `src/controllers/ausmallFinanceFormController.mjs` - Added three new functions
2. `src/router.mjs` - Added three new routes and updated imports

## Notes
- Drafts are stored in the same collection as submitted forms
- The `status` field differentiates drafts from submitted forms
- Drafts can be converted to submitted forms using the existing submit endpoint
- All draft operations include detailed console logging for debugging