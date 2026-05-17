# Troubleshooting: AU Small Finance Drafts Not Displaying

## Issue: Saved drafts not showing in "Show AU Small Finance Drafts"

### Step-by-Step Debugging Guide

## 1. Check if Draft was Actually Saved

### In the Form (Ausmallfinanceform.jsx):
1. Open browser DevTools (F12)
2. Go to Console tab
3. Fill out the form and click "Save Draft"
4. Look for:
   - Success message: "Draft saved successfully!" or "Draft updated successfully!"
   - Any error messages in console

### What to Check:
- ✅ Green success message appears
- ✅ No red error messages
- ✅ Console shows no errors
- ✅ Network tab shows successful POST/PUT request (Status 200 or 201)

## 2. Verify Backend is Receiving the Request

### Check Network Tab:
1. Open DevTools → Network tab
2. Click "Save Draft"
3. Look for request to: `/ausmall-finance-form/create` or `/ausmall-finance-form/:formId`
4. Check:
   - Status Code: Should be 200 or 201
   - Response: Should contain `form` object with `_id`

### Example Successful Response:
```json
{
  "message": "Ausmall Finance Form created successfully",
  "form": {
    "_id": "507f1f77bcf86cd799439011",
    "applicantName": "John Doe",
    "propertyAddress": "123 Main St",
    "loanAmount": 500000,
    "status": "draft",
    "formData": { ... },
    "createdAt": "2026-05-01T06:00:00.000Z",
    "updatedAt": "2026-05-01T06:00:00.000Z"
  }
}
```

## 3. Check Valuer Profile is Fetching Drafts

### In Valuer Profile (valuer.jsx):
1. Open browser DevTools → Console
2. Navigate to Valuer Profile
3. Click "Show AU Small Finance Drafts"
4. Look for console log: `AU Small Finance Forms Response:`

### What to Check:
```javascript
// Console should show:
AU Small Finance Forms Response: {
  message: "Forms retrieved successfully",
  count: X,
  total: X,
  forms: [ ... ]
}
```

### If forms array is empty `[]`:
- No drafts exist in database
- User might not have permission to view
- Status filter might be wrong

## 4. Verify User Authentication

### Check Token:
1. Open DevTools → Application tab → Local Storage
2. Look for `token` key
3. Copy token value
4. Go to https://jwt.io
5. Paste token and check:
   - Token is not expired
   - `role` field shows "valuer"
   - `userId` is present

## 5. Check Backend Database

### If you have access to MongoDB:
```javascript
// In MongoDB shell or Compass
db.ausmallfinanceforms.find({ status: "draft" })

// Check if documents exist
// Check userId matches your user
// Check status is exactly "draft" (case-sensitive)
```

## 6. Common Issues and Solutions

### Issue 1: "Failed to fetch forms" Alert
**Cause**: Backend endpoint not accessible or authentication failed

**Solutions:**
- Check if backend server is running
- Verify `VITE_API_BASE_URL` in `.env` file
- Check token is valid and not expired
- Verify backend route exists: `GET /ausmall-finance-form/all`

### Issue 2: Forms Array is Empty
**Cause**: No drafts exist or query filter is wrong

**Solutions:**
- Create a new draft first by saving a form
- Check backend query in `getAllAusmallFinanceForms`
- Verify status is "draft" not "Draft" (case-sensitive)
- Check if user role has permission to view forms

### Issue 3: Network Error
**Cause**: CORS or backend not running

**Solutions:**
- Start backend server: `npm start` or `node server.js`
- Check backend CORS configuration
- Verify API_BASE_URL is correct

### Issue 4: Authorization Error (403)
**Cause**: User doesn't have permission

**Solutions:**
- Check user role is "valuer" in database
- Verify JWT token contains correct role
- Check backend authorization middleware

## 7. Manual Testing Steps

### Test 1: Create a Draft
```
1. Go to AU Small Finance Form
2. Fill in at least:
   - Applicant Name
   - Property Address  
   - Loan Amount
3. Click "Save Draft"
4. Verify success message appears
5. Note the form ID from console (if visible)
```

### Test 2: Verify in Profile
```
1. Go to Valuer Profile
2. Click "Show AU Small Finance Drafts"
3. Should see the draft you just created
4. Click "Refresh" button to reload
```

### Test 3: Continue Editing
```
1. Click "Continue Editing" on a draft
2. Form should open with all saved data
3. Make a change
4. Click "Save Draft" again
5. Go back to profile - should show updated timestamp
```

## 8. Debug Console Commands

### Check if forms are being fetched:
```javascript
// In browser console on Valuer Profile page
// After clicking "Show AU Small Finance Drafts"

// You should see:
// AU Small Finance Forms Response: { forms: [...] }
```

### Manual API Test:
```javascript
// In browser console
const token = localStorage.getItem('token');
fetch('http://localhost:3000/ausmall-finance-form/all?status=draft&limit=100', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('Manual fetch result:', data));
```

## 9. Backend Logs to Check

### In backend console, look for:
```
GET /ausmall-finance-form/all?status=draft&limit=100
POST /ausmall-finance-form/create
PUT /ausmall-finance-form/:formId
```

### Check for errors:
- Database connection errors
- Authentication errors
- Validation errors

## 10. Quick Fixes

### Fix 1: Clear Cache and Reload
```
1. Clear browser cache (Ctrl+Shift+Delete)
2. Clear localStorage
3. Log out and log back in
4. Try again
```

### Fix 2: Restart Backend
```
1. Stop backend server (Ctrl+C)
2. Clear any cached data
3. Restart: npm start
4. Try creating draft again
```

### Fix 3: Check Environment Variables
```
# In .env file
VITE_API_BASE_URL=http://localhost:3000

# Make sure no trailing slash
# Make sure port matches backend
```

## 11. Expected Behavior

### When Everything Works:
1. ✅ Save Draft button saves form
2. ✅ Success message appears
3. ✅ Draft appears in Valuer Profile
4. ✅ Draft count shows in button: "Show AU Small Finance Drafts (1)"
5. ✅ Can click Continue Editing
6. ✅ Form loads with saved data
7. ✅ Can update and save again
8. ✅ Can delete draft

## 12. Contact Points

If issue persists after all checks:
1. Check backend logs for errors
2. Verify database connection
3. Test with Postman/Thunder Client
4. Check MongoDB documents directly
5. Review backend controller logic

## Additional Debug Info to Collect

When reporting issues, provide:
- Browser console logs
- Network tab screenshots
- Backend console logs
- User role and ID
- MongoDB query results
- Environment variables (without sensitive data)

---
**Last Updated**: 2026-05-01
**Made with Bob**