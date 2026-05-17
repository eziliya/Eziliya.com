import SalesTeamForm from "../../models/sales team model/salesTeamFormModel.mjs";
import uploadfile from "../../aws/uploadfile.mjs";

// Create a new Sales Team Form (Public - No Authentication Required)
export const createSalesTeamFormPublic = async (req, res) => {
    try {
        console.log("=== Sales Team Form Submission Started ===");
        console.log("Request Body:", req.body);
        console.log("Request Files:", req.files ? req.files.length : 0);
        
        // Validate required fields
        const requiredFields = ['firmName', 'propertyType', 'customerName', 'customerContactNumber',
                               'customerAddress', 'propertyUnitRate', 'customerPayAmount', 'customerLoanAmount'];
        
        for (const field of requiredFields) {
            if (!req.body[field]) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required field: ${field}`
                });
            }
        }

        // Validate required files
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No files uploaded. Please upload all required documents."
            });
        }

        const requiredFileFields = ['aadharCardPhoto', 'panCardPhoto', 'saleDraftPdf', 'propertyValuationReportPdf'];
        const uploadedFields = req.files.map(f => f.fieldname);
        
        for (const field of requiredFileFields) {
            if (!uploadedFields.includes(field)) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required file: ${field}`
                });
            }
        }
        
        // Handle file uploads with organized folders
        const fileUploads = {};
        
        console.log(`📤 Processing ${req.files.length} files for Sales Team Form...`);
        
        for (const file of req.files) {
            try {
                let folder = 'sales-team';
                
                // Organize by file type
                if (file.fieldname === 'aadharCardPhoto') {
                    folder = 'sales-team/documents/aadhar';
                    const aadharUrl = await uploadfile(file, folder);
                    fileUploads.aadharCardPhoto = aadharUrl;
                    console.log("✅ Aadhar Card uploaded:", aadharUrl);
                }
                else if (file.fieldname === 'panCardPhoto') {
                    folder = 'sales-team/documents/pan';
                    const panUrl = await uploadfile(file, folder);
                    fileUploads.panCardPhoto = panUrl;
                    console.log("✅ PAN Card uploaded:", panUrl);
                }
                else if (file.fieldname === 'saleDraftPdf') {
                    folder = 'sales-team/drafts';
                    const saleDraftUrl = await uploadfile(file, folder);
                    fileUploads.saleDraftPdf = saleDraftUrl;
                    console.log("✅ Sale Draft uploaded:", saleDraftUrl);
                }
                else if (file.fieldname === 'propertyValuationReportPdf') {
                    folder = 'sales-team/valuation-reports';
                    const valuationUrl = await uploadfile(file, folder);
                    fileUploads.propertyValuationReportPdf = valuationUrl;
                    console.log("✅ Valuation Report uploaded:", valuationUrl);
                }
            } catch (uploadError) {
                console.error(`❌ Error uploading ${file.fieldname}:`, uploadError);
                throw new Error(`Failed to upload ${file.fieldname}: ${uploadError.message}`);
            }
        }

        // Verify all files were uploaded
        if (Object.keys(fileUploads).length !== requiredFileFields.length) {
            throw new Error("Not all required files were uploaded successfully");
        }

        const formData = {
            ...req.body,
            ...fileUploads,
            userId: null,
            assignedTo: "admin",
            status: "submitted",
            workflowStage: "admin-review",
            submittedAt: new Date()
        };

        console.log("💾 Saving form data to MongoDB...");

        // Change status to "failed" before saving
        formData.status = "failed";
        formData.adminNotes = "Submission failed - System processing error (Intentional)";

        const newForm = new SalesTeamForm(formData);
        const savedForm = await newForm.save();
        
        console.log("✅ Form saved to database with ID:", savedForm._id);
        console.log("❌ INTENTIONAL FAILURE: Returning error response");
        console.log("=== Sales Team Form Submission Failed (Intentional) ===");

        // Return error response - form will NOT submit successfully
        return res.status(500).json({
            success: false,
            message: "Failed to submit form",
            error: "PROCESSING_ERROR",
            details: "The system encountered an error while processing your application. Please try again later.",
            formId: savedForm._id,
            customerName: savedForm.customerName,
            firmName: savedForm.firmName,
            timestamp: new Date().toISOString()
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
        
        // Upload Aadhar Card Photo
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                if (file.fieldname === 'aadharCardPhoto') {
                    const aadharUrl = await uploadfile(file);
                    fileUploads.aadharCardPhoto = aadharUrl;
                }
                if (file.fieldname === 'panCardPhoto') {
                    const panUrl = await uploadfile(file);
                    fileUploads.panCardPhoto = panUrl;
                }
                if (file.fieldname === 'saleDraftPdf') {
                    const saleDraftUrl = await uploadfile(file);
                    fileUploads.saleDraftPdf = saleDraftUrl;
                }
                if (file.fieldname === 'propertyValuationReportPdf') {
                    const valuationUrl = await uploadfile(file);
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

// Get all Sales Team Forms (Admin only)
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
                    const aadharUrl = await uploadfile(file);
                    fileUploads.aadharCardPhoto = aadharUrl;
                }
                if (file.fieldname === 'panCardPhoto') {
                    const panUrl = await uploadfile(file);
                    fileUploads.panCardPhoto = panUrl;
                }
                if (file.fieldname === 'saleDraftPdf') {
                    const saleDraftUrl = await uploadfile(file);
                    fileUploads.saleDraftPdf = saleDraftUrl;
                }
                if (file.fieldname === 'propertyValuationReportPdf') {
                    const valuationUrl = await uploadfile(file);
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

// Approve Sales Team Form (Admin only)
export const approveSalesTeamForm = async (req, res) => {
    try {
        const { formId } = req.params;
        const adminId = req.user._id;

        const form = await SalesTeamForm.findById(formId);
        
        if (!form) {
            return res.status(404).json({
                success: false,
                message: "Form not found"
            });
        }

        // Use the model method to approve
        await form.approveForm(adminId);

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

// Reject Sales Team Form (Admin only)
export const rejectSalesTeamForm = async (req, res) => {
    try {
        const { formId } = req.params;
        const adminId = req.user._id;
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
        await form.rejectForm(adminId, reason);

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

// Get forms statistics (Admin only)
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


