import express from "express";
const router = express.Router();
import {
    registerUser,
    loginUser,
    getUser,
    updateUser,
    forgotPassword,
    verifyMobileNumber
} from "./controllers/salesteam/userModelController.mjs";
import {
    createAusmallFinanceForm,
    submitAusmallFinanceForm,
    getAllAusmallFinanceForms,
    getAusmallFinanceFormById,
    updateAusmallFinanceForm,
    deleteAusmallFinanceForm,
    uploadFormPhotos,
    uploadSinglePhoto,
    saveAusmallFinanceFormDraft,
    getAllAusmallFinanceFormDrafts,
    deleteAusmallFinanceFormDraft
} from "./controllers/ausmallFinanceFormController.mjs";
import {
    createSalesTeamForm,
    createSalesTeamFormPublic,
    submitSalesTeamForm,
    getAllSalesTeamForms,
    getMySalesTeamForms,
    getSalesTeamFormById,
    updateSalesTeamForm,
    deleteSalesTeamForm,
    approveSalesTeamForm,
    rejectSalesTeamForm,
    getSalesTeamFormsByStatus,
    getSalesTeamFormsStats,
    saveSalesTeamFormDraft,
    getAllSalesTeamFormDrafts,
    deleteSalesTeamFormDraft,
    assignFormToTechnicalEngineer,
    getFormsAssignedToTechnicalEngineers,
    searchFormsByUserId,
    searchFormsByCustomerName,
    advancedSearchForms,
    getCustomerProfile,
    getAllTechnicalEngineerReports,
    getTechnicalEngineerReportById,
    upload as salesTeamUpload
} from "./controllers/salesteam/salesTeamFormController.mjs";
import {
    uploadPdfDocument,
    getMyDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument,
    restoreDocument,
    searchDocuments,
    shareDocument,
    getTechnicalEngineerWorkTasks,
    getTechnicalEngineerWorkTaskById,
    updateWorkTaskStatus,
    upload as technicalEngineerUpload
} from "./controllers/technicalEngineerController.mjs";
// TODO: Implement technicalEngineerLoginController functions
// import {
//     loginWithFirmMobile,
//     getFirmForms,
//     verifyFirmSession
// } from "./controllers/technicalEngineerLoginController.mjs";
import {
    uploadPdfDocument as uploadSalesTeamPdf,
    getAllDocuments as getAllSalesTeamDocuments,
    getDocumentById as getSalesTeamDocumentById,
    updateDocument as updateSalesTeamDocument,
    deleteDocument as deleteSalesTeamDocument,
    searchDocuments as searchSalesTeamDocuments,
    upload as salesTeamDocUpload
} from "./controllers/salesteam/salesTeamUploadController.mjs";
// import {
//     createApplicationForm,
//     getAllApplicationForms,
//     getApplicationFormById,
//     deleteApplicationForm
// } from "./controllers/applicationFormController.mjs";
import {
    authenticate,
    authorizeReportCreation,
    authorizeReportEdit,
    authorizeReportView,
    authorizeReportManagement
} from "./auth/authentication.mjs";

// User routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword); // Forgot password - reset password
router.post("/verify-mobile", verifyMobileNumber); // Verify mobile number exists
// router.get("/profile", authenticate, getUserProfile); // TODO: Implement getUserProfile
// router.get("/technical-engineer-profile", getTechnicalEngineerFirmProfile); // TODO: Implement getTechnicalEngineerFirmProfile
router.get("/getUser/:userId", authenticate, getUser);
router.put("/updateUser/:userId", authenticate, updateUser);

// Profile photo routes - TODO: Implement these functions
// router.post("/uploadProfilePhoto/:userId", authenticate, upload.single('profilePhoto'), uploadProfilePhoto);
// router.delete("/deleteProfilePhoto/:userId", authenticate, deleteProfilePhoto);
// router.delete("/removeProfilePhoto/:userId", authenticate, deleteProfilePhoto); // Alias for deleteProfilePhoto
// router.get("/getProfilePhoto/:userId", getProfilePhoto); // Public route

// Ausmall Finance Form routes (Public - No Authentication Required)
router.post("/ausmall-finance-form/create", createAusmallFinanceForm);
router.post("/ausmall-finance-form/:formId/submit", submitAusmallFinanceForm);
router.post("/ausmall-finance-form/save-draft", saveAusmallFinanceFormDraft); // Save draft
router.get("/ausmall-finance-form/drafts", getAllAusmallFinanceFormDrafts); // Get all drafts
router.delete("/ausmall-finance-form/drafts/:draftId", deleteAusmallFinanceFormDraft); // Delete draft
router.get("/ausmall-finance-form/all", getAllAusmallFinanceForms);
router.get("/ausmall-finance-form/:formId", getAusmallFinanceFormById);
router.put("/ausmall-finance-form/:formId", updateAusmallFinanceForm);
router.delete("/ausmall-finance-form/:formId", deleteAusmallFinanceForm);

// Photo upload routes for Ausmall Finance Form (Public - No Authentication Required)
router.post("/ausmall-finance-form/:formId/photos", uploadFormPhotos); // Upload multiple photos
router.post("/ausmall-finance-form/:formId/photos/:fieldName", uploadSinglePhoto); // Upload single photo to specific field

