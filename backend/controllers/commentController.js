const Comment = require("../models/Comment");
const Task = require("../models/Task");
const User = require("../models/User");

// Get all comments for a task
const getComments = async (req, res) => {
    try {
        const { taskId } = req.params;

        // Verify task exists and user has access
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Check if user has permission to view this task
        const isCreator = task.createdBy.toString() === req.user.id;
        const isAssigned = task.assignedTo.some(id => id.toString() === req.user.id);
        const isAdmin = req.user.role === 'admin';

        if (!isCreator && !isAssigned && !isAdmin) {
            return res.status(403).json({ message: "Access denied" });
        }

        const comments = await Comment.find({ taskId })
            .populate('userId', 'name profileImageUrl')
            .sort({ createdAt: 1 }); // Oldest first for conversation flow

        res.status(200).json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Add a new comment to a task
const addComment = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { content, attachments } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ message: "Comment content is required" });
        }

        // Verify task exists and user has access
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Check if user has permission to comment on this task
        const isCreator = task.createdBy.toString() === req.user.id;
        const isAssigned = task.assignedTo.some(id => id.toString() === req.user.id);
        const isAdmin = req.user.role === 'admin';

        if (!isCreator && !isAssigned && !isAdmin) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Get user details for the comment
        const user = await User.findById(req.user.id).select('name profileImageUrl');

        const newComment = new Comment({
            taskId,
            userId: req.user.id,
            userName: user.name,
            userProfileImage: user.profileImageUrl,
            content: content.trim(),
            attachments: attachments || []
        });

        await newComment.save();

        // Populate user details for response
        await newComment.populate('userId', 'name profileImageUrl');

        res.status(201).json(newComment);
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete a comment
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Check if user can delete this comment (comment author or admin)
        const isAuthor = comment.userId.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isAuthor && !isAdmin) {
            return res.status(403).json({ message: "Access denied" });
        }

        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getComments,
    addComment,
    deleteComment
};