import SalesTeamForm from "../../models/sales team model/salesTeamFormModel.mjs";
import uploadfile from "../../aws/uploadfile.mjs";
import multer from "multer";

// Configure multer for memory storage (files stored in buffer)
const storage = multer.memoryStorage();

// Multer upload configuration for sales team forms
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit per file (increased for large PDFs)
        files: 4 // Maximum 4 files
    },
    fileFilter: (req, file, cb) => {
        // Accept images and PDFs
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only images and PDF files are allowed!'), false);
        }
    }
});


// Create a new Sales Team Form (Public - No Authentication Required)
export const createSalesTeamFormPublic = async (req, res) => {
    try {
        console.log("=== Sales Team Form Submission Started ===");
        console.log("Request Body:", req.body);
        console.log("Request Files:", req.files);
        console.log("Property Rate Per Square Feet from req.body:", req.body.propertyRatePerSquareFeet);
        
        // Validate required fields
        const requiredFields = ['firmName', 'firmRegisteredMobileNumber', 'propertyType', 'customerName', 'customerContactNumber',
                               'customerAddress', 'propertyUnitRate', 'propertyRatePerSquareFeet', 'customerPayAmount', 'customerLoanAmount'];
        
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required field: ${field}`
                });
            }
        }

        // Validate required files (req.files is an object when using upload.fields())
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No files uploaded. Please upload all required documents."
            });
        }

        const requiredFileFields = ['aadharCardPhoto', 'panCardPhoto', 'saleDraftPdf', 'propertyValuationReportPdf'];
        
        for (const field of requiredFileFields) {
            if (!req.files[field] || req.files[field].length === 0) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required file: ${field}`
                });
            }
        }
        
        // Handle file uploads with organized folders
        const fileUploads = {};
        
        console.log(`📤 Processing files for Sales Team Form...`);
        
        // Process each file field (req.files is an object with arrays)
        if (req.files.aadharCardPhoto && req.files.aadharCardPhoto[0]) {
            const file = req.files.aadharCardPhoto[0];
            const folder = 'sales-team/documents/aadhar';
            const aadharUrl = await uploadfile(file, folder);
            fileUploads.aadharCardPhoto = aadharUrl;
            console.log("✅ Aadhar Card uploaded:", aadharUrl);
        }
        
        if (req.files.panCardPhoto && req.files.panCardPhoto[0]) {
            const file = req.files.panCardPhoto[0];
            const folder = 'sales-team/documents/pan';
            const panUrl = await uploadfile(file, folder);
            fileUploads.panCardPhoto = panUrl;
            console.log("✅ PAN Card uploaded:", panUrl);
        }
        
        if (req.files.saleDraftPdf && req.files.saleDraftPdf[0]) {
            const file = req.files.saleDraftPdf[0];
            const folder = 'sales-team/drafts';
            const saleDraftUrl = await uploadfile(file, folder);
            fileUploads.saleDraftPdf = saleDraftUrl;
            console.log("✅ Sale Draft uploaded:", saleDraftUrl);
        }
        
        if (req.files.propertyValuationReportPdf && req.files.propertyValuationReportPdf[0]) {
            const file = req.files.propertyValuationReportPdf[0];
            const folder = 'sales-team/valuation-reports';
            const valuationUrl = await uploadfile(file, folder);
            fileUploads.propertyValuationReportPdf = valuationUrl;
            console.log("✅ Valuation Report uploaded:", valuationUrl);
        }

        // Verify all files were uploaded
        if (Object.keys(fileUploads).length !== requiredFileFields.length) {
            throw new Error("Not all required files were uploaded successfully");
        }

        const formData = {
            ...req.body,
            ...fileUploads,
            userId: null,
            assignedTo: "sales-team",
            status: "submitted",
            workflowStage: "sales-team",
            submittedAt: new Date()
        };

        console.log("💾 Saving form data to MongoDB...");
        console.log("Form data to save:", JSON.stringify(formData, null, 2));
        console.log("Property Rate Per Square Feet in formData:", formData.propertyRatePerSquareFeet);

        const newForm = new SalesTeamForm(formData);
        const savedForm = await newForm.save();
        
        console.log("✅ Form saved to database with ID:", savedForm._id);
        console.log("=== Sales Team Form Submission Completed Successfully ===");

        // Return success response
        return res.status(201).json({
            success: true,
            message: "Form submitted successfully",
            data: {
                formId: savedForm._id,
                customerName: savedForm.customerName,
                firmName: savedForm.firmName,
                status: savedForm.status,
                workflowStage: savedForm.workflowStage,
                submittedAt: savedForm.submittedAt
            }
        });
    } catch (error) {
        console.error("=== Error creating Sales Team Form ===");
        console.error("Error Details:", error);
        console.error("Error Stack:", error.stack);
        res.status(500).json({
            success: false,
            message: "Failed to submit form",
            error: error.message
        });
    }
};

