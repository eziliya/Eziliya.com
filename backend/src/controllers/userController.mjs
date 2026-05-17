import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import { config } from "../../config.mjs";
import uploadfile, { deleteFile } from "../aws/uploadfile.mjs";

/**
 * User Model Schema
 * Since there's no separate user model file, we define it here
 */
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    contactNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        required: true,
        enum: ["admin", "evaluator", "technician", "valuer", "office-engineer", "site-engineer", "technical-engineer", "sales-team"],
        default: "technician"
    },
    phone: {
        type: String,
        default: ""
    },
    profilePhoto: {
        type: String,
        default: ""
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

/**
 * Register a new user
 * POST /register
 */
const registerUser = async (req, res) => {
    try {
        const { name, contactNumber, password, role, phone } = req.body;

        // Validate required fields
        if (!name || !contactNumber || !password) {
            return res.status(400).json({
                message: "Name, contact number, and password are required"
            });
        }

        // Validate contact number format (10 digits)
        const contactRegex = /^\d{10}$/;
        if (!contactRegex.test(contactNumber)) {
            return res.status(400).json({
                message: "Invalid contact number format. Must be 10 digits."
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ contactNumber: contactNumber.trim() });
        if (existingUser) {
            return res.status(409).json({
                message: "User with this contact number already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = await User.create({
            name: name.trim(),
            contactNumber: contactNumber.trim(),
            password: hashedPassword,
            role: role || "technician",
            phone: phone || ""
        });

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                contactNumber: user.contactNumber,
                role: user.role
            },
            config.secretMessage,
            { expiresIn: "7d" }
        );

        // Return user data without password
        const userResponse = {
            _id: user._id,
            name: user.name,
            contactNumber: user.contactNumber,
            role: user.role,
            phone: user.phone,
            isActive: user.isActive,
            createdAt: user.createdAt
        };

        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: userResponse
        });

    } catch (error) {
        console.error("Register user error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "User with this contact number already exists"
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Validation failed",
                error: error.message
            });
        }

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

/**
 * Login user
 * POST /login
 */
const loginUser = async (req, res) => {
    try {
        const { contactNumber, password } = req.body;

        // Validate input
        if (!contactNumber || !password) {
            return res.status(400).json({
                message: "Contact number and password are required"
            });
        }

        // Find user by contact number
        const user = await User.findOne({ contactNumber: contactNumber.trim() });
        if (!user) {
            return res.status(401).json({
                message: "Invalid contact number or password"
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                message: "Your account has been deactivated. Please contact admin."
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid contact number or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user._id,
                contactNumber: user.contactNumber,
                role: user.role
            },
            config.secretMessage,
            { expiresIn: "7d" }
        );

        // Return user data without password
        const userResponse = {
            _id: user._id,
            name: user.name,
            contactNumber: user.contactNumber,
            role: user.role,
            phone: user.phone,
            isActive: user.isActive
        };

        return res.status(200).json({
            message: "Login successful",
            token,
            user: userResponse
        });

    } catch (error) {
        console.error("Login user error:", error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

/**
 * Get user by ID
 * GET /getUser/:userId
 */
const getUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { userId: requestUserId, role } = req.user;

        // Check if user is requesting their own data or is admin
        if (userId !== requestUserId && role !== "admin") {
            return res.status(403).json({ 
                message: "You don't have permission to view this user" 
            });
        }

        // Find user
        const user = await User.findById(userId).select("-password");
        
        if (!user) {
            return res.status(404).json({ 
                message: "User not found" 
            });
        }

        return res.status(200).json({
            message: "User retrieved successfully",
            user
        });

    } catch (error) {
        console.error("Get user error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({ 
                message: "Invalid user ID" 
            });
        }

        return res.status(500).json({ 
            message: "Internal server error" 
        });
    }
};

/**
 * Update user
 * PUT /updateUser/:userId
 */
