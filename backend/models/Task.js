const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
});

const taskSchema= new mongoose.Schema (
    {
        title: { type: String, required: true },
        description: { type: String},
        priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
        status: { type: String, enum: ["Pending", "In Progress", "Completed"], default: "Pending" },
        dueDate: { type: Date, required: true },
        assignedTo: [{ type: mongoose.Schema. Types.ObjectId, ref: "User"}],
        createdBy: { type: mongoose.Schema. Types.ObjectId, ref: "User"},
        createdBySelf: { type: Boolean, default: false },
        attachments: [{ type: String}],
        todoChecklist: [todoSchema],
        progress: { type: Number, default: 0},
        notifiedOverdue: { type: Boolean, default: false }
    },
    { timestamps: true }
);

// Add indexes for performance optimization
taskSchema.index({ title: 'text', description: 'text' }); // For search functionality
taskSchema.index({ status: 1 }); // For status filtering
taskSchema.index({ priority: 1 }); // For priority sorting/filtering
taskSchema.index({ dueDate: 1 }); // For due date sorting
taskSchema.index({ createdAt: 1 }); // For creation date sorting
taskSchema.index({ createdBy: 1 }); // For filtering tasks by creator
taskSchema.index({ assignedTo: 1 }); // For filtering tasks by assignee
taskSchema.index({ status: 1, dueDate: 1 }); // Compound index for dashboard queries

module.exports = mongoose.model("Task", taskSchema);