// Create a new Sales Team Form (Authenticated)
export const createSalesTeamForm = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Handle file uploads
        const fileUploads = {};
        
        // Upload files with organized folders
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                if (file.fieldname === 'aadharCardPhoto') {
                    const aadharUrl = await uploadfile(file, 'sales-team/documents/aadhar');
                    fileUploads.aadharCardPhoto = aadharUrl;
                }
                if (file.fieldname === 'panCardPhoto') {
                    const panUrl = await uploadfile(file, 'sales-team/documents/pan');
                    fileUploads.panCardPhoto = panUrl;
                }
                if (file.fieldname === 'saleDraftPdf') {
                    const saleDraftUrl = await uploadfile(file, 'sales-team/drafts');
                    fileUploads.saleDraftPdf = saleDraftUrl;
                }
                if (file.fieldname === 'propertyValuationReportPdf') {
                    const valuationUrl = await uploadfile(file, 'sales-team/valuation-reports');
                    fileUploads.propertyValuationReportPdf = valuationUrl;
                }
            }
        }

        const formData = {
            ...req.body,
            ...fileUploads,
            userId,
            assignedTo: "sales-team",
            status: "draft",
            workflowStage: "sales-team"
        };

        const newForm = new SalesTeamForm(formData);
        await newForm.save();

        res.status(201).json({
            success: true,
            message: "Sales Team Form created successfully",
            data: newForm
        });
    } catch (error) {
        console.error("Error creating Sales Team Form:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create form",
            error: error.message
        });
    }
};

// Submit Sales Team Form for review
export const submitSalesTeamForm = async (req, res) => {
    try {
        const { formId } = req.params;
        const userId = req.user._id;

        const form = await SalesTeamForm.findById(formId);
        
        if (!form) {
            return res.status(404).json({
                success: false,
                message: "Form not found"
            });
        }

        // Check if user owns the form
        if (form.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to submit this form"
            });
        }

        // Use the model method to submit
        await form.submitForm();

        res.status(200).json({
            success: true,
            message: "Form submitted successfully for review",
            data: form
        });
    } catch (error) {
        console.error("Error submitting form:", error);
        res.status(500).json({
            success: false,
            message: "Failed to submit form",
            error: error.message
        });
    }
};

// Get all Sales Team Forms (Office Engineer only)
export const getAllSalesTeamForms = async (req, res) => {
    try {
        const forms = await SalesTeamForm
            .find()
            .populate("userId", "name email role")
            .populate("updatedBy", "name email role")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: forms.length,
            data: forms
        });
    } catch (error) {
        console.error("Error fetching forms:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch forms",
            error: error.message
        });
    }
};

// Get forms created by the logged-in user
export const getMySalesTeamForms = async (req, res) => {
    try {
        const userId = req.user._id;
        const forms = await SalesTeamForm
            .find({ userId })
            .populate("userId", "name email role")
            .populate("updatedBy", "name email role")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: forms.length,
            data: forms
        });
    } catch (error) {
        console.error("Error fetching my forms:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch forms",
            error: error.message
        });
    }
};

// Get a single Sales Team Form by ID
export const getSalesTeamFormById = async (req, res) => {
    try {
        const { formId } = req.params;
        const form = await SalesTeamForm
            .findById(formId)
            .populate("userId", "name email role")
            .populate("updatedBy", "name email role");

        if (!form) {
            return res.status(404).json({
                success: false,
                message: "Form not found"
            });
        }

        res.status(200).json({
            success: true,
            data: form
        });
    } catch (error) {
        console.error("Error fetching form:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch form",
            error: error.message
        });
    }
};

