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
const authorizeValuer = authorizeRoles('valuer');
const authorizeSiteEngineer = authorizeRoles('site-engineer');
const authorizeTechnicalEngineer = authorizeRoles('technical-engineer');
const authorizeOfficeEngineer = authorizeRoles('office-engineer');
const authorizeSalesTeam = authorizeRoles('sales-team');

/**
 * Authorize roles that can create reports
 * Office Engineer, Site Engineer, Valuer, and Technical Engineer can create reports
 */
const authorizeReportCreation = authorizeRoles(
  'office-engineer',
  'site-engineer',
  'valuer',
  'technical-engineer'
);

/**
 * Authorize roles that can edit reports
 * Office Engineer, Site Engineer, Valuer, and Technical Engineer can edit their own reports
 */
const authorizeReportEdit = (req, res, next) => {
  try {
    const { role, _id: userId } = req.user;
    
    // Define roles allowed to edit reports
    const allowedRoles = ['office-engineer', 'site-engineer', 'valuer', 'technical-engineer'];
    
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

    // Users can only edit their own reports
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
 * All engineer roles can view reports
 */
const authorizeReportView = authorizeRoles(
  'office-engineer',
  'site-engineer',
  'valuer',
  'technical-engineer',
  'sales-team'
);

/**
 * Authorize roles that can manage reports
 * Office engineers can manage reports
 */
const authorizeReportManagement = authorizeRoles('office-engineer');

export {
  authenticate,
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