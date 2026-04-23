const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
    {
        taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        userName: { type: String, required: true }, // Store name for display
        userProfileImage: { type: String, default: null }, // Store profile image URL
        content: { type: String, required: true, trim: true },
        attachments: [{ type: String }], // Optional file attachments
    },
    { timestamps: true }
);

// Add indexes for performance
commentSchema.index({ taskId: 1, createdAt: -1 }); // For fetching comments by task, newest first
commentSchema.index({ userId: 1 }); // For user's comments

module.exports = mongoose.model("Comment", commentSchema);