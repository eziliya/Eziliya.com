import mongoose from "mongoose";
import uploadfile from "../../aws/uploadfile.mjs";

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
    firmRegisteredMobileNumber: {
        type: String,
        required: true,
        match: /^[0-9]{10}$/,
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

      propertyRatePerSquareFeet: {
        type: Number,
        required: true
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
        enum: ["office-engineer", "site-engineer", "technical-engineer", "valuer", "sales-team"],
        default: "sales-team"
    },
    status: {
        type: String,
        enum: ["draft", "submitted", "in-review", "approved", "rejected", "completed"],
        default: "draft"
    },
    workflowStage: {
        type: String,
        enum: ["sales-team", "office-review", "processing", "completed"],
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
    officeNotes: {
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
salesTeamFormSchema.index({ firmRegisteredMobileNumber: 1 });
salesTeamFormSchema.index({ createdAt: -1 });

// Virtual for calculating total property value
salesTeamFormSchema.virtual('totalPropertyValue').get(function() {
    return this.customerPayAmount + this.customerLoanAmount;
});

// Method to submit the form
salesTeamFormSchema.methods.submitForm = function() {
    this.status = 'submitted';
    this.workflowStage = 'office-review';
    this.submittedAt = new Date();
    return this.save();
};

// Method to approve the form
salesTeamFormSchema.methods.approveForm = function(officeEngineerId) {
    this.status = 'approved';
    this.workflowStage = 'processing';
    this.approvedAt = new Date();
    this.updatedBy = officeEngineerId;
    this.isUpdated = true;
    return this.save();
};

// Method to reject the form
salesTeamFormSchema.methods.rejectForm = function(officeEngineerId, reason) {
    this.status = 'rejected';
    this.officeNotes = reason;
    this.updatedBy = officeEngineerId;
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

// Static method to find forms by contact number
salesTeamFormSchema.statics.findByContactNumber = function(contactNumber) {
    return this.find({
        $or: [
            { customerContactNumber: contactNumber },
            { customerAlternativeContactNumber: contactNumber }
        ]
    }).sort({ createdAt: -1 });
};

// Static method to search forms by customer name
salesTeamFormSchema.statics.searchByCustomerName = function(customerName) {
    return this.find({
        customerName: { $regex: customerName, $options: 'i' }
    }).sort({ createdAt: -1 });
};

// Static method to find forms by firm registered mobile number
salesTeamFormSchema.statics.findByFirmRegisteredMobileNumber = function(mobileNumber) {
    return this.find({ firmRegisteredMobileNumber: mobileNumber }).sort({ createdAt: -1 });
};

// Static method to search forms with multiple criteria
salesTeamFormSchema.statics.searchForms = function(searchCriteria) {
    const query = {};
    
    if (searchCriteria.userId) {
        query.userId = searchCriteria.userId;
    }
    
    if (searchCriteria.contactNumber) {
        query.$or = [
            { customerContactNumber: searchCriteria.contactNumber },
            { customerAlternativeContactNumber: searchCriteria.contactNumber }
        ];
    }
    
    if (searchCriteria.customerName) {
        query.customerName = { $regex: searchCriteria.customerName, $options: 'i' };
    }
    
    if (searchCriteria.firmName) {
        query.firmName = { $regex: searchCriteria.firmName, $options: 'i' };
    }
    
    if (searchCriteria.firmRegisteredMobileNumber) {
        query.firmRegisteredMobileNumber = searchCriteria.firmRegisteredMobileNumber;
    }
    
    if (searchCriteria.status) {
        query.status = searchCriteria.status;
    }
    
    if (searchCriteria.propertyType) {
        query.propertyType = searchCriteria.propertyType;
    }
    
    return this.find(query).sort({ createdAt: -1 });
};

// Validation is handled by Mongoose schema validators (min: 0)
// No need for pre-save middleware

const SalesTeamForm = mongoose.model('SalesTeamForm', salesTeamFormSchema);

export default SalesTeamForm;