// Update Sales Team Form (Public - No Authentication)
export const updateSalesTeamForm = async (req, res) => {
    try {
        const { formId } = req.params;

        const form = await SalesTeamForm.findById(formId);
        
        if (!form) {
            return res.status(404).json({
                success: false,
                message: "Form not found"
            });
        }

        // Handle file uploads if any
        const fileUploads = {};
        
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                if (file.fieldname === 'aadharCardPhoto') {
                    const aadharUrl = await uploadfile(file, 'sales-team/documents/aadhar');
                    fileUploads.aadharCardPhoto = aadharUrl;
                }
                if (file.fieldname === 'panCardPhoto') {
                    const panUrl = await uploadfile(file, 'sales-team/documents/pan');
                    fileUploads.panCardPhoto = panUrl;
                }
                if (file.fieldname === 'saleDraftPdf') {
                    const saleDraftUrl = await uploadfile(file, 'sales-team/drafts');
                    fileUploads.saleDraftPdf = saleDraftUrl;
                }
                if (file.fieldname === 'propertyValuationReportPdf') {
                    const valuationUrl = await uploadfile(file, 'sales-team/valuation-reports');
                    fileUploads.propertyValuationReportPdf = valuationUrl;
                }
            }
        }

        const updateData = {
            ...req.body,
            ...fileUploads,
            isUpdated: true
        };

        const updatedForm = await SalesTeamForm.findByIdAndUpdate(
            formId,
            updateData,
            { new: true, runValidators: true }
        ).populate("userId", "name email role")
         .populate("updatedBy", "name email role");

        res.status(200).json({
            success: true,
            message: "Form updated successfully",
            data: updatedForm
        });
    } catch (error) {
        console.error("Error updating form:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update form",
            error: error.message
        });
    }
};

// Delete Sales Team Form (Public - No Authentication)
export const deleteSalesTeamForm = async (req, res) => {
    try {
        const { formId } = req.params;

        const form = await SalesTeamForm.findById(formId);
        
        if (!form) {
            return res.status(404).json({
                success: false,
                message: "Form not found"
            });
        }

        await SalesTeamForm.findByIdAndDelete(formId);

        res.status(200).json({
            success: true,
            message: "Form deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting form:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete form",
            error: error.message
        });
    }
};

// Approve Sales Team Form (Office Engineer only)
export const approveSalesTeamForm = async (req, res) => {
    try {
        const { formId } = req.params;
        const officeEngineerId = req.user._id;

        const form = await SalesTeamForm.findById(formId);
        
        if (!form) {
            return res.status(404).json({
                success: false,
                message: "Form not found"
            });
        }

        // Use the model method to approve
        await form.approveForm(officeEngineerId);

        res.status(200).json({
            success: true,
            message: "Form approved successfully",
            data: form
        });
    } catch (error) {
        console.error("Error approving form:", error);
        res.status(500).json({
            success: false,
            message: "Failed to approve form",
            error: error.message
        });
    }
};

// Reject Sales Team Form (Office Engineer only)
export const rejectSalesTeamForm = async (req, res) => {
    try {
        const { formId } = req.params;
        const officeEngineerId = req.user._id;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required"
            });
        }

        const form = await SalesTeamForm.findById(formId);
        
        if (!form) {
            return res.status(404).json({
                success: false,
                message: "Form not found"
            });
        }

        // Use the model method to reject
        await form.rejectForm(officeEngineerId, reason);

        res.status(200).json({
            success: true,
            message: "Form rejected successfully",
            data: form
        });
    } catch (error) {
        console.error("Error rejecting form:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reject form",
            error: error.message
        });
    }
};

// Get forms by status
export const getSalesTeamFormsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const validStatuses = ["draft", "submitted", "in-review", "approved", "rejected", "completed"];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status specified"
            });
        }

        const forms = await SalesTeamForm
            .find({ status })
            .populate("userId", "name email role")
            .populate("updatedBy", "name email role")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: forms.length,
            data: forms
        });
    } catch (error) {
        console.error("Error fetching forms by status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch forms",
            error: error.message
        });
    }
};

