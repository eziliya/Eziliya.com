import mongoose from "mongoose";

/**
 * Sales Team Document Upload Model
 * Handles PDF document uploads to AWS S3 for sales team
 * Supports various document types with metadata tracking
 */
const salesTeamDocumentSchema = new mongoose.Schema({
    // User reference - links to the sales team member who uploaded the document (optional for public uploads)
    // Can be either ObjectId (for registered users) or String (for custom user identifiers)
    userId: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
        index: true
    },
    
    // Document Information
    documentTitle: {
        type: String,
        required: [true, "Document title is required"],
        trim: true,
        maxlength: [200, "Document title cannot exceed 200 characters"]
    },
    
    documentType: {
        type: String,
        required: [true, "Document type is required"],
        enum: {
            values: [
                "sales-report",
                "customer-document",
                "property-document",
                "loan-application",
                "agreement",
                "contract",
                "proposal",
                "quotation",
                "invoice",
                "other"
            ],
            message: "{VALUE} is not a valid document type"
        },
        default: "sales-report"
    },
    
    // PDF File Storage (AWS S3 URL)
    pdfFileUrl: {
        type: String,
        required: [true, "PDF file URL is required"],
        validate: {
            validator: function(v) {
                // Validate S3 URL format
                return /^https:\/\/.*\.s3\..*\.amazonaws\.com\/.*\.pdf$/i.test(v) || 
                       /^https:\/\/.*\.s3\.amazonaws\.com\/.*\.pdf$/i.test(v);
            },
            message: "Invalid S3 PDF URL format"
        }
    },
    
    // Original filename for reference
    originalFileName: {
        type: String,
        required: true,
        trim: true
    },
    
    // File metadata
    fileSize: {
        type: Number,
        required: true,
        min: [0, "File size must be positive"]
    },
    
    fileSizeFormatted: {
        type: String,
        default: ""
    },
    
    // Customer/Project Reference (optional)
    customerName: {
        type: String,
        trim: true,
        default: "",
        maxlength: [100, "Customer name cannot exceed 100 characters"]
    },
    
    firmName: {
        type: String,
        trim: true,
        default: "",
        maxlength: [100, "Firm name cannot exceed 100 characters"]
    },
    
    propertyAddress: {
        type: String,
        trim: true,
        default: "",
        maxlength: [500, "Property address cannot exceed 500 characters"]
    },
    
    // Related form reference (if applicable)
    relatedFormId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SalesTeamForm',
        default: null,
        index: true
    },
    
    relatedFormType: {
        type: String,
        enum: ["sales-team-form", "customer-application", "loan-application", "other", null],
        default: null
    },
    
    // Document Status and Workflow
    status: {
        type: String,
        enum: {
            values: ["draft", "uploaded", "under-review", "approved", "rejected", "archived"],
            message: "{VALUE} is not a valid status"
        },
        default: "uploaded"
    },
    
    // Review and Approval
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    
    reviewedAt: {
        type: Date,
        default: null
    },
    
    reviewComments: {
        type: String,
        trim: true,
        default: "",
        maxlength: [1000, "Review comments cannot exceed 1000 characters"]
    },
    
    // Additional Information
    description: {
        type: String,
        trim: true,
        default: "",
        maxlength: [1000, "Description cannot exceed 1000 characters"]
    },
    
    tags: [{
        type: String,
        trim: true,
        maxlength: [50, "Tag cannot exceed 50 characters"]
    }],
    
    // Version control
    version: {
        type: Number,
        default: 1,
        min: 1
    },
    
    previousVersionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SalesTeamDocument',
        default: null
    },
    
    // Access control
    isPublic: {
        type: Boolean,
        default: false
    },
    
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    
    // Tracking
    uploadedBy: {
        type: String,
        default: "sales-team",
        trim: true
    },
    
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    
    lastAccessedAt: {
        type: Date,
        default: null
    },
    
    accessCount: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // Soft delete
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    
    deletedAt: {
        type: Date,
        default: null
    },
    
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
});

// Compound indexes for better query performance
salesTeamDocumentSchema.index({ userId: 1, status: 1 });
salesTeamDocumentSchema.index({ userId: 1, documentType: 1 });
salesTeamDocumentSchema.index({ userId: 1, createdAt: -1 });
salesTeamDocumentSchema.index({ status: 1, createdAt: -1 });
salesTeamDocumentSchema.index({ relatedFormId: 1, relatedFormType: 1 });
salesTeamDocumentSchema.index({ isDeleted: 1, userId: 1 });
salesTeamDocumentSchema.index({ customerName: 1 });
salesTeamDocumentSchema.index({ firmName: 1 });

// Virtual for formatted upload date
salesTeamDocumentSchema.virtual('uploadedAtFormatted').get(function() {
    return this.uploadedAt ? this.uploadedAt.toLocaleDateString('en-IN') : '';
});

