# ⚠️ BACKEND SETUP REQUIRED - Sales Team Valuation Reports

## Current Issue
The valuation reports page cannot fetch data because the backend endpoints are **NOT YET IMPLEMENTED**.

## Error You're Seeing
```
❌ Fetch error: TypeError: Failed to fetch
```

This means the backend server either:
1. Is not running
2. Doesn't have the required endpoints
3. Has CORS issues

## Required Backend Endpoints

### 1. GET /sales-team/documents
**Purpose:** Fetch all documents uploaded by a specific sales team member

**Query Parameters:**
- `userId` - User's unique ID
- `contactNumber` - User's contact number  
- `firmRegisteredMobileNumber` - Firm's registered mobile

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "document_id",
      "documentTitle": "Sales Team - report.pdf",
      "originalFileName": "report.pdf",
      "pdfFileUrl": "/uploads/path/to/file.pdf",
      "fileSize": 1048576,
      "uploadedAt": "2026-06-22T03:00:00.000Z",
      "uploadedBy": "sales-team",
      "userId": "user123",
      "contactNumber": "9876543210",
      "firmRegisteredMobileNumber": "9876543210",
      "documentType": "sales-report",
      "customerName": "John Doe",
      "firmName": "ABC Realty"
    }
  ]
}
```

### 2. POST /sales-team/upload
**Purpose:** Upload PDF files

**Body:** FormData with:
- `pdfFile` - The PDF file
- `documentTitle` - Title of document
- `documentType` - Type (e.g., "sales-report")
- `contactNumber` - User's contact number
- `firmRegisteredMobileNumber` - Firm's mobile

### 3. GET /sales-team/download-pdf
**Purpose:** Download PDF files securely

**Query Parameters:**
- `filePath` - Path to the PDF file

## Quick Start - Backend Implementation

### Option 1: Use the Complete Backend File

I've created `backend-sales-team-complete.js` with all required endpoints.

**To use it:**

1. Install dependencies:
```bash
npm install express multer mongoose cors dotenv
```

2. Create/update your main server file:
```javascript
const express = require('express');
const salesTeamRoutes = require('./backend-sales-team-complete');
const app = express();

app.use(express.json());
app.use('/api', salesTeamRoutes);

app.listen(8080, () => {
  console.log('Server running on port 8080');
});
```

3. Set environment variables in `.env`:
```
MONGODB_URI=mongodb://localhost:27017/yourdb
PORT=8080
JWT_SECRET=your_secret_key
```

4. Start your backend:
```bash
node server.js
```

### Option 2: Minimal Mock Server (For Testing)

If you don't have a backend yet, use this minimal mock server:

```javascript
// mock-server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock data
const mockDocuments = [
  {
    _id: '1',
    documentTitle: 'Sample Valuation Report',
    originalFileName: 'valuation-report-1.pdf',
    pdfFileUrl: '/public/vishal.pdf',
    fileSize: 245678,
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'sales-team',
    userId: 'user123',
    contactNumber: '9876543210',
    documentType: 'sales-report',
    customerName: 'John Doe',
    firmName: 'ABC Realty'
  }
];

app.get('/sales-team/documents', (req, res) => {
  const { userId, contactNumber } = req.query;
  
  // Filter by user
  const filtered = mockDocuments.filter(doc => 
    doc.userId === userId || doc.contactNumber === contactNumber
  );
  
  res.json({
    success: true,
    data: filtered
  });
});

app.post('/sales-team/upload', (req, res) => {
  res.json({
    success: true,
    message: 'PDF uploaded successfully',
    data: {
      fileId: Date.now(),
      fileName: 'uploaded.pdf'
    }
  });
});

app.listen(8080, () => {
  console.log('Mock server running on http://localhost:8080');
});
```

Run it:
```bash
node mock-server.js
```

## Frontend Configuration

Make sure your `.env` file has:
```
VITE_API_BASE_URL=http://localhost:8080
```

## Testing Steps

1. **Start Backend:**
   ```bash
   node server.js
   # or
   node mock-server.js
   ```

2. **Test Endpoint:**
   ```bash
   curl http://localhost:8080/sales-team/documents?userId=user123
   ```

3. **Check Frontend:**
   - Open browser console (F12)
   - Navigate to Sales Team → Valuation Report
   - Look for console logs showing API calls

## Troubleshooting

### "Failed to fetch" Error
- ✅ Check if backend is running on port 8080
- ✅ Check CORS is enabled
- ✅ Verify VITE_API_BASE_URL in .env
- ✅ Check browser console for exact error

### "404 Not Found" Error
- ✅ Endpoint path is wrong
- ✅ Backend routes not registered
- ✅ Check server logs

### Empty Results
- ✅ Database has no documents
- ✅ User filtering is too strict
- ✅ Check userId/contactNumber match

## Next Steps

1. ✅ Implement backend endpoints (use provided files)
2. ✅ Start backend server
3. ✅ Test with curl or Postman
4. ✅ Test frontend integration
5. ✅ Upload a test PDF
6. ✅ View it in valuation reports

---

**Need Help?** Check the console logs (F12) for detailed error messages!