// Get forms statistics (Office Engineer only)
export const getSalesTeamFormsStats = async (req, res) => {
    try {
        const totalForms = await SalesTeamForm.countDocuments();
        const draftForms = await SalesTeamForm.countDocuments({ status: "draft" });
        const submittedForms = await SalesTeamForm.countDocuments({ status: "submitted" });
        const approvedForms = await SalesTeamForm.countDocuments({ status: "approved" });
        const rejectedForms = await SalesTeamForm.countDocuments({ status: "rejected" });
        const completedForms = await SalesTeamForm.countDocuments({ status: "completed" });

        res.status(200).json({
            success: true,
            data: {
                total: totalForms,
                draft: draftForms,
                submitted: submittedForms,
                approved: approvedForms,
                rejected: rejectedForms,
                completed: completedForms
            }
        });
    } catch (error) {
        console.error("Error fetching forms statistics:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch statistics",
            error: error.message
        });
    }
};




// Save Sales Team Form as Draft (Public - No Authentication Required)
export const saveSalesTeamFormDraft = async (req, res) => {
    try {
        console.log("=== Sales Team Draft Save Started ===");
        console.log("Request Body:", req.body);
        console.log("Request Files:", req.files);
        
        // Handle file uploads with organized folders
        const fileUploads = {};
        
        if (req.files && Object.keys(req.files).length > 0) {
            console.log(`📤 Processing files for draft...`);
            
            // Process each file field (req.files is an object with arrays)
            if (req.files.aadharCardPhoto && req.files.aadharCardPhoto[0]) {
                const file = req.files.aadharCardPhoto[0];
                const folder = 'sales-team/drafts/aadhar';
                const aadharUrl = await uploadfile(file, folder);
                fileUploads.aadharCardPhoto = aadharUrl;
                console.log("✅ Aadhar Card uploaded:", aadharUrl);
            }
            
            if (req.files.panCardPhoto && req.files.panCardPhoto[0]) {
                const file = req.files.panCardPhoto[0];
                const folder = 'sales-team/drafts/pan';
                const panUrl = await uploadfile(file, folder);
                fileUploads.panCardPhoto = panUrl;
                console.log("✅ PAN Card uploaded:", panUrl);
            }
            
            if (req.files.saleDraftPdf && req.files.saleDraftPdf[0]) {
                const file = req.files.saleDraftPdf[0];
                const folder = 'sales-team/drafts/sale-docs';
                const saleDraftUrl = await uploadfile(file, folder);
                fileUploads.saleDraftPdf = saleDraftUrl;
                console.log("✅ Sale Draft uploaded:", saleDraftUrl);
            }
            
            if (req.files.propertyValuationReportPdf && req.files.propertyValuationReportPdf[0]) {
                const file = req.files.propertyValuationReportPdf[0];
                const folder = 'sales-team/drafts/valuation';
                const valuationUrl = await uploadfile(file, folder);
                fileUploads.propertyValuationReportPdf = valuationUrl;
                console.log("✅ Valuation Report uploaded:", valuationUrl);
            }
        }

        // Provide default values for required fields if not present
        const formData = {
            firmName: req.body.firmName || "Draft",
            firmRegisteredMobileNumber: req.body.firmRegisteredMobileNumber || "0000000000",
            propertyType: req.body.propertyType || "Flat",
            customerName: req.body.customerName || "Draft Customer",
            customerContactNumber: req.body.customerContactNumber || "0000000000",
            customerAlternativeContactNumber: req.body.customerAlternativeContactNumber || "",
            customerAddress: req.body.customerAddress || "Draft Address",
            propertyUnitRate: req.body.propertyUnitRate || 0,
            propertyRatePerSquareFeet: req.body.propertyRatePerSquareFeet || 0,
            customerPayAmount: req.body.customerPayAmount || 0,
            customerLoanAmount: req.body.customerLoanAmount || 0,
            aadharCardPhoto: fileUploads.aadharCardPhoto || "draft",
            panCardPhoto: fileUploads.panCardPhoto || "draft",
            saleDraftPdf: fileUploads.saleDraftPdf || "draft",
            propertyValuationReportPdf: fileUploads.propertyValuationReportPdf || "draft",
            userId: null,
            assignedTo: "sales-team",
            status: "draft",
            workflowStage: "sales-team",
            remarks: "Auto-saved draft"
        };

        console.log("💾 Saving draft to MongoDB...");

        const newDraft = new SalesTeamForm(formData);
        const savedDraft = await newDraft.save({ validateBeforeSave: false });
        
        console.log("✅ Draft saved to database with ID:", savedDraft._id);
        console.log("=== Sales Team Draft Save Completed ===");

        return res.status(201).json({
            success: true,
            message: "Draft saved successfully",
            data: {
                draftId: savedDraft._id,
                customerName: savedDraft.customerName,
                firmName: savedDraft.firmName,
                createdAt: savedDraft.createdAt
            }
        });
    } catch (error) {
        console.error("=== Error saving Sales Team Draft ===");
        console.error("Error Details:", error);
        console.error("Error Stack:", error.stack);
        res.status(500).json({
            success: false,
            message: "Failed to save draft",
            error: error.message
        });
    }
};

