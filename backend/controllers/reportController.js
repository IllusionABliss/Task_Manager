const Task = require("../models/Task");
const User = require("../models/User");
const excelJS = require("exceljs");

// @desc Export all tasks as an Excel file
// @route GET /api/reports/export/tasks
// @access Private (Admin)
const exportTasksReport = async (req, res) => {
  try {
    const adminId = req.user._id;

    const tasks = await Task.find({
      $or: [
        // Tasks created by this admin (including assigned to others)
        { createdBy: adminId },

        // Self tasks created by this admin
        { createdBy: adminId, createdBySelf: true }
      ],
      // Exclude member self-tasks
      $or: [
        { createdBySelf: { $ne: true } },
        { createdBy: adminId }
      ]
    }).populate("assignedTo", "name email");

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Task Report");

    worksheet.columns = [
      { header: "Task ID", key: "_id", width: 25 },
      { header: "Title", key: "title", width: 30 },
      { header: "Description", key: "description", width: 50 },
      { header: "Priority", key: "priority", width: 15 },
      { header: "Status", key: "status", width: 20 },
      { header: "Due Date", key: "dueDate", width: 20 },
      { header: "Assigned To", key: "assignedTo", width: 30 },
    ];

    tasks.forEach((task) => {
      const assignedTo = task.assignedTo
        .map((user) => `${user.name} (${user.email})`)
        .join(",");
      const isOverdue =
        task.status !== "Completed" && new Date(task.dueDate) < new Date();
      worksheet.addRow({
        _id: task._id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate.toISOString().split("T")[0],
        assignedTo: assignedTo || "Unassigned",
        overdue: isOverdue ? "Yes" : "No",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="tasks_report.xlsx"'
    );

    return workbook.xlsx.write(res).then(() => {
      res.end();
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error exporting tasks", error: error.message });
  }
};

// @desc Export user-task report as an Excel file
// @route GET /api/reports/export/users
// @access Private (Admin)
const exportUsersReport = async (req, res) => {
  try {
    const adminId = req.user._id;

    // Fetch all users
    const users = await User.find().select("name email _id role").lean();

    // Sort users: admins first, then members
    users.sort((a, b) => {
      if (a.role === "admin" && b.role !== "admin") return -1;
      if (a.role !== "admin" && b.role === "admin") return 1;
      return a.name.localeCompare(b.name);
    });

    // Fetch tasks created by this admin, including admin self-tasks
    const userTasks = await Task.find({
      $or: [
        { createdBy: adminId, createdBySelf: { $ne: true } }, // tasks assigned by admin
        { createdBy: adminId, createdBySelf: true },           // self-tasks by this admin
      ]
    }).populate("assignedTo", "name email");

    // Map to count tasks per user
    const userTaskMap = {};
    users.forEach((user) => {
      userTaskMap[user._id] = {
        name: user.name,
        email: user.email,
        role: user.role,
        taskCount: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
      };
    });

    userTasks.forEach((task) => {
      const isOverdue = task.status !== "Completed" && new Date(task.dueDate) < new Date();

      if (task.assignedTo && task.assignedTo.length > 0) {
        task.assignedTo.forEach((assignedUser) => {
          const userStats = userTaskMap[assignedUser._id];
          if (userStats) {
            userStats.taskCount += 1;
            if (task.status === "Pending") userStats.pendingTasks += 1;
            else if (task.status === "In Progress") userStats.inProgressTasks += 1;
            else if (task.status === "Completed") userStats.completedTasks += 1;
            if (isOverdue) userStats.overdueTasks += 1;
          }
        });
      }
    });

    // Create Excel
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Task Report");

    worksheet.columns = [
      { header: "User Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 40 },
      { header: "Role", key: "role", width: 20 },
      { header: "Total Assigned Tasks", key: "taskCount", width: 20 },
      { header: "Pending Tasks", key: "pendingTasks", width: 20 },
      { header: "In Progress Tasks", key: "inProgressTasks", width: 20 },
      { header: "Completed Tasks", key: "completedTasks", width: 20 },
      { header: "Overdue Tasks", key: "overdueTasks", width: 15 },
    ];

    Object.values(userTaskMap).forEach((user) => {
      worksheet.addRow(user);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="users_report.xlsx"'
    );

    return workbook.xlsx.write(res).then(() => {
      res.end();
    });

  } catch (error) {
    res.status(500).json({ message: "Error exporting tasks", error: error.message });
  }
};

module.exports = {
    exportTasksReport,
    exportUsersReport,
};