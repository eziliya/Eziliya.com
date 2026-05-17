import jwt from "jsonwebtoken";
import { config } from "../../config.mjs";

/**
 * Authenticate user by verifying JWT token
 */
const authenticate = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, config.secretMessage);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).send({ message: "Unauthorized" });
  }
};

/**
 * Authorize admin role only
 */
const authorize = (req, res, next) => {
   try {
    const { role } = req.user;
    if (role !== 'admin') {
        return res.status(403).send({ message: "Forbidden" });
    }
    next();
   } catch (error) {
    return res.status(500).send({ message: "Internal server error" });
   }
};

/**
 * Role-based authorization middleware
 * @param {Array<string>} allowedRoles - Array of roles that are allowed to access the route
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const { role } = req.user;
      
      if (!role) {
        return res.status(403).send({
          message: "Access denied. No role assigned."
        });
      }

      if (!allowedRoles.includes(role)) {
        return res.status(403).send({
          message: `Access denied. This resource is only accessible to: ${allowedRoles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      return res.status(500).send({ message: "Internal server error" });
    }
  };
};

/**
 * Authorize specific roles for profile access
 */
const authorizeValuer = authorizeRoles('valuer', 'admin');
const authorizeSiteEngineer = authorizeRoles('site-engineer', 'admin');
const authorizeTechnicalEngineer = authorizeRoles('technical-engineer', 'admin');
const authorizeOfficeEngineer = authorizeRoles('office-engineer', 'admin');
const authorizeSalesTeam = authorizeRoles('sales-team', 'admin');

/**
 * Authorize roles that can create reports
 * Office Engineer, Site Engineer, Valuer, and Technical Engineer can create reports
 */
const authorizeReportCreation = authorizeRoles(
  'office-engineer',
  'site-engineer',
  'valuer',
  'technical-engineer',
  'admin'
);

/**
 * Authorize roles that can edit reports
 * Office Engineer, Site Engineer, Valuer, and Technical Engineer can edit their own reports
 * Admin can edit all reports
 */
const authorizeReportEdit = (req, res, next) => {
  try {
    const { role, _id: userId } = req.user;
    
    // Define roles allowed to edit reports
    const allowedRoles = ['office-engineer', 'site-engineer', 'valuer', 'technical-engineer', 'admin'];
    
    if (!role) {
      return res.status(403).send({
        message: "Access denied. No role assigned."
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).send({
        message: `Access denied. Only ${allowedRoles.join(', ')} can edit reports.`
      });
    }

    // Admin can edit any report, others can only edit their own
    if (role === 'admin') {
      return next();
    }

    // For non-admin users, we'll need to verify ownership in the controller
    // Store the userId in request for controller to validate
    req.canEditAnyReport = false;
    req.reportOwnerId = userId;
    
    next();
  } catch (error) {
    return res.status(500).send({ message: "Internal server error" });
  }
};

/**
 * Authorize roles that can view reports
 * All engineer roles and admin can view reports
 */
const authorizeReportView = authorizeRoles(
  'office-engineer',
  'site-engineer',
  'valuer',
  'technical-engineer',
  'sales-team',
  'admin'
);

/**
 * Authorize admin to manage all reports
 */
const authorizeReportManagement = authorizeRoles('admin');

export {
  authenticate,
  authorize,
  authorizeRoles,
  authorizeValuer,
  authorizeSiteEngineer,
  authorizeTechnicalEngineer,
  authorizeOfficeEngineer,
  authorizeSalesTeam,
  authorizeReportCreation,
  authorizeReportEdit,
  authorizeReportView,
  authorizeReportManagement
};