# Sales Team PDF Download Backend Implementation

## Required Backend Endpoint

The frontend now uses a backend proxy endpoint to download PDFs. This solves CORS issues and ensures proper authentication.

### Endpoint Details

**URL:** `GET /sales-team/download-pdf`

**Query Parameters:**
- `filePath` (required): The file path or URL of the PDF to download

**Headers:**
- `Authorization: Bearer <token>` - JWT token for authentication

**Response:**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="<filename>.pdf"`
- Body: PDF file binary data

### Implementation Example (Node.js/Express)

```javascript
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = require('../middleware/auth');

router.get('/sales-team/download-pdf', authenticateToken, async (req, res) => {
  try {
    const { filePath } = req.query;
    
    if (!filePath) {
      return res.status(400).json({ error: 'filePath is required' });
    }

    // Determine if filePath is a full URL or a local path
    let pdfUrl;
    if (filePath.startsWith('http')) {
      pdfUrl = filePath;
    } else {
      // Construct full URL from your storage service
      // Example: AWS S3, local storage, etc.
      const baseUrl = process.env.STORAGE_BASE_URL || 'http://localhost:8080';
      pdfUrl = `${baseUrl}${filePath}`;
    }

    // Fetch the PDF file
    const response = await axios({
      method: 'GET',
      url: pdfUrl,
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'application/pdf',
      },
    });

    // Extract filename from path
    const filename = filePath.split('/').pop() || 'valuation-report.pdf';

    // Set response headers for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', response.data.length);
    res.setHeader('Cache-Control', 'no-cache');

    // Send the PDF data
    res.send(Buffer.from(response.data));

  } catch (error) {
    console.error('PDF download error:', error);
    res.status(500).json({ 
      error: 'Failed to download PDF',
      message: error.message 
    });
  }
});

module.exports = router;
```

### Alternative: Direct File System Access

If PDFs are stored locally on the server:

```javascript
const fs = require('fs');
const path = require('path');

router.get('/sales-team/download-pdf', authenticateToken, async (req, res) => {
  try {
    const { filePath } = req.query;
    
    if (!filePath) {
      return res.status(400).json({ error: 'filePath is required' });
    }

    // Sanitize file path to prevent directory traversal attacks
    const sanitizedPath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(__dirname, '../uploads', sanitizedPath);

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get filename
    const filename = path.basename(fullPath);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    // Stream the file
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('PDF download error:', error);
    res.status(500).json({ 
      error: 'Failed to download PDF',
      message: error.message 
    });
  }
});
```

### Security Considerations

1. **Authentication**: Always verify the JWT token before allowing downloads
2. **Authorization**: Check if the user has permission to access the specific PDF
3. **Path Sanitization**: Prevent directory traversal attacks
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **File Validation**: Verify the file is actually a PDF before serving

### Testing the Endpoint

```bash
# Test with curl
curl -X GET \
  'http://localhost:8080/sales-team/download-pdf?filePath=/uploads/report.pdf' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  --output downloaded.pdf
```

### Frontend Integration

The frontend code in `Salesteam.jsx` now automatically uses this endpoint:

```javascript
const proxyUrl = `${apiUrl}/sales-team/download-pdf?filePath=${encodeURIComponent(filePath)}`;
```

This ensures:
- ✅ Proper authentication
- ✅ CORS handling
- ✅ Offline viewing capability
- ✅ Secure file access