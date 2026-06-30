import TechnicalEngineerDocument from '../models/technicalEngineerModel.mjs';
import uploadfile, { deleteFile } from '../aws/uploadfile.mjs';
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
 * POST /api/technical-engineer/upload
 * Requires authentication and technical-engineer role
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
        const { documentTitle, documentType, description, projectReference, propertyAddress, tags } = req.body;

        if (!documentTitle || !documentType) {
            return res.status(400).json({
                success: false,
                message: "Document title and type are required"
            });
        }

        console.log(`📄 Technical Engineer PDF Upload Request:`, {
            documentTitle,
            documentType,
            fileName: req.file.originalname,
            fileSize: req.file.size
        });

        // Upload PDF to AWS S3 in technical-engineer folder
        const pdfUrl = await uploadfile(req.file, 'technical-engineer');

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

        // Create document record in database (userId is optional now)
        const document = new TechnicalEngineerDocument({
            userId: req.user?._id || null,
            documentTitle: documentTitle.trim(),
            documentType,
            pdfFileUrl: pdfUrl,
            originalFileName: req.file.originalname,
            fileSize: req.file.size,
            description: description?.trim() || '',
            projectReference: projectReference?.trim() || '',
            propertyAddress: propertyAddress?.trim() || '',
            tags: parsedTags,
            status: 'uploaded'
        });

        // Format file size
        document.formatFileSize();

        // Save to database
        await document.save();

        console.log(`✅ PDF uploaded successfully:`, {
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
        console.error("❌ Error uploading PDF document:", error);
        res.status(500).json({
            success: false,
            message: "Failed to upload PDF document",
            error: error.message
        });
    }
};

/**
 * Get all documents for the authenticated technical engineer
 * GET /api/technical-engineer/documents
 */
export const getMyDocuments = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const { status, documentType, includeDeleted } = req.query;

        // Build query
        let query = { userId: req.user._id };
        
        if (status) {
            query.status = status;
        }
        
        if (documentType) {
            query.documentType = documentType;
        }
        
        if (includeDeleted !== 'true') {
            query.isDeleted = false;
        }

        const documents = await TechnicalEngineerDocument.find(query)
            .sort({ createdAt: -1 })
            .select('-__v');

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });

    } catch (error) {
        console.error("❌ Error fetching documents:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch documents",
            error: error.message
        });
    }
};

/**
 * Get a single document by ID
 * GET /api/technical-engineer/documents/:id
 */
export const getDocumentById = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const { id } = req.params;

        const document = await TechnicalEngineerDocument.findById(id)
            .populate('userId', 'name email contactNumber')
            .populate('reviewedBy', 'name email')
            .select('-__v');

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        // Check access permissions
        const isOwner = document.userId._id.toString() === req.user._id.toString();
        const isSharedWith = document.sharedWith.some(id => id.toString() === req.user._id.toString());
        const isPublic = document.isPublic;

        if (!isOwner && !isSharedWith && !isPublic) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        // Record access
        await document.recordAccess();

        res.status(200).json({
            success: true,
            data: document
        });

    } catch (error) {
        console.error("❌ Error fetching document:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch document",
            error: error.message
        });
    }
};

/**
 * Update document metadata (not the PDF file itself)
 * PUT /api/technical-engineer/documents/:id
 */
export const updateDocument = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const { id } = req.params;
        const { documentTitle, description, projectReference, propertyAddress, tags, status } = req.body;

        const document = await TechnicalEngineerDocument.findById(id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        // Check ownership
        if (document.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You can only update your own documents."
            });
        }

        // Update fields
        if (documentTitle) document.documentTitle = documentTitle.trim();
        if (description !== undefined) document.description = description.trim();
        if (projectReference !== undefined) document.projectReference = projectReference.trim();
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
        console.error("❌ Error updating document:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update document",
            error: error.message
        });
    }
};

/**
 * Delete a document (soft delete)
 * DELETE /api/technical-engineer/documents/:id
 */
export const deleteDocument = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const { id } = req.params;
        const { permanent } = req.query;

        const document = await TechnicalEngineerDocument.findById(id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        // Check ownership
        if (document.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You can only delete your own documents."
            });
        }

        if (permanent === 'true') {
            // Permanent delete - remove from S3 and database
            try {
                await deleteFile(document.pdfFileUrl);
            } catch (s3Error) {
                console.warn('Failed to delete file from S3:', s3Error);
            }
            
            await TechnicalEngineerDocument.findByIdAndDelete(id);
            
            res.status(200).json({
                success: true,
                message: "Document permanently deleted"
            });
        } else {
            // Soft delete
            await document.softDelete(req.user._id);
            
            res.status(200).json({
                success: true,
                message: "Document deleted successfully"
            });
        }

    } catch (error) {
        console.error("❌ Error deleting document:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete document",
            error: error.message
        });
    }
};

/**
 * Restore a soft-deleted document
 * POST /api/technical-engineer/documents/:id/restore
 */
export const restoreDocument = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const { id } = req.params;

        const document = await TechnicalEngineerDocument.findById(id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        // Check ownership
        if (document.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        if (!document.isDeleted) {
            return res.status(400).json({
                success: false,
                message: "Document is not deleted"
            });
        }

        await document.restore();

        res.status(200).json({
            success: true,
            message: "Document restored successfully",
            data: document
        });

    } catch (error) {
        console.error("❌ Error restoring document:", error);
        res.status(500).json({
            success: false,
            message: "Failed to restore document",
            error: error.message
        });
    }
};

/**
 * Search documents
 * GET /api/technical-engineer/documents/search
 */
