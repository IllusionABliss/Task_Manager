const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema (
{
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImageUrl: { type: String, default: null},
    role: { type: String, enum: ["admin", "member"], default: "member" }, // Role-based access
},
    { timestamps: true }
);

// Add indexes for performance optimization
UserSchema.index({ role: 1 }); // For role-based filtering
UserSchema.index({ name: 'text' }); // For name search functionality

module.exports = mongoose.model("User", UserSchema);