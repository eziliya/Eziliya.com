import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobileNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ["technical engineer", "valuer", "office engineer", "site engineer", "sales-team"] },

},{timestamps: true});
const userModel = mongoose.model("User", userSchema);
export default userModel;