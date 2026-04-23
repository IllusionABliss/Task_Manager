const Task = require("../models/Task");

// @desc Get all tasks (Admin: all, User: only assigned tasks)
// @route GET /api/tasks/
// @access Private
const getTasks = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc", search } = req.query;

    // Parse pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Max 100 items per page
    const skip = (pageNum - 1) * limitNum;

    // Base filter logic
    let baseFilter;

    if (req.user.role === "admin") {
      // Exclude member-created self tasks (only allow admin's own self tasks)
      baseFilter = {
        $or: [
          { createdBySelf: { $ne: true } }, // all normal tasks
          { createdBySelf: true, createdBy: req.user._id }, // admin's own self tasks
        ],
      };
    } else {
      baseFilter = { assignedTo: req.user._id };
    }

    // Add search filter if provided
    if (search && search.trim()) {
      baseFilter = {
        ...baseFilter,
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Add status or overdue filter
    let taskFilter = { ...baseFilter };

    if (status === "Overdue") {
      taskFilter = {
        ...taskFilter,
        status: { $ne: "Completed" },
        dueDate: { $lt: new Date() },
      };
    } else if (status) {
      taskFilter = {
        ...taskFilter,
        status: status,
      };
    }

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Fetch tasks with pagination
    let tasks = await Task.find(taskFilter)
      .populate("assignedTo", "name email profileImageUrl")
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    // Add completed checklist count + overdue status
    tasks = await Promise.all(
      tasks.map(async (task) => {
        const completedCount = task.todoChecklist.filter(
          (item) => item.completed
        ).length;

        const isOverdue =
          task.status !== "Completed" && new Date(task.dueDate) < new Date();

        return {
          ...task._doc,
          completedTodoCount: completedCount,
          status: isOverdue ? "Overdue" : task.status,
          createdBySelf: task.createdBySelf,
        };
      })
    );

    // === Status Summary Counts ===
    const allTasks = await Task.countDocuments(baseFilter);

    const pendingTasks = await Task.countDocuments({
      ...baseFilter,
      status: "Pending",
    });

    const inProgressTasks = await Task.countDocuments({
      ...baseFilter,
      status: "In Progress",
    });

    const completedTasks = await Task.countDocuments({
      ...baseFilter,
      status: "Completed",
    });

    const overdueTasks = await Task.countDocuments({
      ...baseFilter,
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() },
    });

    const totalPages = Math.ceil(
      (status === "Overdue" ? overdueTasks : status && status !== "All" ? 
        (status === "Pending" ? pendingTasks : status === "In Progress" ? inProgressTasks : status === "Completed" ? completedTasks : allTasks) 
        : allTasks) / limitNum
    );

    res.json({
      tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems: status === "Overdue" ? overdueTasks : status && status !== "All" ? 
          (status === "Pending" ? pendingTasks : status === "In Progress" ? inProgressTasks : status === "Completed" ? completedTasks : allTasks) 
          : allTasks,
        totalPages,
      },
      statusSummary: {
        all: allTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all self-created tasks by the logged-in user
// @route   GET /api/tasks/self
// @access  Private (Member)
const createSelfTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      attachments,
      todoChecklist,
    } = req.body;

    const isSelfTask =
      req.user.role === "admin" || req.user.role === "member"; // both can self-create

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      attachments,
      todoChecklist,
      assignedTo: [req.user._id], // self-assigned
      createdBy: req.user._id,
      createdBySelf: isSelfTask,
    });

    res.status(201).json({ message: "Self task created successfully", task });
  } catch (error) {
    console.error("Error creating self task", error);
    res.status(500).json({ message: "Failed to create self task" });
  }
};

// @desc Get task by ID
// @route GET /api/tasks/:id
// @access Private
const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        )

        if(!task) return res.status(404).json({ message : "Task not found"});

        res.json(task);
    } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Create a new task (Admin only)