const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { userId: requestUserId, role } = req.user;
        const { name, phone, password, currentPassword } = req.body;

        // Check if user is updating their own data or is admin
        if (userId !== requestUserId && role !== "admin") {
            return res.status(403).json({ 
                message: "You don't have permission to update this user" 
            });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                message: "User not found" 
            });
        }

        // Prepare update data
        const updateData = {};

        if (name) {
            updateData.name = name.trim();
        }

        if (phone !== undefined) {
            updateData.phone = phone.trim();
        }

        // Handle password update
        if (password) {
            // Verify current password if user is updating their own password
            if (userId === requestUserId) {
                if (!currentPassword) {
                    return res.status(400).json({ 
                        message: "Current password is required to set a new password" 
                    });
                }

                const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
                if (!isCurrentPasswordValid) {
                    return res.status(401).json({ 
                        message: "Current password is incorrect" 
                    });
                }
            }

            // Hash new password
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select("-password");

        return res.status(200).json({
            message: "User updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update user error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({ 
                message: "Invalid user ID" 
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({ 
                message: "Validation failed", 
                error: error.message 
            });
        }

        return res.status(500).json({ 
            message: "Internal server error" 
        });
    }
};

/**
 * Get user profile with role-specific data
 * GET /profile
 * Returns only the data relevant to the user's role
 */
const getUserProfile = async (req, res) => {
    try {
        const { userId, role } = req.user;

        // Find user
        const user = await User.findById(userId).select("-password");
        
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: "Your account has been deactivated. Please contact admin."
            });
        }

        // Base profile data
        const profileData = {
            _id: user._id,
            name: user.name,
            contactNumber: user.contactNumber,
            role: user.role,
            phone: user.phone,
            isActive: user.isActive,
            createdAt: user.createdAt
        };

        // Role-specific profile information
        const roleSpecificData = {
            valuer: {
                profileType: "Valuer Profile",
                description: "Property valuation specialist",
                permissions: [
                    "View assigned valuation reports",
                    "Submit valuation reports",
                    "Update property valuations",
                    "Access valuation history"
                ],
                accessibleRoutes: [
                    "/pending-reports",
                    "/completed-reports",
                    "/submit-valuer/:reportId",
                    "/report/:reportId"
                ]
            },
            "site-engineer": {
                profileType: "Site Engineer Profile",
                description: "On-site inspection and technical assessment",
                permissions: [
                    "View assigned site visits",
                    "Start site visits",
                    "Submit site inspection reports",
                    "Upload site photos and documents",
                    "Access visit history"
                ],
                accessibleRoutes: [
                    "/site-engineer/pending-visits",
                    "/site-engineer/in-progress-visits",
                    "/site-engineer/completed-visits",
                    "/site-engineer/start-visit/:reportId",
                    "/submit-site-engineer/:reportId"
                ]
            },
            "technical-engineer": {
                profileType: "Technical Engineer Profile",
                description: "Technical report review and approval",
                permissions: [
                    "View technical reports",
                    "Upload technical reports",
                    "Download technical reports",
                    "Review technical assessments"
                ],
                accessibleRoutes: [
                    "/technical-reports",
                    "/technical-reports/upload",
                    "/technical-reports/download/:reportId"
                ]
            },
            "office-engineer": {
                profileType: "Office Engineer Profile",
                description: "Report creation and management",
                permissions: [
                    "Create new reports",
                    "View all reports",
                    "Update reports",
                    "Submit office engineer reports",
                    "Assign reports to site engineers"
                ],
                accessibleRoutes: [
                    "/create",
                    "/getreports",
                    "/mycreatedreports",
                    "/updatereport/:reportId",
                    "/submit-office-engineer/:reportId"
                ]
            },
            "sales-team": {
                profileType: "Sales Team Profile",
                description: "Client management and sales operations",
                permissions: [
                    "View client reports",
                    "Create AU Small Finance forms",
                    "View AU Small Finance reports",
                    "Track report status"
                ],
                accessibleRoutes: [
                    "/ausmall-finance-form/create",
                    "/ausmall-finance-form/all",
                    "/ausmall-finance-form/:formId",
                    "/ausmall-finance-final-report/all"
                ]
            },
            admin: {
                profileType: "Admin Profile",
                description: "Full system access and management",
                permissions: [
                    "Full system access",
                    "User management",
                    "All report operations",
                    "System configuration"
                ],
                accessibleRoutes: ["*"]
            }
        };

        // Get role-specific data or default
        const roleData = roleSpecificData[role] || {
            profileType: "User Profile",
            description: "Standard user access",
            permissions: ["View assigned tasks"],
            accessibleRoutes: []
        };

        return res.status(200).json({
            message: "Profile retrieved successfully",
            profile: {
                ...profileData,
                ...roleData
            }
        });

    } catch (error) {
        console.error("Get user profile error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

/**
 * Multer configuration for profile photo upload
 * Accepts only image files (jpg, jpeg, png, gif, webp)
 * Max file size: 5MB
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Accept only image files
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

/**
 * Upload profile photo
 * POST /uploadProfilePhoto/:userId
 * Requires authentication and file upload
 */
const uploadProfilePhoto = async (req, res) => {
    try {
        const { userId } = req.params;
        const { userId: requestUserId, role } = req.user;

        // Check if user is updating their own photo or is admin
        if (userId !== requestUserId && role !== "admin") {
            return res.status(403).json({
                message: "You don't have permission to update this user's profile photo"
            });
        }

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded. Please select an image file."
            });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Delete old profile photo if exists
        if (user.profilePhoto) {
            try {
                await deleteFile(user.profilePhoto);
                console.log("✅ Old profile photo deleted successfully");
            } catch (error) {
                console.error("⚠️  Warning: Could not delete old profile photo:", error.message);
                // Continue with upload even if deletion fails
            }
        }

        // Upload new profile photo to S3
        console.log(`📤 Uploading profile photo for user: ${user.name}`);
        const photoUrl = await uploadfile(req.file, 'profile-photos');

        // Update user with new profile photo URL
        user.profilePhoto = photoUrl;
        await user.save();

        console.log(`✅ Profile photo uploaded successfully for user: ${user.name}`);

        return res.status(200).json({
            message: "Profile photo uploaded successfully",
            profilePhoto: photoUrl,
            user: {
                _id: user._id,
                name: user.name,
                contactNumber: user.contactNumber,
                role: user.role,
                phone: user.phone,
                profilePhoto: user.profilePhoto,
                isActive: user.isActive
            }
        });

    } catch (error) {
        console.error("Upload profile photo error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        if (error.message.includes('Invalid file type')) {
            return res.status(400).json({
                message: error.message
            });
        }

        if (error.message.includes('File too large')) {
            return res.status(400).json({
                message: "File size exceeds 5MB limit"
            });
        }

        return res.status(500).json({
            message: "Failed to upload profile photo",
            error: error.message
        });
    }
};

