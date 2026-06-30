# Sales Team File Viewer - Setup Guide

## ✅ Frontend Implementation Complete

The following features have been implemented on the frontend:

### 1. Sales Team Report Viewer
- **Component**: `src/pages/role wise profile/sale team/SalesTeamReportViewer.jsx`
- **Route**: `/salesteam/report/:fileId`
- **Features**:
  - Professional formatted report view
  - PDF preview with iframe
  - Print, Download, Open in New Tab buttons
  - Responsive design

### 2. File Display in Sales Team Profile
- **Component**: `src/pages/role wise profile/sale team/Salesteam.jsx`
- **Features**:
  - Displays uploaded files in grid layout
  - Three action buttons per file:
    - 📊 View Report (opens report viewer)
    - 👁️ View PDF (opens PDF in new tab)
    - ⬇️ Download (downloads PDF)

### 3. File Upload
- Upload button already exists in Sales Team profile
- Sends files to backend API

---

## 🔧 Backend Requirements

To see uploaded files, you need a backend server running with these endpoints:

### Required API Endpoints:

#### 1. Get User's Uploaded Documents
```
GET /sales-team/documents?userId={userId}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "_id": "document_id",
      "documentTitle": "Sales Team - filename.pdf",
      "originalFileName": "filename.pdf",
      "fileSize": 1024000,
      "fileSizeFormatted": "1.00 MB",
      "pdfFileUrl": "http://localhost:8080/uploads/filename.pdf",
      "documentType": "sales-report",
      "uploadedBy": "sales-team",
      "uploadedAt": "2024-01-01T00:00:00.000Z",
      "tags": ["sales-team", "uploaded-document"]
    }
  ]
}
```

#### 2. Get Single Document (for Report Viewer)
```
GET /sales-team/document/:fileId
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "_id": "document_id",
    "documentTitle": "Sales Team - filename.pdf",
    "originalFileName": "filename.pdf",
    "fileSize": 1024000,
    "fileSizeFormatted": "1.00 MB",
    "pdfFileUrl": "http://localhost:8080/uploads/filename.pdf",
    "documentType": "sales-report",
    "uploadedBy": "sales-team",
    "uploadedAt": "2024-01-01T00:00:00.000Z",
    "description": "Sales team uploaded document",
    "tags": ["sales-team", "uploaded-document"]
  }
}
```

#### 3. Upload Document (Already Implemented)
```
POST /sales-team/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body (FormData):
- pdfFile: File
- documentTitle: String
- documentType: String
- description: String
- uploadedBy: String
- userId: String
- tags: JSON String Array
```

---

## 🚀 How to Test

### Step 1: Start Backend Server
Make sure your backend server is running on `http://localhost:8080`

### Step 2: Upload a File
1. Go to Sales Team profile: `http://localhost:5173/salesteam`
2. Click "📤 Upload PDF File"
3. Select a PDF file
4. File will be uploaded to backend

### Step 3: View Uploaded Files
1. After upload, the file should appear in "My Uploaded Files" section
2. You'll see three buttons:
   - **📊 View Report** - Opens professional report viewer
   - **👁️ View PDF** - Opens PDF in new tab
   - **⬇️ Download** - Downloads the PDF

### Step 4: View Report
1. Click "📊 View Report" button
2. You'll be redirected to `/salesteam/report/{fileId}`
3. See professional formatted report with:
   - Document information
   - PDF preview
   - Print/Download options

---

## 🐛 Troubleshooting

### "No files uploaded yet" Message
**Causes:**
1. Backend server is not running
2. No files have been uploaded
3. Backend API endpoint not configured
4. User authentication issue

**Solutions:**
1. Check if backend is running: `http://localhost:8080`
2. Upload a test PDF file
3. Check browser console for API errors (F12 → Console)
4. Verify user is logged in (check localStorage for 'token' and 'user')

### Files Not Showing After Upload
**Check:**
1. Browser console for errors
2. Network tab (F12 → Network) for API responses
3. Backend logs for errors
4. Database to verify files are saved

### Report Viewer Not Loading
**Check:**
1. File ID is correct in URL
2. Backend `/sales-team/document/:fileId` endpoint exists
3. PDF URL is accessible
4. User has permission to view the file

---

## 📝 Backend Code Example (Node.js/Express)

```javascript
// GET /sales-team/documents
router.get('/sales-team/documents', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Find documents uploaded by this user
    const documents = await Document.find({ 
      userId: userId,
      uploadedBy: 'sales-team'
    }).sort({ uploadedAt: -1 });
    
    res.json({
      success: true,
      data: documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /sales-team/document/:fileId
router.get('/sales-team/document/:fileId', authenticateToken, async (req, res) => {
  try {
    const { fileId } = req.params;
    
    const document = await Document.findById(fileId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

---

## ✅ Current Status

- ✅ Frontend components created
- ✅ Routes configured
- ✅ Styling complete
- ✅ Report viewer functional
- ⚠️ **Backend API endpoints needed**
- ⚠️ **Backend server must be running**

Once the backend is set up and running, the file viewer will work automatically!