// @route POST/api/tasks/
// @access Private (Admin)
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            attachments,
            todoChecklist,
        } = req.body;

        let assignedUsers = assignedTo;

        if (!Array.isArray(assignedTo)) {
            return res.status(400).json({ message: "assignedTo must be an array of user IDs" });
            }

            // If assignedTo is empty but user is admin → fallback to self if intent is to self-assign
            if (assignedTo.length === 0) {
            assignedUsers = [req.user._id];
        }

        const isSelfTask =
          assignedUsers.length === 1 &&
          assignedUsers[0].toString() === req.user._id.toString() &&
          req.user.role === "admin";

        const task = await Task.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo: assignedUsers,
            createdBy: req.user._id,
            todoChecklist,
            attachments,
            createdBySelf: isSelfTask,
        });

        res.status(201).json({ message: "Task created successfully", task });
    } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Update task details
// @route PUT/api/tasks/id
// @access Private
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) return res.status(404).json({ message: "Task not found" });
        
        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.priority = req.body.priority || task.priority;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
        task.attachments = req.body.attachments || task.attachments;
        
        if (req.body.assignedTo) {
            if (!Array.isArray (req.body.assignedTo)) {
                return res
                .status(400)
                .json({ message: "assigned To must be an array of user IDs" });
        }
    task.assignedTo = req.body.assignedTo;
    }

    const updatedTask = await task.save();
    res.json({ message: "Task updated successfully", updatedTask });
    } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Delete a task (Admin only)
// @route DELETE /aps/tasks/rid
// @access Public
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    const isAdmin = req.user.role === "admin";
    const isTaskOwner = task.createdBy.toString() === req.user._id.toString();

    // Allow only admins or members deleting their own task
    if (!isAdmin && !isTaskOwner) {
      return res.status(403).json({ message: "Not authorized to delete this task" });
    }

    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @dese Update task status
// @route PUT/api/tasks/id/status
// @access Private
const updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        const isAssigned = task.assignedTo.some(
            (userId) => userId.toString() === req.user._id.toString()
        );

        if (!isAssigned && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized" });
        }
        
        task.status = req.body.status || task.status;

        if (task.status === "Completed") {
            task.todoChecklist.forEach((item) => (item.completed = true));
            task.progress = 100;
        }

        await task.save();
        res.json({ message: "Task status updated", task });
    } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Update task checklist
// @route PUT/api/tasks/110/todo
// @access Private
const updateTaskChecklist = async (req, res) => {
    try {
        const { todoChecklist } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) return res.status (404).json({ message: "Task not found" });

        if (!task.assignedTo.includes(req.user._id) && req.user.role !== "admin") {
        return res
            .status(403)
            .json({ message: "Not authorized to update checklist" });
        }

        task.todoChecklist = todoChecklist; // Replace with updated checklist
        
        // Auto-update progress based on checklist completion
        const completedCount = task.todoChecklist.filter(
            (item) => item.completed
        ).length;
        const totalItems = task.todoChecklist.length;
        task.progress =
        totalItems > 0 ? Math.round((completedCount / totalItems) * 100): 0;

        // Auto-mark task as completed if all items are checked
        if (task.progress === 100) {
        task.status = "Completed";
        } else if (task.progress > 0) {
        task.status = "In Progress";
        } else {
        task.status = "Pending";
        }

        await task.save();
        const updatedTask = await Task.findById(req.params.id).populate(
        "assignedTo",
        "name email profileImageUrl"
        );
        
        res.json({ message: "Task checklist updated", task: updatedTask });
    } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Dashboard Data (Admin only)