// Get all Sales Team Form Drafts (Public - No Authentication Required)
export const getAllSalesTeamFormDrafts = async (req, res) => {
    try {
        console.log("=== Fetching Sales Team Drafts ===");
        
        const drafts = await SalesTeamForm
            .find({ status: "draft" })
            .sort({ createdAt: -1 });

        console.log(`✅ Found ${drafts.length} drafts`);

        res.status(200).json({
            success: true,
            count: drafts.length,
            data: drafts
        });
    } catch (error) {
        console.error("=== Error fetching drafts ===");
        console.error("Error Details:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch drafts",
            error: error.message
        });
    }
};

// Delete Sales Team Form Draft (Public - No Authentication Required)
export const deleteSalesTeamFormDraft = async (req, res) => {
    try {
        const { draftId } = req.params;
        console.log("=== Deleting Sales Team Draft ===");
        console.log("Draft ID:", draftId);

        const draft = await SalesTeamForm.findById(draftId);
        
        if (!draft) {
            return res.status(404).json({
                success: false,
                message: "Draft not found"
            });
        }

        // Only allow deletion of drafts
        if (draft.status !== "draft") {
            return res.status(400).json({
                success: false,
                message: "Only drafts can be deleted using this endpoint"
            });
        }

        await SalesTeamForm.findByIdAndDelete(draftId);
        console.log("✅ Draft deleted successfully");

        res.status(200).json({
            success: true,
            message: "Draft deleted successfully"
        });
    } catch (error) {
        console.error("=== Error deleting draft ===");
        console.error("Error Details:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete draft",
            error: error.message
        });
    }
};

// Assign Sales Team Form to Technical Engineer (Office Engineer only)
export const assignFormToTechnicalEngineer = async (req, res) => {
    try {
        const { formId } = req.params;
        const { technicalEngineerId, remarks } = req.body;

        const form = await SalesTeamForm.findById(formId);
        
        if (!form) {
            return res.status(404).json({
                success: false,
                message: "Form not found"
            });
        }

        // Update form assignment
        form.assignedTo = "technical-engineer";
        form.workflowStage = "processing";
        form.status = "in-review";
        
        if (remarks) {
            form.officeNotes = remarks;
        }
        
        if (req.user && req.user._id) {
            form.updatedBy = req.user._id;
        }
        
        form.isUpdated = true;

        await form.save();

        console.log(`✅ Form ${formId} assigned to technical engineer`);

        res.status(200).json({
            success: true,
            message: "Form assigned to technical engineer successfully",
            data: form
        });
    } catch (error) {
        console.error("Error assigning form to technical engineer:", error);
        res.status(500).json({
            success: false,
            message: "Failed to assign form",
            error: error.message
        });
    }
};

// Get forms assigned to technical engineers (Office Engineer view)
export const getFormsAssignedToTechnicalEngineers = async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = { assignedTo: "technical-engineer" };
        
        if (status) {
            query.status = status;
        }

        const forms = await SalesTeamForm
            .find(query)
            .populate("userId", "name email role")
            .populate("updatedBy", "name email role")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: forms.length,
            data: forms
        });
    } catch (error) {
        console.error("Error fetching forms assigned to technical engineers:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch forms",
            error: error.message
        });
    }
};

