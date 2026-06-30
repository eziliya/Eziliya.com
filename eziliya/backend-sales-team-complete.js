/**
 * Sales Team Backend - Complete Implementation
 * 
 * This file contains all required endpoints for the Sales Team valuation reports feature.
 * 
 * Required packages:
 * npm install express multer mongoose cors dotenv
 */

const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// ============================================
// MONGODB SCHEMA
// ============================================

const salesTeamDocumentSchema = new mongoose.Schema({
  documentTitle: { type: String, required: true },
  originalFileName: { type: String, required: true },
  documentType: { type: String, default: 'sales-report' },
  description: String,
  uploadedBy: { type: String, default: 'sales-team' },
  uploadedByUserId: String,
  userId: String,
  contactNumber: String,
  firmRegisteredMobileNumber: String,
  customerName: String,
  firmName: String,
  tags: [String],
  
  // File information
  pdfFileUrl: String,
  fileSize: Number,
  mimeType: String,
  pdfData: Buffer, // Store PDF as binary (for small files)
  
  // Timestamps
  uploadedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const SalesTeamDocument = mongoose.model('SalesTeamDocument', salesTeamDocumentSchema);

// ============================================
// MULTER CONFIGURATION
// ============================================

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads', 'sales-team');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'sales-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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

// ============================================
// AUTHENTICATION MIDDLEWARE (Optional)
// ============================================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    // For development, allow without token
    console.warn('⚠️ No authentication token provided');
    return next();
  }
  
  // TODO: Verify JWT token here
  // For now, just pass through
  next();
};

// ============================================
// ENDPOINTS
// ============================================

/**
 * GET /sales-team/documents
 * Fetch all documents for a specific user
 */
router.get('/sales-team/documents', authenticateToken, async (req, res) => {
  try {
    const { userId, contactNumber, firmRegisteredMobileNumber } = req.query;
    
    console.log('📡 Fetching documents for:', { userId, contactNumber, firmRegisteredMobileNumber });
    
    if (!userId && !contactNumber && !firmRegisteredMobileNumber) {
      return res.status(400).json({
        success: false,
        message: 'At least one identifier (userId, contactNumber, or firmRegisteredMobileNumber) is required'
      });
    }
    
    // Build query to match any of the identifiers
    const query = {
      $or: []
    };
    
    if (userId) {
      query.$or.push({ userId: userId });
      query.$or.push({ uploadedByUserId: userId });
    }
    
    if (contactNumber) {
      query.$or.push({ contactNumber: contactNumber });
    }
    
    if (firmRegisteredMobileNumber) {
      query.$or.push({ firmRegisteredMobileNumber: firmRegisteredMobileNumber });
    }
    
    // Fetch documents (exclude binary data for list view)
    const documents = await SalesTeamDocument.find(query)
      .select('-pdfData')
      .sort({ uploadedAt: -1 })
      .limit(100);
    
    console.log(`✅ Found ${documents.length} documents`);
    
    res.json({
      success: true,
      data: documents,
      count: documents.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
});

/**
 * POST /sales-team/upload
 * Upload a new PDF document
 */
router.post('/sales-team/upload', authenticateToken, upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }
    
    console.log('📤 Uploading file:', req.file.originalname);
    console.log('📦 Request body:', req.body);
    
    // Parse tags if it's a JSON string
    let tags = [];
    if (req.body.tags) {
      try {
        tags = JSON.parse(req.body.tags);
      } catch (e) {
        tags = [req.body.tags];
      }
    }
    
    // Create file URL
    const pdfFileUrl = `/uploads/sales-team/${req.file.filename}`;
    
    // Create new document
    const newDocument = new SalesTeamDocument({
      documentTitle: req.body.documentTitle || req.file.originalname,
      originalFileName: req.file.originalname,
      documentType: req.body.documentType || 'sales-report',
      description: req.body.description || 'Sales team uploaded document',
      uploadedBy: req.body.uploadedBy || 'sales-team',
      uploadedByUserId: req.body.userId,
      userId: req.body.userId,
      contactNumber: req.body.contactNumber,
      firmRegisteredMobileNumber: req.body.firmRegisteredMobileNumber,
      customerName: req.body.customerName,
      firmName: req.body.firmName,
      tags: tags,
      pdfFileUrl: pdfFileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });
    
    // Save to database
    const savedDocument = await newDocument.save();
    
    console.log('✅ Document saved:', savedDocument._id);
    
    res.status(200).json({
      success: true,
      message: 'PDF uploaded successfully',
      data: {
        fileId: savedDocument._id,
        fileName: savedDocument.originalFileName,
        fileSize: savedDocument.fileSize,
        pdfFileUrl: savedDocument.pdfFileUrl,
        uploadDate: savedDocument.uploadedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    
    // Clean up uploaded file if database save failed
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to delete file:', err);
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload PDF'
    });
  }
});

/**
 * GET /sales-team/download-pdf
 * Download a PDF file
 */
router.get('/sales-team/download-pdf', authenticateToken, async (req, res) => {
  try {
    const { filePath } = req.query;
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: 'filePath parameter is required'
      });
    }
    
    console.log('⬇️ Downloading file:', filePath);
    
    // Sanitize file path to prevent directory traversal
    const sanitizedPath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.join(__dirname, sanitizedPath);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
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
    
    fileStream.on('error', (error) => {
      console.error('❌ File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error streaming file'
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download PDF',
      error: error.message
    });
  }
});

/**
 * DELETE /sales-team/documents/:id
 * Delete a document (optional)
 */
router.delete('/sales-team/documents/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await SalesTeamDocument.findById(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Delete file from filesystem
    if (document.pdfFileUrl) {
      const filePath = path.join(__dirname, document.pdfFileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Delete from database
    await SalesTeamDocument.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
});

// ============================================
// SERVE STATIC FILES
// ============================================

// Serve uploaded files
router.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================
// EXPORT ROUTER
// ============================================

module.exports = router;

/**
 * USAGE EXAMPLE:
 * 
 * // In your main server file (e.g., server.js):
 * const express = require('express');
 * const mongoose = require('mongoose');
 * const cors = require('cors');
 * const salesTeamRoutes = require('./backend-sales-team-complete');
 * 
 * const app = express();
 * 
 * // Middleware
 * app.use(cors());
 * app.use(express.json());
 * 
 * // Connect to MongoDB
 * mongoose.connect('mongodb://localhost:27017/yourdb', {
 *   useNewUrlParser: true,
 *   useUnifiedTopology: true
 * });
 * 
 * // Routes
 * app.use('/api', salesTeamRoutes);
 * 
 * // Start server
 * app.listen(8080, () => {
 *   console.log('Server running on http://localhost:8080');
 * });
 */

// Made with Bob
