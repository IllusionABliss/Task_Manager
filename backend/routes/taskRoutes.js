const express = require("express");
const { protect, adminOnly} = require("../middlewares/authMiddleware");
const { validateCreateTask, validateUpdateTask, validateUpdateTaskStatus } = require("../middlewares/validationMiddleware");
const { getDashboardData, getUserDashboardData, getTasks, getTaskById, createTask, updateTask, deleteTask, updateTaskStatus, updateTaskChecklist, getSelfTasks, createSelfTask } = require("../controllers/taskController");

const router = express.Router();

//Task Management Routes
router.get("/dashboard-data", protect, getDashboardData);
router.get("/user-dashboard-data", protect, getUserDashboardData);
router.get("/", protect, getTasks);
router.get("/:id", protect, getTaskById);
router.post("/self", protect, validateCreateTask, createSelfTask);
router.post("/", protect, adminOnly, validateCreateTask, createTask);
router.put("/:id", protect, validateUpdateTask, updateTask);
router.delete("/:id", protect, deleteTask);
router.put("/:id/status", protect, validateUpdateTaskStatus, updateTaskStatus);
router.put("/:id/todo", protect, updateTaskChecklist);

module.exports = router;
