# Sales Team PDF Upload - Backend Implementation Guide

## Error Explanation
The error "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" means:
- The backend endpoint `/sales-team/upload` doesn't exist
- The server is returning an HTML error page (404 or similar) instead of JSON
- You need to create this endpoint in your backend

## Backend Code Required

### Node.js/Express Example with MongoDB

```javascript
// Required packages
const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// MongoDB Schema for Sales Team Uploads
const salesTeamUploadSchema = new mongoose.Schema({
  documentTitle: { type: String, required: true },
  documentType: { type: String, default: 'sales-report' },
  description: String,
  uploadedBy: { type: String, default: 'sales-team' },
  tags: [String],
  fileName: String,
  fileSize: Number,
  mimeType: String,
  pdfData: Buffer, // Store PDF as binary data
  // OR use GridFS for large files
  uploadDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const SalesTeamUpload = mongoose.model('SalesTeamUpload', salesTeamUploadSchema);

// POST /sales-team/upload endpoint
router.post('/sales-team/upload', upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    // Parse tags if it's a JSON string
    let tags = [];
    if (req.body.tags) {
      try {
        tags = JSON.parse(req.body.tags);
      } catch (e) {
        tags = [req.body.tags];
      }
    }

    // Create new upload document
    const newUpload = new SalesTeamUpload({
      documentTitle: req.body.documentTitle || req.file.originalname,
      documentType: req.body.documentType || 'sales-report',
      description: req.body.description || 'Sales team uploaded document',
      uploadedBy: req.body.uploadedBy || 'sales-team',
      tags: tags,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      pdfData: req.file.buffer // Store PDF binary data
    });

    // Save to MongoDB
    const savedUpload = await newUpload.save();

    res.status(200).json({
      success: true,
      message: 'PDF uploaded successfully',
      data: {
        fileId: savedUpload._id,
        fileName: savedUpload.fileName,
        fileSize: savedUpload.fileSize,
        uploadDate: savedUpload.uploadDate
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload PDF'
    });
  }
});

// GET endpoint to retrieve uploaded PDFs (optional)
router.get('/sales-team/uploads', async (req, res) => {
  try {
    const uploads = await SalesTeamUpload.find()
      .select('-pdfData') // Exclude binary data from list
      .sort({ uploadDate: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: uploads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET endpoint to download a specific PDF (optional)
router.get('/sales-team/uploads/:id/download', async (req, res) => {
  try {
    const upload = await SalesTeamUpload.findById(req.params.id);
    
    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${upload.fileName}"`);
    res.send(upload.pdfData);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
```

## Installation Steps

1. **Install required packages:**
```bash
npm install multer mongoose express
```

2. **Add to your main server file (e.g., server.js or app.js):**
```javascript
const salesTeamRoutes = require('./routes/salesTeam'); // adjust path as needed
app.use('/api', salesTeamRoutes); // or just app.use(salesTeamRoutes)
```

3. **Ensure MongoDB is connected:**
```javascript
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yourdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
```

4. **Enable CORS if needed:**
```javascript
const cors = require('cors');
app.use(cors());
```

## Alternative: Using GridFS for Large Files

If you expect large PDF files (>16MB), use GridFS:

```javascript
const { GridFSBucket } = require('mongodb');
const { Readable } = require('stream');

// In your upload endpoint
router.post('/sales-team/upload', upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    const db = mongoose.connection.db;
    const bucket = new GridFSBucket(db, { bucketName: 'salesTeamUploads' });

    // Create readable stream from buffer
    const readableStream = Readable.from(req.file.buffer);

    // Upload to GridFS
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      metadata: {
        documentTitle: req.body.documentTitle,
        documentType: req.body.documentType,
        uploadedBy: req.body.uploadedBy,
        tags: JSON.parse(req.body.tags || '[]'),
        uploadDate: new Date()
      }
    });

    readableStream.pipe(uploadStream);

    uploadStream.on('finish', () => {
      res.status(200).json({
        success: true,
        message: 'PDF uploaded successfully',
        data: {
          fileId: uploadStream.id,
          fileName: req.file.originalname
        }
      });
    });

    uploadStream.on('error', (error) => {
      res.status(500).json({
        success: false,
        message: error.message
      });
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

## Testing the Endpoint

Use Postman or curl to test:

```bash
curl -X POST http://localhost:8080/sales-team/upload \
  -F "pdfFile=@/path/to/test.pdf" \
  -F "documentTitle=Test Document" \
  -F "documentType=sales-report" \
  -F "uploadedBy=sales-team"
```

## Expected Response

```json
{
  "success": true,
  "message": "PDF uploaded successfully",
  "data": {
    "fileId": "507f1f77bcf86cd799439011",
    "fileName": "document.pdf",
    "fileSize": 245678,
    "uploadDate": "2024-01-15T10:30:00.000Z"
  }
}
```

## Troubleshooting

1. **Port mismatch**: Ensure backend runs on port 8080 or update VITE_API_BASE_URL
2. **CORS errors**: Add CORS middleware
3. **File size limit**: Adjust multer limits if needed
4. **MongoDB connection**: Verify MongoDB is running and connected

Once this endpoint is implemented, the frontend will work correctly!