export const searchDocuments = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const { q } = req.query;

        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const documents = await TechnicalEngineerDocument.searchDocuments(req.user._id, q.trim());

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });

    } catch (error) {
        console.error("❌ Error searching documents:", error);
        res.status(500).json({
            success: false,
            message: "Failed to search documents",
            error: error.message
        });
    }
};

/**
 * Share document with other users
 * POST /api/technical-engineer/documents/:id/share
 */
export const shareDocument = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const { id } = req.params;
        const { userIds } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "User IDs array is required"
            });
        }

        const document = await TechnicalEngineerDocument.findById(id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        // Check ownership
        if (document.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You can only share your own documents."
            });
        }

        await document.shareWith(userIds);

        res.status(200).json({
            success: true,
            message: "Document shared successfully",
            data: {
                sharedWith: document.sharedWith
            }
        });

    } catch (error) {
        console.error("❌ Error sharing document:", error);
        res.status(500).json({
            success: false,
            message: "Failed to share document",
            error: error.message
        });
    }
};

/**
 * Get sales team forms assigned to technical engineers for work tasks
 * GET /api/technical-engineer/work-tasks
 * Shows firm contact number instead of applicant name in profile
 */
export const getTechnicalEngineerWorkTasks = async (req, res) => {
    try {
        // Import SalesTeamForm model dynamically to avoid circular dependency
        const { default: SalesTeamForm } = await import('../models/sales team model/salesTeamFormModel.mjs');
        
        const { status, workflowStage } = req.query;
        
        // Build query to show ALL sales team forms (no assignment required)
        let query = {};
        
        // Add optional filters
        if (status) {
            query.status = status;
        }
        
        if (workflowStage) {
            query.workflowStage = workflowStage;
        }
        
        // Exclude deleted forms
        query.isDeleted = { $ne: true };
        
        const forms = await SalesTeamForm.find(query)
            .populate("userId", "name email role contactNumber")
            .populate("updatedBy", "name email role")
            .sort({ createdAt: -1 })
            .select('-__v');
        
        // Transform data to show firm contact number prominently
        const transformedForms = forms.map(form => {
            const formObj = form.toObject();
            
            // Add applicant profile with firm registered mobile number and customer contact numbers
            formObj.applicantProfile = {
                firmRegisteredMobileNumber: formObj.firmRegisteredMobileNumber,
                customerContactNumber: formObj.customerContactNumber,
                alternativeContactNumber: formObj.customerAlternativeContactNumber,
                userId: formObj.userId?._id || null,
                userRole: formObj.userId?.role || null
            };
            
            return formObj;
        });
        
        console.log(`📋 Technical Engineer Work Tasks: Found ${forms.length} sales team forms`);
        
        res.status(200).json({
            success: true,
            count: transformedForms.length,
            data: transformedForms
        });
        
    } catch (error) {
        console.error("❌ Error fetching technical engineer work tasks:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch work tasks",
            error: error.message
        });
    }
};

/**
 * Get a specific sales team form for technical engineer review
 * GET /api/technical-engineer/work-tasks/:formId
 * Shows firm contact number instead of applicant name in profile
 */
export const getTechnicalEngineerWorkTaskById = async (req, res) => {
    try {
        const { default: SalesTeamForm } = await import('../models/sales team model/salesTeamFormModel.mjs');
        
        const { formId } = req.params;
        
        const form = await SalesTeamForm.findById(formId)
            .populate("userId", "name email role contactNumber")
            .populate("updatedBy", "name email role")
            .select('-__v');
        
        if (!form) {
            return res.status(404).json({
                success: false,
                message: "Form not found"
            });
        }
        
        // Technical engineers can view all sales team forms (no assignment check)
        
        // Transform data to show firm contact number prominently
        const formObj = form.toObject();
        
        // Add applicant profile with firm registered mobile number and customer contact numbers
        formObj.applicantProfile = {
            firmRegisteredMobileNumber: formObj.firmRegisteredMobileNumber,
            customerContactNumber: formObj.customerContactNumber,
            alternativeContactNumber: formObj.customerAlternativeContactNumber,
            userId: formObj.userId?._id || null,
            userRole: formObj.userId?.role || null
        };
        
        res.status(200).json({
            success: true,
            data: formObj
        });
        
    } catch (error) {
        console.error("❌ Error fetching work task:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch work task",
            error: error.message
        });
    }
};

/**
 * Update sales team form status by technical engineer
 * PUT /api/technical-engineer/work-tasks/:formId/status
 */
export const updateWorkTaskStatus = async (req, res) => {
    try {
        const { default: SalesTeamForm } = await import('../models/sales team model/salesTeamFormModel.mjs');
        
        const { formId } = req.params;
        const { status, remarks } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required"
            });
        }
        
        const form = await SalesTeamForm.findById(formId);
        
        if (!form) {
            return res.status(404).json({
                success: false,
                message: "Form not found"
            });
        }
        
        // Technical engineers can update any sales team form (no assignment check)
        
        // Update form status
        form.status = status;
        if (remarks) {
            form.remarks = remarks;
        }
        
        if (req.user && req.user._id) {
            form.updatedBy = req.user._id;
        }
        
        form.isUpdated = true;
        
        await form.save();
        
        console.log(`✅ Technical engineer updated form ${formId} status to: ${status}`);
        
        res.status(200).json({
            success: true,
            message: "Work task status updated successfully",
            data: form
        });
        
    } catch (error) {
        console.error("❌ Error updating work task status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update work task status",
            error: error.message
        });
    }
};

// Made with Bob