// Sales Team Form routes - Public submission, protected management
router.post("/sales-team-form/submit", salesTeamUpload.fields([
    { name: 'aadharCardPhoto', maxCount: 1 },
    { name: 'panCardPhoto', maxCount: 1 },
    { name: 'saleDraftPdf', maxCount: 1 },
    { name: 'propertyValuationReportPdf', maxCount: 1 }
]), createSalesTeamFormPublic); // Public submission
router.post("/sales-team-form/create", salesTeamUpload.fields([
    { name: 'aadharCardPhoto', maxCount: 1 },
    { name: 'panCardPhoto', maxCount: 1 },
    { name: 'saleDraftPdf', maxCount: 1 },
    { name: 'propertyValuationReportPdf', maxCount: 1 }
]), createSalesTeamFormPublic); // Public creation
router.post("/sales-team-form/save-draft", salesTeamUpload.fields([
    { name: 'aadharCardPhoto', maxCount: 1 },
    { name: 'panCardPhoto', maxCount: 1 },
    { name: 'saleDraftPdf', maxCount: 1 },
    { name: 'propertyValuationReportPdf', maxCount: 1 }
]), saveSalesTeamFormDraft); // Public draft save
router.get("/sales-team-form/drafts", getAllSalesTeamFormDrafts); // Public draft view
router.delete("/sales-team-form/drafts/:draftId", deleteSalesTeamFormDraft); // Public draft delete

// Search and Customer Profile Routes (Public - No Authentication Required)
router.get("/sales-team-form/search/user/:userId", searchFormsByUserId); // Search by User ID

router.get("/sales-team-form/search/customer/:customerName", searchFormsByCustomerName); // Search by Customer Name
router.get("/sales-team-form/search/advanced", advancedSearchForms); // Advanced search with multiple criteria
router.get("/sales-team-form/customer-profile/:identifier", getCustomerProfile); // Get customer profile (userId or contactNumber)

// Protected Routes (Authentication Required)
router.get("/sales-team-form/all", authenticate, authorizeReportView, getAllSalesTeamForms); // Protected view
router.get("/sales-team-form/status/:status", authenticate, authorizeReportView, getSalesTeamFormsByStatus); // Protected view
router.get("/sales-team-form/stats", authenticate, authorizeReportView, getSalesTeamFormsStats); // Protected view
router.get("/sales-team-form/:formId", authenticate, authorizeReportView, getSalesTeamFormById); // Protected view
router.put("/sales-team-form/:formId", authenticate, authorizeReportEdit, updateSalesTeamForm); // Protected edit
router.delete("/sales-team-form/:formId", authenticate, authorizeReportManagement, deleteSalesTeamForm); // Admin only
router.post("/sales-team-form/:formId/approve", authenticate, authorizeReportManagement, approveSalesTeamForm); // Admin only
router.post("/sales-team-form/:formId/reject", authenticate, authorizeReportManagement, rejectSalesTeamForm); // Admin only
router.post("/sales-team-form/:formId/assign-technical-engineer", authenticate, authorizeReportManagement, assignFormToTechnicalEngineer); // Admin only
router.get("/sales-team-form/assigned/technical-engineers", authenticate, authorizeReportView, getFormsAssignedToTechnicalEngineers); // Protected view

// Sales Team - View Technical Engineer Reports (Valuation Reports)
router.get("/sales-team/technical-engineer-reports", getAllTechnicalEngineerReports); // Public - View all technical engineer reports
router.get("/sales-team/technical-engineer-reports/:reportId", getTechnicalEngineerReportById); // Public - View specific report

// Application Form routes - COMMENTED OUT (Controller missing)
// router.post("/application-form/submit", createApplicationForm);
// router.get("/application-form/all", getAllApplicationForms);
// router.get("/application-form/:formId", getApplicationFormById);
// router.delete("/application-form/:formId", deleteApplicationForm);

// Technical Engineer Document Upload routes (No authentication required)
router.post("/technical-engineer/upload", technicalEngineerUpload.single('pdfFile'), uploadPdfDocument);
router.get("/technical-engineer/documents", getMyDocuments);
router.get("/technical-engineer/documents/search", searchDocuments);
router.get("/technical-engineer/documents/:id", getDocumentById);
router.put("/technical-engineer/documents/:id", updateDocument);
router.delete("/technical-engineer/documents/:id", deleteDocument);
router.post("/technical-engineer/documents/:id/restore", restoreDocument);
router.post("/technical-engineer/documents/:id/share", shareDocument);

// Technical Engineer - Firm Mobile Login routes (Public - No authentication required)
// TODO: Implement these routes
// router.post("/technical-engineer/login-with-firm-mobile", loginWithFirmMobile); // Login with firm registered mobile number
// router.get("/technical-engineer/firm-forms", getFirmForms); // Get forms for logged-in firm (requires firm-mobile token)
// router.get("/technical-engineer/verify-firm-session", verifyFirmSession); // Verify firm mobile login session

// Technical Engineer Work Tasks routes - View sales team form submissions
router.get("/technical-engineer/work-tasks", getTechnicalEngineerWorkTasks); // Get all assigned forms
router.get("/technical-engineer/work-tasks/:formId", getTechnicalEngineerWorkTaskById); // Get specific form
router.put("/technical-engineer/work-tasks/:formId/status", updateWorkTaskStatus); // Update form status

// Sales Team Document Upload routes (No authentication required)
router.post("/sales-team/upload", salesTeamDocUpload.single('pdfFile'), uploadSalesTeamPdf);
router.get("/sales-team/documents", getAllSalesTeamDocuments);
router.get("/sales-team/documents/search", searchSalesTeamDocuments);
router.get("/sales-team/documents/:id", getSalesTeamDocumentById);
router.put("/sales-team/documents/:id", updateSalesTeamDocument);
router.delete("/sales-team/documents/:id", deleteSalesTeamDocument);

export default router;