import ausmallFinanceFormModel from "../models/ausmallFinanceFormModel.mjs";
import uploadfile, { uploadMultipleFiles } from "../aws/uploadfile.mjs";


// Create a new Ausmall Finance Form
export const createAusmallFinanceForm = async (req, res) => {
    try {
        const formData = {
            ...req.body,
            status: "draft"
        };

        // Extract user ID from various possible fields in the token
        const userId = req.user?._id || req.user?.id || req.user?.userId;
        const userRole = req.user?.role;

        // If user is authenticated, set userId and createdByRole
        if (userId) {
            formData.userId = userId;
            if (userRole) {
                formData.createdByRole = userRole; // Store the role of the creator
            }
        }

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

// Submit Ausmall Finance Form (change status from draft to submitted)
export const submitAusmallFinanceForm = async (req, res) => {
    try {
        const { formId } = req.params;
        
        // Find the form
        const form = await ausmallFinanceFormModel.findById(formId);
        
        if (!form) {
            return res.status(404).json({
                success: false,
                message: "Form not found"
            });
        }

        // Check if form is already submitted
        if (form.status === "submitted" || form.status === "in-review" || form.status === "completed") {
            return res.status(400).json({
                success: false,
                message: `Form is already ${form.status}. Cannot submit again.`
            });
        }

        // Update status to submitted
        form.status = "submitted";
        form.workflowStage = "site-engineer"; // Move to next stage
        await form.save();

        res.status(200).json({
            success: true,
            message: "Form submitted successfully",
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

// Get all Ausmall Finance Forms (filtered by user and role)
export const getAllAusmallFinanceForms = async (req, res) => {
    try {
        const { status, limit } = req.query;
        
        // Build query - STRICT filtering by user ID AND role
        const query = {};
        
        // Extract user ID from various possible fields in the token
        const userId = req.user?._id || req.user?.id || req.user?.userId;
        const userRole = req.user?.role;
        
        console.log('=== DEBUG getAllAusmallFinanceForms ===');
        console.log('Full req.user object:', JSON.stringify(req.user));
        console.log('Extracted userId:', userId);
        console.log('Extracted userRole:', userRole);
        
        // If user is authenticated, only show forms created by this user with this role
        if (userId && userRole) {
            // MUST match both userId AND createdByRole
            query.userId = userId;
            query.createdByRole = userRole;
        } else if (userId) {
            // Fallback: if no role, just filter by userId
            query.userId = userId;
        }
        
        // Add status filter if provided
        if (status) {
            query.status = status;
        }
        
        console.log('Query for getAllAusmallFinanceForms:', JSON.stringify(query));
        
        // Build the query
        let queryBuilder = ausmallFinanceFormModel
            .find(query)
            .sort({ createdAt: -1 });
        
        // Apply limit if provided
        if (limit) {
            queryBuilder = queryBuilder.limit(parseInt(limit));
        }
        
        const forms = await queryBuilder;
        
        console.log(`Found ${forms.length} forms for user ${userId} with role ${userRole}`);

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


// Get a single Ausmall Finance Form by ID
export const getAusmallFinanceFormById = async (req, res) => {
    try {
        const { formId } = req.params;
        const query = { _id: formId };
        
        // Extract user ID from various possible fields in the token
        const userId = req.user?._id || req.user?.id || req.user?.userId;
        
        // If user is authenticated, ensure they can only access their own forms
        if (userId) {
            query.userId = userId;
        }
        
        const form = await ausmallFinanceFormModel.findOne(query);

        if (!form) {
            return res.status(404).json({
                success: false,
                message: "Form not found or you don't have permission to access it"
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
        const updateData = {
            ...req.body,
            isUpdated: true
        };

        // Extract user ID from various possible fields in the token
        const userId = req.user?._id || req.user?.id || req.user?.userId;

        // Build query to ensure user can only update their own forms
        const query = { _id: formId };
        if (userId) {
            query.userId = userId;
        }

        const updatedForm = await ausmallFinanceFormModel
            .findOneAndUpdate(query, updateData, { new: true, runValidators: true });

        if (!updatedForm) {
            return res.status(404).json({
                success: false,
                message: "Form not found or you don't have permission to update it"
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
// Upload photos for Ausmall Finance Form
export const uploadFormPhotos = async (req, res) => {
    try {
        const { formId } = req.params;
        
        // Check if form exists
        const form = await ausmallFinanceFormModel.findById(formId);
        if (!form) {
            return res.status(404).json({
                success: false,
                message: "Form not found"
            });
        }

        // Check if files were uploaded
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No files uploaded"
            });
        }

        const uploadedPhotos = {};
        const uploadPromises = [];

        // Handle specific photo fields
        const photoFields = [
            'Uploadphotosatelitemap',
            'UploadphotoHall',
            'UploadphotoKichen',
            'UploadphotoBedroom',
            'UploadphotoOtherroom',
            'UploadphotoOther',
            'UploadphotoExternalPhoto',
            'UploadphotoFrontSIte',
            'UploadphotoRoadSIte',
            'UploadphotoSelfiWithProperty',
            'UploadphotoSelfiWithpersonAtProperty'
        ];

        // Upload individual photo fields
        for (const field of photoFields) {
            if (req.files[field] && req.files[field][0]) {
                const file = req.files[field][0];
                uploadPromises.push(
                    uploadfile(file, 'ausmall-finance-forms')
                        .then(url => {
                            uploadedPhotos[field] = url;
                            form[field] = url;
                        })
                        .catch(error => {
                            console.error(`Error uploading ${field}:`, error);
                            throw new Error(`Failed to upload ${field}: ${error.message}`);
                        })
                );
            }
        }

        // Handle multiple images array
        if (req.files['images']) {
            const imageFiles = req.files['images'];
            uploadPromises.push(
                uploadMultipleFiles(imageFiles, 'ausmall-finance-forms')
                    .then(urls => {
                        uploadedPhotos.images = urls;
                        // Append to existing images array
                        form.images = [...form.images, ...urls];
                    })
                    .catch(error => {
                        console.error('Error uploading images array:', error);
                        throw new Error(`Failed to upload images: ${error.message}`);
                    })
            );
        }

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);

        // Save the updated form
        form.isUpdated = true;
        await form.save();

        res.status(200).json({
            success: true,
            message: "Photos uploaded successfully",
            data: {
                formId: form._id,
                uploadedPhotos,
                totalUploaded: Object.keys(uploadedPhotos).length
            }
        });
    } catch (error) {
        console.error("Error uploading photos:", error);
        res.status(500).json({
            success: false,
            message: "Failed to upload photos",
            error: error.message
        });
    }
};

// Upload single photo for a specific field
export const uploadSinglePhoto = async (req, res) => {
    try {
        const { formId, fieldName } = req.params;
        
        // Validate field name
        const validPhotoFields = [
            'Uploadphotosatelitemap',
            'UploadphotoHall',
            'UploadphotoKichen',
            'UploadphotoBedroom',
            'UploadphotoOtherroom',
            'UploadphotoOther',
            'UploadphotoExternalPhoto',
            'UploadphotoFrontSIte',
            'UploadphotoRoadSIte',
            'UploadphotoSelfiWithProperty',
            'UploadphotoSelfiWithpersonAtProperty'
        ];

        if (!validPhotoFields.includes(fieldName)) {
            return res.status(400).json({
                success: false,
                message: `Invalid field name. Must be one of: ${validPhotoFields.join(', ')}`
            });
        }

        // Check if form exists
        const form = await ausmallFinanceFormModel.findById(formId);
        if (!form) {
            return res.status(404).json({
                success: false,
                message: "Form not found"
            });
        }

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        // Upload to S3
        const photoUrl = await uploadfile(req.file, 'ausmall-finance-forms');

        // Update form with photo URL
        form[fieldName] = photoUrl;
        form.isUpdated = true;
        await form.save();

        res.status(200).json({
            success: true,
            message: `Photo uploaded successfully for ${fieldName}`,
            data: {
                formId: form._id,
                fieldName,
                photoUrl
            }
        });
    } catch (error) {
        console.error("Error uploading single photo:", error);
        res.status(500).json({
            success: false,
            message: "Failed to upload photo",
            error: error.message
        });
    }
};


// Delete Ausmall Finance Form
export const deleteAusmallFinanceForm = async (req, res) => {
    try {
        const { formId } = req.params;
        
        // Extract user ID from various possible fields in the token
        const userId = req.user?._id || req.user?.id || req.user?.userId;
        
        // Build query to ensure user can only delete their own forms
        const query = { _id: formId };
        if (userId) {
            query.userId = userId;
        }
        
        const deletedForm = await ausmallFinanceFormModel.findOneAndDelete(query);

        if (!deletedForm) {
            return res.status(404).json({
                success: false,
                message: "Form not found or you don't have permission to delete it"
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

// Save Ausmall Finance Form as Draft (Public - No Authentication Required)
export const saveAusmallFinanceFormDraft = async (req, res) => {
    try {
        console.log("=== Ausmall Finance Draft Save Started ===");
        console.log("Request Body:", req.body);
        
        // Create draft with minimal required data
        const formData = {
            ...req.body,
            status: "draft",
            workflowStage: "office-engineer"
        };

        // If user is authenticated, set userId and createdByRole
        const userId = req.user?._id || req.user?.id || req.user?.userId;
        const userRole = req.user?.role;

        if (userId) {
            formData.userId = userId;
            if (userRole) {
                formData.createdByRole = userRole;
            }
        }

        console.log("💾 Saving draft to MongoDB...");

        const newDraft = new ausmallFinanceFormModel(formData);
        const savedDraft = await newDraft.save();
        
        console.log("✅ Draft saved to database with ID:", savedDraft._id);
        console.log("=== Ausmall Finance Draft Save Completed ===");

        return res.status(201).json({
            success: true,
            message: "Draft saved successfully",
            data: {
                draftId: savedDraft._id,
                ApplicantsNames: savedDraft.ApplicantsNames,
                BankName: savedDraft.BankName,
                createdAt: savedDraft.createdAt
            }
        });
    } catch (error) {
        console.error("=== Error saving Ausmall Finance Draft ===");
        console.error("Error Details:", error);
        console.error("Error Stack:", error.stack);
        res.status(500).json({
            success: false,
            message: "Failed to save draft",
            error: error.message
        });
    }
};

// Get all Ausmall Finance Form Drafts (Public - No Authentication Required)
export const getAllAusmallFinanceFormDrafts = async (req, res) => {
    try {
        console.log("=== Fetching Ausmall Finance Drafts ===");
        
        // Build query for drafts
        const query = { status: "draft" };
        
        // Extract user ID from various possible fields in the token
        const userId = req.user?._id || req.user?.id || req.user?.userId;
        const userRole = req.user?.role;
        
        console.log('=== DEBUG getAllAusmallFinanceFormDrafts ===');
        console.log('Extracted userId:', userId);
        console.log('Extracted userRole:', userRole);
        
        // If user is authenticated, filter by userId and role
        if (userId && userRole) {
            query.userId = userId;
            query.createdByRole = userRole;
        } else if (userId) {
            query.userId = userId;
        }
        
        console.log('Query for drafts:', JSON.stringify(query));
        
        const drafts = await ausmallFinanceFormModel
            .find(query)
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

// Delete Ausmall Finance Form Draft (Public - No Authentication Required)
export const deleteAusmallFinanceFormDraft = async (req, res) => {
    try {
        const { draftId } = req.params;
        console.log("=== Deleting Ausmall Finance Draft ===");
        console.log("Draft ID:", draftId);

        const draft = await ausmallFinanceFormModel.findById(draftId);
        
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

        // If user is authenticated, ensure they own the draft
        const userId = req.user?._id || req.user?.id || req.user?.userId;
        if (userId && draft.userId && draft.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to delete this draft"
            });
        }

        await ausmallFinanceFormModel.findByIdAndDelete(draftId);
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

// Made with Bob