// Get all technical engineer uploaded reports (valuation reports) for sales team view
export const getAllTechnicalEngineerReports = async (req, res) => {
    try {
        // Import TechnicalEngineerDocument model
        const { default: TechnicalEngineerDocument } = await import('../../models/technicalEngineerModel.mjs');
        
        const { status, documentType, userId } = req.query;
        
        // Build query
        let query = { isDeleted: false };
        
        // Filter by userId if provided (so each sales team member sees only their reports)
        if (userId) {
            query.userId = userId;
        }
        
        // Filter by status if provided
        if (status) {
            query.status = status;
        }
        
        // Filter by document type if provided
        if (documentType) {
            query.documentType = documentType;
        }
        
        // Fetch technical engineer documents (valuation reports)
        const reports = await TechnicalEngineerDocument.find(query)
            .populate("userId", "name email role contactNumber")
            .populate("reviewedBy", "name email role")
            .sort({ createdAt: -1 })
            .select('-__v');
        
        console.log(`📋 Sales Team View: Found ${reports.length} technical engineer reports${userId ? ` for user ${userId}` : ''}`);
        
        res.status(200).json({
            success: true,
            count: reports.length,
            data: reports,
            message: userId ? `Reports for user ${userId} retrieved successfully` : 'All reports retrieved successfully'
        });
        
    } catch (error) {
        console.error("Error fetching technical engineer reports:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch technical engineer reports",
            error: error.message
        });
    }
};

// Get a specific technical engineer report by ID for sales team view
export const getTechnicalEngineerReportById = async (req, res) => {
    try {
        const { default: TechnicalEngineerDocument } = await import('../../models/technicalEngineerModel.mjs');
        
        const { reportId } = req.params;
        
        const report = await TechnicalEngineerDocument.findById(reportId)
            .populate("userId", "name email role contactNumber")
            .populate("reviewedBy", "name email role")
            .select('-__v');
        
        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found"
            });
        }
        
        if (report.isDeleted) {
            return res.status(404).json({
                success: false,
                message: "Report has been deleted"
            });
        }
        
        // Record access
        await report.recordAccess();
        
        console.log(`📄 Sales Team viewing report: ${reportId}`);
        
        res.status(200).json({
            success: true,
            data: report
        });
        
    } catch (error) {
        console.error("Error fetching technical engineer report:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch report",
            error: error.message
        });
    }
};

// Search Sales Team Forms by User ID
export const searchFormsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        
        console.log(`🔍 Searching forms for User ID: ${userId}`);
        
        const forms = await SalesTeamForm
            .findByUser(userId)
            .populate("userId", "name email role contactNumber")
            .populate("updatedBy", "name email role");
        
        console.log(`✅ Found ${forms.length} forms for User ID: ${userId}`);
        
        res.status(200).json({
            success: true,
            count: forms.length,
            searchCriteria: { userId },
            data: forms
        });
    } catch (error) {
        console.error("Error searching forms by user ID:", error);
        res.status(500).json({
            success: false,
            message: "Failed to search forms by user ID",
            error: error.message
        });
    }
};

// Search Sales Team Forms by Contact Number
export const searchFormsByContactNumber = async (req, res) => {
    try {
        const { contactNumber } = req.params;
        
        // Validate contact number format
        if (!/^[0-9]{10}$/.test(contactNumber)) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact number format. Must be 10 digits."
            });
        }
        
        console.log(`🔍 Searching forms for Contact Number: ${contactNumber}`);
        
        const forms = await SalesTeamForm
            .findByContactNumber(contactNumber)
            .populate("userId", "name email role contactNumber")
            .populate("updatedBy", "name email role");
        
        console.log(`✅ Found ${forms.length} forms for Contact Number: ${contactNumber}`);
        
        res.status(200).json({
            success: true,
            count: forms.length,
            searchCriteria: { contactNumber },
            data: forms
        });
    } catch (error) {
        console.error("Error searching forms by contact number:", error);
        res.status(500).json({
            success: false,
            message: "Failed to search forms by contact number",
            error: error.message
        });
    }
};

// Search Sales Team Forms by Customer Name
export const searchFormsByCustomerName = async (req, res) => {
    try {
        const { customerName } = req.params;
        
        if (!customerName || customerName.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Customer name must be at least 2 characters long"
            });
        }
        
        console.log(`🔍 Searching forms for Customer Name: ${customerName}`);
        
        const forms = await SalesTeamForm
            .searchByCustomerName(customerName)
            .populate("userId", "name email role contactNumber")
            .populate("updatedBy", "name email role");
        
        console.log(`✅ Found ${forms.length} forms for Customer Name: ${customerName}`);
        
        res.status(200).json({
            success: true,
            count: forms.length,
            searchCriteria: { customerName },
            data: forms
        });
    } catch (error) {
        console.error("Error searching forms by customer name:", error);
        res.status(500).json({
            success: false,
            message: "Failed to search forms by customer name",
            error: error.message
        });
    }
};

