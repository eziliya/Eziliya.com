import SalesTeamDocument from '../../models/sales team model/salesTeamUploadModel.mjs';
import uploadfile, { deleteFile } from '../../aws/uploadfile.mjs';
import multer from 'multer';

// Configure multer for memory storage (files stored in buffer)
const storage = multer.memoryStorage();

// File filter to accept only PDF files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

// Multer upload configuration
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

/**
 * Upload a PDF document to AWS S3
 * POST /api/sales-team/upload
 * Public endpoint - no authentication required
 */
export const uploadPdfDocument = async (req, res) => {
    try {
        // Validate file upload
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "PDF file is required"
            });
        }

        // Validate required fields
        const { documentTitle, documentType, description, customerName, firmName, propertyAddress, tags, uploadedBy, userId } = req.body;

        if (!documentTitle || !documentType) {
            return res.status(400).json({
                success: false,
                message: "Document title and type are required"
            });
        }

        console.log(`📄 Sales Team PDF Upload Request:`, {
            documentTitle,
            documentType,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            userId: userId || 'null',
            uploadedBy: uploadedBy || 'sales-team'
        });

        // Upload PDF to AWS S3 in sales-team folder
        const pdfUrl = await uploadfile(req.file, 'sales-team');

        // Parse tags if provided as JSON string
        let parsedTags = [];
        if (tags) {
            try {
                parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            } catch (error) {
                console.warn('Failed to parse tags:', error);
                parsedTags = [];
            }
        }

        // Create document record in database (userId is optional)
        const document = new SalesTeamDocument({
            userId: userId || null,
            documentTitle: documentTitle.trim(),
            documentType,
            pdfFileUrl: pdfUrl,
            originalFileName: req.file.originalname,
            fileSize: req.file.size,
            description: description?.trim() || '',
            customerName: customerName?.trim() || '',
            firmName: firmName?.trim() || '',
            propertyAddress: propertyAddress?.trim() || '',
            tags: parsedTags,
            uploadedBy: uploadedBy || 'sales-team',
            status: 'uploaded'
        });

        // Format file size
        document.formatFileSize();

        // Save to database
        await document.save();

        console.log(`✅ Sales Team PDF uploaded successfully:`, {
            documentId: document._id,
            pdfUrl,
            fileSize: document.fileSizeFormatted
        });

        res.status(201).json({
            success: true,
            message: "PDF document uploaded successfully",
            data: {
                documentId: document._id,
                documentTitle: document.documentTitle,
                documentType: document.documentType,
                pdfFileUrl: document.pdfFileUrl,
                originalFileName: document.originalFileName,
                fileSize: document.fileSizeFormatted,
                uploadedAt: document.uploadedAt,
                status: document.status
            }
        });

    } catch (error) {
        console.error("❌ Error uploading Sales Team PDF document:", error);
        res.status(500).json({
            success: false,
            message: "Failed to upload PDF document",
            error: error.message
        });
    }
};

/**
 * Get all documents for sales team
 * GET /api/sales-team/documents
 */
export const getAllDocuments = async (req, res) => {
    try {
        const { status, documentType, includeDeleted, customerName, firmName, userId } = req.query;

        // Build query - Filter by userId if provided, otherwise show all
        let query = {};
        
        // If userId is provided in query, filter by that user
        if (userId) {
            query.userId = userId;
        }
        
        if (status) {
            query.status = status;
        }
        
        if (documentType) {
            query.documentType = documentType;
        }
        
        if (customerName) {
            query.customerName = { $regex: customerName, $options: 'i' };
        }
        
        if (firmName) {
            query.firmName = { $regex: firmName, $options: 'i' };
        }
        
        if (includeDeleted !== 'true') {
            query.isDeleted = false;
        }

        const documents = await SalesTeamDocument.find(query)
            .populate('userId', 'name email contactNumber role')
            .sort({ createdAt: -1 })
            .select('-__v');

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents,
            message: userId ? `Documents for user ${userId} retrieved successfully` : 'All documents retrieved successfully'
        });

    } catch (error) {
        console.error("❌ Error fetching sales team documents:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch documents",
            error: error.message
        });
    }
};

/**
 * Get a single document by ID
 * GET /api/sales-team/documents/:id
 */
export const getDocumentById = async (req, res) => {
    try {
        const { id } = req.params;

        const document = await SalesTeamDocument.findById(id)
            .populate('userId', 'name email contactNumber')
            .populate('reviewedBy', 'name email')
            .select('-__v');

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        // Check access permissions (if user is authenticated)
        if (req.user && req.user._id) {
            const isOwner = document.userId && document.userId._id.toString() === req.user._id.toString();
            const isSharedWith = document.sharedWith.some(id => id.toString() === req.user._id.toString());
            const isPublic = document.isPublic;

            if (!isOwner && !isSharedWith && !isPublic) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }

        // Record access
        await document.recordAccess();

        res.status(200).json({
            success: true,
            data: document
        });

    } catch (error) {
        console.error("❌ Error fetching sales team document:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch document",
            error: error.message
        });
    }
};

/**
 * Update document metadata
 * PUT /api/sales-team/documents/:id
 */
export const updateDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { documentTitle, description, customerName, firmName, propertyAddress, tags, status } = req.body;

        const document = await SalesTeamDocument.findById(id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        // Check ownership (if user is authenticated)
        if (req.user && req.user._id && document.userId) {
            if (document.userId.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. You can only update your own documents."
                });
            }
        }

        // Update fields
        if (documentTitle) document.documentTitle = documentTitle.trim();
        if (description !== undefined) document.description = description.trim();
        if (customerName !== undefined) document.customerName = customerName.trim();
        if (firmName !== undefined) document.firmName = firmName.trim();
        if (propertyAddress !== undefined) document.propertyAddress = propertyAddress.trim();
        if (tags) document.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
        if (status) document.status = status;

        await document.save();

        res.status(200).json({
            success: true,
            message: "Document updated successfully",
            data: document
        });

    } catch (error) {
        console.error("❌ Error updating sales team document:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update document",
            error: error.message
        });
    }
};

/**
 * Delete a document (soft delete)
 * DELETE /api/sales-team/documents/:id
 */
export const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { permanent } = req.query;

        const document = await SalesTeamDocument.findById(id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        // Check ownership (if user is authenticated)
        if (req.user && req.user._id && document.userId) {
            if (document.userId.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. You can only delete your own documents."
                });
            }
        }

        if (permanent === 'true') {
            // Permanent delete - remove from S3 and database
            try {
                await deleteFile(document.pdfFileUrl);
            } catch (s3Error) {
                console.warn('Failed to delete file from S3:', s3Error);
            }
            
            await SalesTeamDocument.findByIdAndDelete(id);
            
            res.status(200).json({
                success: true,
                message: "Document permanently deleted"
            });
        } else {
            // Soft delete
            await document.softDelete(req.user?._id || null);
            
            res.status(200).json({
                success: true,
                message: "Document deleted successfully"
            });
        }

    } catch (error) {
        console.error("❌ Error deleting sales team document:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete document",
            error: error.message
        });
    }
};

/**
 * Search documents
 * GET /api/sales-team/documents/search
 */
export const searchDocuments = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const userId = req.user?._id || null;
        const documents = await SalesTeamDocument.searchDocuments(userId, q.trim());

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });

    } catch (error) {
        console.error("❌ Error searching sales team documents:", error);
        res.status(500).json({
            success: false,
            message: "Failed to search documents",
            error: error.message
        });
    }
};

