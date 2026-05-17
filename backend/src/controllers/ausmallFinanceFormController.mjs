import ausmallFinanceFormModel from "../models/ausmallFinanceFormModel.mjs";


// Create a new Ausmall Finance Form
export const createAusmallFinanceForm = async (req, res) => {
    try {
        const userId = req.user._id;
        const formData = {
            ...req.body,
            userId,
            assignedTo: "office-engineer",
            status: "draft",
            workflowStage: "office-engineer"
        };

        const newForm = new ausmallFinanceFormModel(formData);
        await newForm.save();

        res.status(201).json({
            success: true,
            message: "Ausmall Finance Form created successfully",
            data: newForm
        });
    } catch (error) {
        console.error("Error creating Ausmall Finance Form:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create form",
            error: error.message
        });
    }
};

// Get all Ausmall Finance Forms
export const getAllAusmallFinanceForms = async (req, res) => {
    try {
        const userId = req.user._id;
        const { status, limit } = req.query;
        
        // Build query - only get forms created by the logged-in user
        const query = { userId };
        
        // Add status filter if provided
        if (status) {
            query.status = status;
        }
        
        // Build the query
        let queryBuilder = ausmallFinanceFormModel
            .find(query)
            .populate("userId", "name email role")
            .populate("updatedBy", "name email role")
            .sort({ createdAt: -1 });
        
        // Apply limit if provided
        if (limit) {
            queryBuilder = queryBuilder.limit(parseInt(limit));
        }
        
        const forms = await queryBuilder;

        res.status(200).json({
            success: true,
            count: forms.length,
            forms: forms
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
export const getMyForms = async (req, res) => {
    try {
        const userId = req.user._id;
        const forms = await ausmallFinanceFormModel
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

// Get forms by assignment (role-based)
export const getFormsByAssignment = async (req, res) => {
    try {
        const { role } = req.params;
        const validRoles = ["admin", "office-engineer", "site-engineer", "technical-engineer", "valuer", "sales-team"];
        
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role specified"
            });
        }

        const forms = await ausmallFinanceFormModel
            .find({ assignedTo: role })
            .populate("userId", "name email role")
            .populate("updatedBy", "name email role")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: forms.length,
            data: forms
        });
    } catch (error) {
        console.error("Error fetching assigned forms:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch forms",
            error: error.message
        });
    }
};