/**
 * Delete profile photo
 * DELETE /deleteProfilePhoto/:userId
 * Requires authentication
 */
const deleteProfilePhoto = async (req, res) => {
    try {
        const { userId } = req.params;
        const { userId: requestUserId, role } = req.user;

        // Check if user is deleting their own photo or is admin
        if (userId !== requestUserId && role !== "admin") {
            return res.status(403).json({
                message: "You don't have permission to delete this user's profile photo"
            });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Check if user has a profile photo
        if (!user.profilePhoto) {
            return res.status(404).json({
                message: "No profile photo to delete"
            });
        }

        // Delete profile photo from S3
        try {
            await deleteFile(user.profilePhoto);
            console.log(`✅ Profile photo deleted from S3 for user: ${user.name}`);
        } catch (error) {
            console.error("⚠️  Warning: Could not delete profile photo from S3:", error.message);
            // Continue with database update even if S3 deletion fails
        }

        // Remove profile photo URL from user
        user.profilePhoto = "";
        await user.save();

        console.log(`✅ Profile photo removed successfully for user: ${user.name}`);

        return res.status(200).json({
            message: "Profile photo deleted successfully",
            user: {
                _id: user._id,
                name: user.name,
                contactNumber: user.contactNumber,
                role: user.role,
                phone: user.phone,
                profilePhoto: user.profilePhoto,
                isActive: user.isActive
            }
        });

    } catch (error) {
        console.error("Delete profile photo error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        return res.status(500).json({
            message: "Failed to delete profile photo",
            error: error.message
        });
    }
};

/**
 * Get profile photo URL
 * GET /getProfilePhoto/:userId
 * Public route - no authentication required
 */
const getProfilePhoto = async (req, res) => {
    try {
        const { userId } = req.params;

        // Find user
        const user = await User.findById(userId).select('profilePhoto name');
        
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "Profile photo retrieved successfully",
            profilePhoto: user.profilePhoto || null,
            userName: user.name
        });

    } catch (error) {
        console.error("Get profile photo error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        return res.status(500).json({
            message: "Failed to retrieve profile photo"
        });
    }
};

export {
    registerUser,
    loginUser,
    getUser,
    updateUser,
    getUserProfile,
    uploadProfilePhoto,
    deleteProfilePhoto,
    getProfilePhoto,
    upload // Export multer middleware
};