// Advanced Search Sales Team Forms (Multiple criteria)
export const advancedSearchForms = async (req, res) => {
    try {
        const searchCriteria = {};
        
        // Extract search parameters from query string
        if (req.query.userId) {
            searchCriteria.userId = req.query.userId;
        }
        
        if (req.query.contactNumber) {
            // Validate contact number format
            if (!/^[0-9]{10}$/.test(req.query.contactNumber)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid contact number format. Must be 10 digits."
                });
            }
            searchCriteria.contactNumber = req.query.contactNumber;
        }
        
        if (req.query.customerName) {
            searchCriteria.customerName = req.query.customerName;
        }
        
        if (req.query.firmName) {
            searchCriteria.firmName = req.query.firmName;
        }
        
        if (req.query.firmRegisteredMobileNumber) {
            searchCriteria.firmRegisteredMobileNumber = req.query.firmRegisteredMobileNumber;
        }
        
        if (req.query.status) {
            searchCriteria.status = req.query.status;
        }
        
        if (req.query.propertyType) {
            searchCriteria.propertyType = req.query.propertyType;
        }
        
        // Check if at least one search criterion is provided
        if (Object.keys(searchCriteria).length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one search criterion is required"
            });
        }
        
        console.log(`🔍 Advanced search with criteria:`, searchCriteria);
        
        const forms = await SalesTeamForm
            .searchForms(searchCriteria)
            .populate("userId", "name email role contactNumber")
            .populate("updatedBy", "name email role");
        
        console.log(`✅ Found ${forms.length} forms matching criteria`);
        
        res.status(200).json({
            success: true,
            count: forms.length,
            searchCriteria,
            data: forms
        });
    } catch (error) {
        console.error("Error performing advanced search:", error);
        res.status(500).json({
            success: false,
            message: "Failed to perform advanced search",
            error: error.message
        });
    }
};

// Get Customer Profile with All Submitted Forms (by User ID or Contact Number)
export const getCustomerProfile = async (req, res) => {
    try {
        const { identifier } = req.params; // Can be userId or contactNumber
        
        console.log(`🔍 Fetching customer profile for identifier: ${identifier}`);
        
        let forms;
        let searchType;
        
        // Check if identifier is a valid MongoDB ObjectId (userId)
        if (/^[0-9a-fA-F]{24}$/.test(identifier)) {
            searchType = "userId";
            forms = await SalesTeamForm
                .findByUser(identifier)
                .populate("userId", "name email role contactNumber")
                .populate("updatedBy", "name email role");
        }
        // Check if identifier is a 10-digit contact number
        else if (/^[0-9]{10}$/.test(identifier)) {
            searchType = "contactNumber";
            forms = await SalesTeamForm
                .findByContactNumber(identifier)
                .populate("userId", "name email role contactNumber")
                .populate("updatedBy", "name email role");
        }
        else {
            return res.status(400).json({
                success: false,
                message: "Invalid identifier. Must be a valid User ID or 10-digit contact number."
            });
        }
        
        if (!forms || forms.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No forms found for this customer"
            });
        }
        
        // Extract customer information from the first form
        const customerInfo = {
            customerName: forms[0].customerName,
            customerContactNumber: forms[0].customerContactNumber,
            customerAlternativeContactNumber: forms[0].customerAlternativeContactNumber,
            customerAddress: forms[0].customerAddress,
            userId: forms[0].userId
        };
        
        // Calculate statistics
        const stats = {
            totalForms: forms.length,
            draftForms: forms.filter(f => f.status === 'draft').length,
            submittedForms: forms.filter(f => f.status === 'submitted').length,
            approvedForms: forms.filter(f => f.status === 'approved').length,
            rejectedForms: forms.filter(f => f.status === 'rejected').length,
            completedForms: forms.filter(f => f.status === 'completed').length
        };
        
        console.log(`✅ Found ${forms.length} forms for customer (${searchType}: ${identifier})`);
        
        res.status(200).json({
            success: true,
            searchType,
            identifier,
            customerInfo,
            statistics: stats,
            forms
        });
    } catch (error) {
        console.error("Error fetching customer profile:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch customer profile",
            error: error.message
        });
    }
};
