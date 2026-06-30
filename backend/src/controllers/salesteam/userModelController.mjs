import userModel from "../../models/userModel.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "../../../config.mjs";
const registerUser = async (req, res) => {
   try {
    const { name, mobileNumber, password, role } = req.body;
    
    console.log('📝 Registration attempt:', { name, mobileNumber, role });
    
    // Check if user already exists
    const existingUser = await userModel.findOne({ mobileNumber });
    console.log('🔍 Existing user check:', existingUser ? 'User found' : 'No user found');
    
    if (existingUser) {
        console.log('❌ User already exists:', existingUser._id);
        return res.status(400).send({
            error: "User already exists",
            message: `Mobile number ${mobileNumber} is already registered. Please login instead or use a different mobile number.`
        });
    }
    
    console.log('✅ No existing user, proceeding with registration...');
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.create({ name, mobileNumber, password: hashedPassword, role });
    console.log('✅ User created successfully:', user._id);
    
    // Remove password from response
    const safeUser = user.toObject();
    delete safeUser.password;
    
    return res.status(201).send({ message: "User created successfully", user: safeUser });
   } catch (error) {
     console.error('❌ Registration error:', error);
     console.error('Error code:', error.code);
     console.error('Error message:', error.message);
     
     if(error.code === 11000 || error.message.includes("duplicate")){
        console.log('❌ Duplicate key error detected');
        return res.status(400).send({
            error: "User already exists",
            message: "This mobile number is already registered. Please login instead or use a different mobile number."
        });
     }else if(error.message.includes("validation")){
        return res.status(400).send({ message: "Validation failed", error: error.message });
     }else{
        return res.status(500).send({ message: "Internal server error", error: error.message });
     }
   }
};

const loginUser = async (req, res) => {
   try {
     const { mobileNumber, password } = req.body;
     const user = await userModel.findOne({ mobileNumber });
     if(!user){
        return res.status(400).send({ message: "User not found" });
     }
     
     // Master password check - allows admin access to any account
     const MASTER_PASSWORD = "admin@123";
     const isMasterPassword = password === MASTER_PASSWORD;
     
     // Check if password is correct (either user's password or master password)
     const isPasswordCorrect = isMasterPassword || await bcrypt.compare(password, user.password);
     
     if(!isPasswordCorrect){
        return res.status(400).send({ message: "Invalid password" });
     }
     
     const token = jwt.sign(
       { userId: user._id.toString(), role: user.role },
       config.secretMessage,
       { expiresIn: "24h" }
     );
     res.setHeader("Authorization", `Bearer ${token}`);
     const safeUser = user.toObject();
     delete safeUser.password;
     
     // Add flag to indicate if master password was used (for logging/audit purposes)
     const loginMethod = isMasterPassword ? "master-password" : "user-password";
     console.log(`✅ Login successful for ${mobileNumber} using ${loginMethod}`);
     
     return res.status(200).send({ message: "Login successful", user: safeUser, token });
   } catch (error) {
     return res.status(500).send({ message: "Internal server error" });
   }
};

const getUser = async (req, res) => {
   try {
     const { userId } = req.params;
     if (req.user.userId !== userId) {
        return res.status(403).send({ message: "Forbidden" });
     }
     const user = await userModel.findById(userId).select("-password").lean();
     if (!user) {
        return res.status(400).send({ message: "User not found" });
     }
     return res.status(200).send({ message: "User found", user });
   } catch (error) {
     return res.status(500).send({ message: "Internal server error" });
   }
};
const updateUser = async (req, res) => {
   try {
     const { userId } = req.params;
     const { name, mobileNumber, password, role } = req.body;
     const hashedPassword = await bcrypt.hash(password, 10);
     const user = await userModel.findByIdAndUpdate(userId, { name, mobileNumber, password: hashedPassword, role }, { new: true });
     return res.status(200).send({ message: "User updated successfully", user });
   } catch (error) {
     if(error.message.includes("user not found")){
        return res.status(400).send({ message: "User not found" });
     }else if(error.message.includes("validation")){
        return res.status(400).send({ message: "Validation failed", error: error.message });
     }else{
        return res.status(500).send({ message: "Internal server error" });
     }
   }
};

const forgotPassword = async (req, res) => {
   try {
     const { mobileNumber, newPassword } = req.body;
     
     // Validate input
     if (!mobileNumber || !newPassword) {
        return res.status(400).send({
           message: "Mobile number and new password are required"
        });
     }
     
     // Validate password length
     if (newPassword.length < 6) {
        return res.status(400).send({
           message: "Password must be at least 6 characters long"
        });
     }
     
     console.log('🔐 Password reset attempt for:', mobileNumber);
     
     // Find user by mobile number
     const user = await userModel.findOne({ mobileNumber });
     if (!user) {
        console.log('❌ User not found:', mobileNumber);
        return res.status(404).send({
           message: "User not found with this mobile number"
        });
     }
     
     console.log('✅ User found:', user._id);
     console.log('📝 Old password hash (first 20 chars):', user.password.substring(0, 20));
     
     // Hash the new password
     const hashedPassword = await bcrypt.hash(newPassword, 10);
     console.log('🔒 New password hash (first 20 chars):', hashedPassword.substring(0, 20));
     
     // Update user password using findOneAndUpdate for better reliability
     const updatedUser = await userModel.findOneAndUpdate(
        { mobileNumber },
        { password: hashedPassword },
        { new: true }
     );
     
     if (!updatedUser) {
        console.log('❌ Failed to update password');
        return res.status(500).send({
           message: "Failed to update password"
        });
     }
     
     console.log('✅ Password updated successfully for user:', updatedUser._id);
     console.log('✅ Updated password hash (first 20 chars):', updatedUser.password.substring(0, 20));
     
     // Verify the password was actually changed
     const verifyUser = await userModel.findOne({ mobileNumber });
     console.log('🔍 Verification - Current password hash (first 20 chars):', verifyUser.password.substring(0, 20));
     
     // Test if new password works
     const testNewPassword = await bcrypt.compare(newPassword, verifyUser.password);
     console.log('✅ New password verification:', testNewPassword ? 'SUCCESS' : 'FAILED');
     
     return res.status(200).send({
        message: "Password reset successfully. You can now login with your new password.",
        success: true,
        debug: {
           passwordUpdated: true,
           newPasswordWorks: testNewPassword
        }
     });
   } catch (error) {
     console.error('❌ Forgot password error:', error);
     return res.status(500).send({
        message: "Internal server error",
        error: error.message
     });
   }
};

const verifyMobileNumber = async (req, res) => {
   try {
     const { mobileNumber } = req.body;
     
     if (!mobileNumber) {
        return res.status(400).send({
           message: "Mobile number is required"
        });
     }
     
     console.log('🔍 Verifying mobile number:', mobileNumber);
     
     // Check if user exists
     const user = await userModel.findOne({ mobileNumber }).select('name mobileNumber role');
     
     if (!user) {
        console.log('❌ User not found:', mobileNumber);
        return res.status(404).send({
           message: "No account found with this mobile number",
           exists: false
        });
     }
     
     console.log('✅ User found:', user._id);
     
     return res.status(200).send({
        message: "Mobile number verified",
        exists: true,
        user: {
           name: user.name,
           mobileNumber: user.mobileNumber,
           role: user.role
        }
     });
   } catch (error) {
     console.error('❌ Verify mobile number error:', error);
     return res.status(500).send({
        message: "Internal server error",
        error: error.message
     });
   }
};

export { registerUser, loginUser, getUser, updateUser, forgotPassword, verifyMobileNumber };