// @route GET/ap/tasks/dashboard-data
// @access Private
const getDashboardData = async (req, res) =>{
    try {
        let baseFilter;
        if (req.user.role === "admin") {
          // Exclude member-created self tasks (only allow admin's own self tasks)
          baseFilter = {
            $or: [
              { createdBySelf: { $ne: true } }, // all normal tasks
              { createdBySelf: true, createdBy: req.user._id }, // only admin's own self-tasks
            ],
          };
        } else {
          baseFilter = { assignedTo: req.user._id };
        }

         // Count stats
        const totalTasks = await Task.countDocuments(baseFilter);
        const pendingTasks = await Task.countDocuments({
            ...baseFilter,
            status: "Pending",
        });
        const completedTasks = await Task.countDocuments({
            ...baseFilter,
            status: "Completed",
        });
        const overdueTasks = await Task.countDocuments({
            ...baseFilter,
            status: { $ne: "Completed" },
            dueDate: { $lt: new Date() },
        });

        // Ensure all possible statuses are included
        const taskStatuses = ["Pending", "In Progress", "Completed"];
        const taskDistributionRaw = await Task.aggregate([
        { $match: baseFilter },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1},
            },
        },
        ]);

        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const formattedKey = status.replace(/\s+/g, ""); // Remove spaces for response keys
            acc[formattedKey] =
                taskDistributionRaw.find((item) => item._id === status)?.count ||0;
            return acc;
        }, {});
        taskDistribution["All"] = totalTasks; //Add total count to taskDistribution

        //Ensure all priority levels are included.
        const taskPriorities = ["Low", "Medium", "High"];
        const taskPriorityLevelsRaw = await Task.aggregate([
        { $match: baseFilter },
        {
            $group: {
                _id: "$priority",
                count: { $sum: 1 },
            },
        },
        ]);
        const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
            acc [priority] =
                taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
            return acc;
        }, {});

        // Fetch recent 10 tasks
        const recentTasks = await Task.find(baseFilter)
            .sort({ createdAt: -1})
            .limit(10)
            .select("title status priority dueDate createdAt");

        res.status (200).json({
            statistics:{
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts: {
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks,
        });
    } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc Dashboard Data (User-specific)
// @route GET/ap/tasks/user-dashboard-data
// @access Private
const getUserDashboardData = async (req, res) =>{
    try {
        const userId = req.user._id; // Only fetch data for the logged-in user
        
        // Fetch statistics for user-specific tasks
        const totalTasks = await Task.countDocuments ({ assignedTo: userId });
        const pendingTasks = await Task.countDocuments ({ assignedTo: userId, status: "Pending" });
        const completedTasks = await Task.countDocuments({ assignedTo: userId, status: "Completed" });
        const overdueTasks = await Task.countDocuments({
            assignedTo: userId,
            status: { $ne: "Completed" },
            dueDate: { $lt: new Date() },
        });

        // Task distribution by status
        const taskStatuses = ["Pending", "In Progress", "Completed"];
        const taskDistributionRaw = await Task.aggregate([
            { $match: { assignedTo: userId } },
            { $group: {_id: "$status", count: { $sum: 1}}},
        ]);
        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const formattedKey = status.replace(/\s+/g, "");
            acc[formattedKey] =
                taskDistributionRaw.find((item) => item._id === status)?.count || 0;
            return acc;
        }, {});
        taskDistribution["All"] = totalTasks;

        //Task distribution by priority
        const taskPriorities = ["Low", "Medium", "High"];
        const taskPriorityLevelsRaw = await Task.aggregate([
            { $match: { assignedTo: userId } },
            { $group: {_id: "$priority", count: { $sum: 1}}},
        ]);

        const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
            acc [priority] =
                taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
            
                return acc;
        }, {});
        // Fetch recent 10 tasks for the logged-in user
        const recentTasks = await Task.find({ assignedTo: userId })
            .sort({ createdAt: -1})
            .limit(10)
            .select("title status priority dueDate createdAt");

        res.status (200).json({
            statistics:{
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
            },
            charts: {
                taskDistribution,
                taskPriorityLevels,
            },
            recentTasks,
        });
    } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getTasks,
    createSelfTask,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    getDashboardData,
    getUserDashboardData,
}