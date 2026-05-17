import express from "express";
const router = express.Router();
import {
    registerUser,
    loginUser,
    getUser,
    updateUser,
    getUserProfile,
    uploadProfilePhoto,
    deleteProfilePhoto,
    getProfilePhoto,
    upload
} from "./controllers/userController.mjs";
import {
    createAusmallFinanceForm,
    getAllAusmallFinanceForms,
    getAusmallFinanceFormById,
    updateAusmallFinanceForm,
    deleteAusmallFinanceForm,
    getFormsByAssignment,
    getMyForms,
    assignFormToRole,
    submitAusmallFinanceForm
} from "./controllers/ausmallFinanceFormController.mjs";
// import {
//     createAusmallFinanceFinalReport,
//     getAllAusmallFinanceFinalReports,
//     getAusmallFinanceFinalReportById,
//     updateAusmallFinanceFinalReport,
//     uploadAusmallFinanceFinalReportDocuments,
//     assignAusmallFinanceFinalReport,
//     deleteAusmallFinanceFinalReport,
//     getReportsByAssignedRole
// } from "./controllers/ausmallFinanceFinalReportController.mjs";
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
    getSalesTeamFormsStats
} from "./controllers/salesteam/salesTeamFormController.mjs";
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
router.get("/profile", authenticate, getUserProfile);
router.get("/getUser/:userId", authenticate, getUser);
router.put("/updateUser/:userId", authenticate, updateUser);

// Profile photo routes
router.post("/uploadProfilePhoto/:userId", authenticate, upload.single('profilePhoto'), uploadProfilePhoto);
router.delete("/deleteProfilePhoto/:userId", authenticate, deleteProfilePhoto);
router.get("/getProfilePhoto/:userId", getProfilePhoto); // Public route

// Ausmall Finance Form routes
router.post("/ausmall-finance-form/create", authenticate, createAusmallFinanceForm);
router.get("/ausmall-finance-form/all", authenticate, getAllAusmallFinanceForms);
router.get("/ausmall-finance-form/my-forms", authenticate, getMyForms);
router.get("/ausmall-finance-form/assigned/:role", authenticate, getFormsByAssignment);
router.get("/ausmall-finance-form/:formId", authenticate, getAusmallFinanceFormById);
router.put("/ausmall-finance-form/:formId", authenticate, updateAusmallFinanceForm);
router.post("/ausmall-finance-form/:formId/assign", authenticate, assignFormToRole);
router.post("/ausmall-finance-form/:formId/submit", authenticate, submitAusmallFinanceForm);
router.delete("/ausmall-finance-form/:formId", authenticate, deleteAusmallFinanceForm);

// Ausmall Finance Final Report routes - COMMENTED OUT (Controller missing)
// When you create the controller, use these protected routes:
// router.post("/ausmall-finance-final-report/create", authenticate, authorizeReportCreation, createAusmallFinanceFinalReport);
// router.get("/ausmall-finance-final-report/all", authenticate, authorizeReportView, getAllAusmallFinanceFinalReports);
// router.get("/ausmall-finance-final-report/assigned/:role", authenticate, authorizeReportView, getReportsByAssignedRole);
// router.get("/ausmall-finance-final-report/:reportId", authenticate, authorizeReportView, getAusmallFinanceFinalReportById);
// router.put("/ausmall-finance-final-report/:reportId", authenticate, authorizeReportEdit, updateAusmallFinanceFinalReport);
// router.post("/ausmall-finance-final-report/:reportId/upload", authenticate, authorizeReportEdit, uploadAusmallFinanceFinalReportDocuments);
// router.post("/ausmall-finance-final-report/:reportId/assign", authenticate, authorizeReportManagement, assignAusmallFinanceFinalReport);
// router.delete("/ausmall-finance-final-report/:reportId", authenticate, authorizeReportManagement, deleteAusmallFinanceFinalReport);

// Sales Team Form routes - Public submission, protected management
router.post("/sales-team-form/submit", createSalesTeamFormPublic); // Public submission
router.post("/sales-team-form/create", createSalesTeamFormPublic); // Public creation
router.get("/sales-team-form/all", authenticate, authorizeReportView, getAllSalesTeamForms); // Protected view
router.get("/sales-team-form/status/:status", authenticate, authorizeReportView, getSalesTeamFormsByStatus); // Protected view
router.get("/sales-team-form/stats", authenticate, authorizeReportView, getSalesTeamFormsStats); // Protected view
router.get("/sales-team-form/:formId", authenticate, authorizeReportView, getSalesTeamFormById); // Protected view
router.put("/sales-team-form/:formId", authenticate, authorizeReportEdit, updateSalesTeamForm); // Protected edit
router.delete("/sales-team-form/:formId", authenticate, authorizeReportManagement, deleteSalesTeamForm); // Admin only
router.post("/sales-team-form/:formId/approve", authenticate, authorizeReportManagement, approveSalesTeamForm); // Admin only
router.post("/sales-team-form/:formId/reject", authenticate, authorizeReportManagement, rejectSalesTeamForm); // Admin only

// Application Form routes - COMMENTED OUT (Controller missing)
// router.post("/application-form/submit", createApplicationForm);
// router.get("/application-form/all", getAllApplicationForms);
// router.get("/application-form/:formId", getApplicationFormById);
// router.delete("/application-form/:formId", deleteApplicationForm);

export default router;