// Method to format file size
salesTeamDocumentSchema.methods.formatFileSize = function() {
    const bytes = this.fileSize;
    if (bytes === 0 || !bytes) {
        this.fileSizeFormatted = '0 Bytes';
        return this.fileSizeFormatted;
    }
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    this.fileSizeFormatted = parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    return this.fileSizeFormatted;
};

// Method to mark document as reviewed
salesTeamDocumentSchema.methods.markAsReviewed = function(reviewerId, comments, approved = true) {
    this.reviewedBy = reviewerId;
    this.reviewedAt = new Date();
    this.reviewComments = comments || '';
    this.status = approved ? 'approved' : 'rejected';
    return this.save();
};

// Method to increment access count
salesTeamDocumentSchema.methods.recordAccess = function() {
    this.accessCount += 1;
    this.lastAccessedAt = new Date();
    return this.save();
};

// Method to soft delete document
salesTeamDocumentSchema.methods.softDelete = function(userId) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = userId;
    return this.save();
};

// Method to restore soft deleted document
salesTeamDocumentSchema.methods.restore = function() {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    return this.save();
};

// Method to share document with users
salesTeamDocumentSchema.methods.shareWith = function(userIds) {
    // Add unique user IDs to sharedWith array
    const uniqueUserIds = [...new Set([...this.sharedWith.map(id => id.toString()), ...userIds.map(id => id.toString())])];
    this.sharedWith = uniqueUserIds;
    return this.save();
};

// Method to create new version
salesTeamDocumentSchema.methods.createNewVersion = function(newPdfUrl, newFileName, newFileSize) {
    const newDoc = new this.constructor({
        userId: this.userId,
        documentTitle: this.documentTitle,
        documentType: this.documentType,
        pdfFileUrl: newPdfUrl,
        originalFileName: newFileName,
        fileSize: newFileSize,
        customerName: this.customerName,
        firmName: this.firmName,
        propertyAddress: this.propertyAddress,
        relatedFormId: this.relatedFormId,
        relatedFormType: this.relatedFormType,
        description: this.description,
        tags: this.tags,
        version: this.version + 1,
        previousVersionId: this._id,
        isPublic: this.isPublic,
        uploadedBy: this.uploadedBy
    });
    return newDoc.save();
};

// Static method to find documents by user
salesTeamDocumentSchema.statics.findByUser = function(userId, includeDeleted = false) {
    const query = { userId };
    if (!includeDeleted) {
        query.isDeleted = false;
    }
    return this.find(query).sort({ createdAt: -1 });
};

// Static method to find documents by type
salesTeamDocumentSchema.statics.findByType = function(documentType, includeDeleted = false) {
    const query = { documentType };
    if (!includeDeleted) {
        query.isDeleted = false;
    }
    return this.find(query).sort({ createdAt: -1 });
};

// Static method to find documents by status
salesTeamDocumentSchema.statics.findByStatus = function(status, includeDeleted = false) {
    const query = { status };
    if (!includeDeleted) {
        query.isDeleted = false;
    }
    return this.find(query).sort({ createdAt: -1 });
};

// Static method to find documents by customer name
salesTeamDocumentSchema.statics.findByCustomer = function(customerName, includeDeleted = false) {
    const query = { 
        customerName: { $regex: customerName, $options: 'i' }
    };
    if (!includeDeleted) {
        query.isDeleted = false;
    }
    return this.find(query).sort({ createdAt: -1 });
};

// Static method to find documents by firm name
salesTeamDocumentSchema.statics.findByFirm = function(firmName, includeDeleted = false) {
    const query = { 
        firmName: { $regex: firmName, $options: 'i' }
    };
    if (!includeDeleted) {
        query.isDeleted = false;
    }
    return this.find(query).sort({ createdAt: -1 });
};

// Static method to find documents by related form
salesTeamDocumentSchema.statics.findByRelatedForm = function(formId, formType) {
    return this.find({ 
        relatedFormId: formId, 
        relatedFormType: formType,
        isDeleted: false 
    }).sort({ createdAt: -1 });
};

// Static method to search documents
salesTeamDocumentSchema.statics.searchDocuments = function(userId, searchTerm) {
    return this.find({
        userId,
        isDeleted: false,
        $or: [
            { documentTitle: { $regex: searchTerm, $options: 'i' } },
            { description: { $regex: searchTerm, $options: 'i' } },
            { customerName: { $regex: searchTerm, $options: 'i' } },
            { firmName: { $regex: searchTerm, $options: 'i' } },
            { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
    }).sort({ createdAt: -1 });
};

// Create and export the model
const SalesTeamDocument = mongoose.models.SalesTeamDocument || 
    mongoose.model('SalesTeamDocument', salesTeamDocumentSchema);

export default SalesTeamDocument;

// Made with Bob