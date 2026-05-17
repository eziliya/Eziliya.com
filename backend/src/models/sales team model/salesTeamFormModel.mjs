import mongoose from "mongoose";

const salesTeamFormSchema = new mongoose.Schema({
    // User reference (optional for public submissions)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    
    // Firm Information
    firmName: {
        type: String,
        required: true,
        trim: true
    },
    propertyType: {
        type: String,
        required: true,
        enum: [
            "Flat",
            "Banglow",
            "Row-House",
            "Shop",
            "Duplex",
            "Office",
            "Godown",
            "Agriculture-Land",
            "Plot",
            "Apartment",
            "Villa",
            "Industrial"
        ]
    },
    
    // Customer Information
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    customerContactNumber: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/,
        trim: true
    },
    customerAlternativeContactNumber: {
        type: String,
        match: /^[0-9]{10}$/,
        trim: true,
        default: ""
    },
    customerAddress: {
        type: String,
        required: true,
        trim: true
    },
    
    // Financial Information
    propertyUnitRate: {
        type: Number,
        required: true,
        min: 0
    },
    customerPayAmount: {
        type: Number,
        required: true,
        min: 0
    },
    customerLoanAmount: {
        type: Number,
        required: true,
        min: 0
    },
    
    // Document Uploads (URLs from AWS S3 or base64 data)
    aadharCardPhoto: {
        type: String,
        required: true
    },
    panCardPhoto: {
        type: String,
        required: true
    },
    saleDraftPdf: {
        type: String,
        required: true
    },
    propertyValuationReportPdf: {
        type: String,
        required: true
    },
    
    // Workflow and Status Management
    assignedTo: {
        type: String,
        enum: ["admin", "office-engineer", "site-engineer", "technical-engineer", "valuer", "sales-team"],
        default: "sales-team"
    },
    status: {
        type: String,
        enum: ["draft", "submitted", "in-review", "approved", "rejected", "completed"],
        default: "draft"
    },
    workflowStage: {
        type: String,
        enum: ["sales-team", "admin-review", "processing", "completed"],
        default: "sales-team"
    },
    
    // Tracking fields
    isUpdated: {
        type: Boolean,
        default: false
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    submittedAt: {
        type: Date,
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    
    // Additional notes and remarks
    remarks: {
        type: String,
        default: "",
        trim: true
    },
    adminNotes: {
        type: String,
        default: "",
        trim: true
    }
}, {
    timestamps: true
});

// Indexes for better query performance
salesTeamFormSchema.index({ userId: 1 });
salesTeamFormSchema.index({ status: 1 });
salesTeamFormSchema.index({ workflowStage: 1 });
salesTeamFormSchema.index({ customerContactNumber: 1 });
salesTeamFormSchema.index({ createdAt: -1 });

// Virtual for calculating total property value
salesTeamFormSchema.virtual('totalPropertyValue').get(function() {
    return this.customerPayAmount + this.customerLoanAmount;
});

// Method to submit the form
salesTeamFormSchema.methods.submitForm = function() {
    this.status = 'submitted';
    this.workflowStage = 'admin-review';
    this.submittedAt = new Date();
    return this.save();
};

// Method to approve the form
salesTeamFormSchema.methods.approveForm = function(adminId) {
    this.status = 'approved';
    this.workflowStage = 'processing';
    this.approvedAt = new Date();
    this.updatedBy = adminId;
    this.isUpdated = true;
    return this.save();
};

// Method to reject the form
salesTeamFormSchema.methods.rejectForm = function(adminId, reason) {
    this.status = 'rejected';
    this.adminNotes = reason;
    this.updatedBy = adminId;
    this.isUpdated = true;
    return this.save();
};

// Static method to find forms by user
salesTeamFormSchema.statics.findByUser = function(userId) {
    return this.find({ userId }).sort({ createdAt: -1 });
};

// Static method to find forms by status
salesTeamFormSchema.statics.findByStatus = function(status) {
    return this.find({ status }).sort({ createdAt: -1 });
};

// Pre-save middleware to validate financial data
salesTeamFormSchema.pre('save', function(next) {
    // Ensure loan amount and pay amount are positive
    if (this.customerLoanAmount < 0 || this.customerPayAmount < 0 || this.propertyUnitRate < 0) {
        next(new Error('Financial amounts must be positive'));
    }
    next();
});

const SalesTeamForm = mongoose.model('SalesTeamForm', salesTeamFormSchema);

export default SalesTeamForm;

// Made with Bob