// Get a single Ausmall Finance Form by ID
export const getAusmallFinanceFormById = async (req, res) => {
    try {
        const { formId } = req.params;
        const form = await ausmallFinanceFormModel
            .findById(formId)
            .populate("userId", "name email role")
            .populate("updatedBy", "name email role");
            // Removed .populate("finalReportId") - model doesn't exist yet

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

// Update Ausmall Finance Form
export const updateAusmallFinanceForm = async (req, res) => {
    try {
        const { formId } = req.params;
        const userId = req.user._id;
        const updateData = {
            ...req.body,
            updatedBy: userId,
            isUpdated: true
        };

        const updatedForm = await ausmallFinanceFormModel
            .findByIdAndUpdate(formId, updateData, { new: true, runValidators: true })
            .populate("userId", "name email role")
            .populate("updatedBy", "name email role");

        if (!updatedForm) {
            return res.status(404).json({
                success: false,
                message: "Form not found"
            });
        }

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

// Assign form to a specific role
export const assignFormToRole = async (req, res) => {
    try {
        const { formId } = req.params;
        const { assignedTo } = req.body;
        const userId = req.user._id;

        const validRoles = ["admin", "office-engineer", "site-engineer", "technical-engineer", "valuer", "sales-team"];
        
        if (!validRoles.includes(assignedTo)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role specified"
            });
        }

        const form = await ausmallFinanceFormModel.findById(formId);
        
        if (!form) {
            return res.status(404).json({
                success: false,
                message: "Form not found"
            });
        }

        form.assignedTo = assignedTo;
        form.updatedBy = userId;
        form.isUpdated = true;
        
        await form.save();

        const updatedForm = await ausmallFinanceFormModel
            .findById(formId)
            .populate("userId", "name email role")
            .populate("updatedBy", "name email role");

        res.status(200).json({
            success: true,
            message: `Form assigned to ${assignedTo} successfully`,
            data: updatedForm
        });
    } catch (error) {
        console.error("Error assigning form:", error);
        res.status(500).json({
            success: false,
            message: "Failed to assign form",
            error: error.message
        });
    }
};

// Submit form with workflow logic (FIXED: Allow creators to always submit their own forms)
export const submitAusmallFinanceForm = async (req, res) => {
    try {
        const { formId } = req.params;
        const { action, notes } = req.body; // action: "submit", "return", "approve"
        const userId = req.user._id;
        const userRole = req.user.role;

        const form = await ausmallFinanceFormModel.findById(formId);

        if (!form) {
            return res.status(404).json({
                success: false,
                message: "Form not found"
            });
        }

        // Check if user has permission to perform action
        // FIXED: Allow form creator to ALWAYS submit their own forms regardless of role
        const isCreator = form.userId.toString() === userId.toString();
        const isAssignedRole = form.assignedTo === userRole;
        const isAdmin = userRole === "admin";
        
        // If user is the creator, they can always submit their own form
        if (!isCreator && !isAssignedRole && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: `This form is currently assigned to ${form.assignedTo}. You don't have permission to perform this action.`
            });
        }

        let newAssignedTo = form.assignedTo;
        let newWorkflowStage = form.workflowStage;
        let newStatus = form.status;
        let message = "";

        // FIXED: If creator is submitting their own form for the first time, allow it
        if (isCreator && action === "submit") {
            // Workflow logic based on current stage and action
            switch (form.workflowStage) {
                case "office-engineer":
                    // Office Engineer submits to Site Engineer
                    newAssignedTo = "site-engineer";
                    newWorkflowStage = "site-engineer";
                    newStatus = "submitted";
                    message = "Form submitted to Site Engineer successfully";
                    break;

                case "site-engineer":
                    // Site Engineer submits back to Office Engineer
                    newAssignedTo = "office-engineer";
                    newWorkflowStage = "office-engineer-review";
                    newStatus = "in-review";
                    message = "Form submitted back to Office Engineer for review";
                    break;

                case "office-engineer-review":
                    // Office Engineer submits to Valuer
                    newAssignedTo = "valuer";
                    newWorkflowStage = "valuer";
                    newStatus = "in-review";
                    message = "Form submitted to Valuer successfully";
                    break;

                case "valuer":
                    // Valuer approves and completes the form
                    newAssignedTo = "valuer";
                    newWorkflowStage = "completed";
                    newStatus = "completed";
                    message = "Form approved and completed successfully";
                    break;

                case "completed":
                    return res.status(400).json({
                        success: false,
                        message: "Form is already completed. No further actions allowed."
                    });

                default:
                    return res.status(400).json({
                        success: false,
                        message: "Invalid workflow stage"
                    });
            }
        } else if (action === "return") {
            // Handle return actions
            switch (form.workflowStage) {
                case "office-engineer":
                    return res.status(400).json({
                        success: false,
                        message: "Cannot return form from Office Engineer stage"
                    });

                case "site-engineer":
                    // Site Engineer returns to Office Engineer
                    newAssignedTo = "office-engineer";
                    newWorkflowStage = "office-engineer";
                    newStatus = "draft";
                    message = "Form returned to Office Engineer for corrections";
                    break;

                case "office-engineer-review":
                    // Office Engineer returns to Site Engineer
                    newAssignedTo = "site-engineer";
                    newWorkflowStage = "site-engineer";
                    newStatus = "submitted";
                    message = "Form returned to Site Engineer for corrections";
                    break;

                case "valuer":
                    // Valuer returns to Office Engineer
                    newAssignedTo = "office-engineer";
                    newWorkflowStage = "office-engineer-review";
                    newStatus = "in-review";
                    message = "Form returned to Office Engineer for corrections";
                    break;

                default:
                    return res.status(400).json({
                        success: false,
                        message: "Invalid workflow stage for return action"
                    });
            }
        } else if (action === "approve" && form.workflowStage === "valuer") {
            // Valuer approves and completes the form
            newAssignedTo = "valuer";
            newWorkflowStage = "completed";
            newStatus = "completed";
            message = "Form approved and completed successfully";
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid action for current workflow stage"
            });
        }

        // Update the form
        form.assignedTo = newAssignedTo;
        form.workflowStage = newWorkflowStage;
        form.status = newStatus;
        form.updatedBy = userId;
        form.isUpdated = true;

        // Add notes if provided
        if (notes) {
            const remarkField = `Remark${Math.min(5, Math.floor(Math.random() * 5) + 1)}`;
            form[remarkField] = notes;
        }

        await form.save();

        const updatedForm = await ausmallFinanceFormModel
            .findById(formId)
            .populate("userId", "name email role")
            .populate("updatedBy", "name email role")
            .populate("finalReportId");

        res.status(200).json({
            success: true,
            message,
            data: updatedForm,
            workflow: {
                previousStage: form.workflowStage,
                currentStage: newWorkflowStage,
                assignedTo: newAssignedTo,
                status: newStatus
            }
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

// Delete Ausmall Finance Form
export const deleteAusmallFinanceForm = async (req, res) => {
    try {
        const { formId } = req.params;
        const deletedForm = await ausmallFinanceFormModel.findByIdAndDelete(formId);

        if (!deletedForm) {
            return res.status(404).json({
                success: false,
                message: "Form not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Form deleted successfully",
            data: deletedForm
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

// Made with Bob
