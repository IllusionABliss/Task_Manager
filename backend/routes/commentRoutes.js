const express = require("express");
const { getComments, addComment, deleteComment } = require("../controllers/commentController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// All comment routes require authentication
router.use(protect);

// Get all comments for a task
router.get("/:taskId", getComments);

// Add a new comment to a task
router.post("/:taskId", addComment);

// Delete a comment
router.delete("/:commentId", deleteComment);

module.exports = router;