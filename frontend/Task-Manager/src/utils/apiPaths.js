export const BASE_URL = "http://localhost:8000";

// utils/apiPaths.js
export const API_PATHS = {
AUTH: {
    REGISTER: "/api/auth/register", // Register a new user (Admin or Member)
    LOGIN: "/api/auth/login", // Authenticate user & return JWT token
    GET_PROFILE: "/api/auth/profile", // Get logged-in user details
    UPDATE_PROFILE: "/api/auth/profile", // Update user profile
    CHANGE_PASSWORD: "/api/auth/change-password", // Change user password
},

USERS: {
    GET_ALL_USERS: "/api/users", // Get all users (Admin only)
    GET_USER_BY_ID: (userId) => `/api/users/${userId}`, // Get user by ID
    CREATE_USER: "/api/users", // Create a new user (Admin only)
    CREATE_SELF_TASKS: "/api/tasks/self", // Create a Self Task
    UPDATE_USER: (userId) => `/api/users/${userId}`, // Update user details
    DELETE_USER: (userId) => `/api/users/${userId}`, // Delete a user 
},

TASKS: {
    GET_DASHBOARD_DATA: "/api/tasks/dashboard-data", // Get Dashboard Data
    GET_USER_DASHBOARD_DATA: "/api/tasks/user-dashboard-data", // Get User Dashboard
    GET_ALL_TASKS: "/api/tasks", // Get all tasks (Admin: all, User: only assign
    GET_TASK_BY_ID: (taskId) => `/api/tasks/${taskId}`, // Get task by ID
    CREATE_TASK: "/api/tasks", // Create a new task (Admin only)
    CREATE_SELF_TASKS: "/api/tasks/self", // Create a Self Task (Member Only)
    UPDATE_TASK: (taskId) => `/api/tasks/${taskId}`, // Update task details
    DELETE_TASK: (taskId) => `/api/tasks/${taskId}`, // Delete a task (Admin only)
    
    UPDATE_TASK_STATUS: (taskId) => `/api/tasks/${taskId}/status`, // Update tas
    UPDATE_TODO_CHECKLIST: (taskId) => `/api/tasks/${taskId}/todo`, // Update to 
},

REPORTS: {
    EXPORT_TASKS: "/api/reports/export/tasks", //Download all tasks as an Excel
    EXPORT_USERS: "/api/reports/export/users", // Downlad user-task report
},

COMMENTS: {
    GET_COMMENTS: (taskId) => `/api/comments/${taskId}`, // Get all comments for a task
    ADD_COMMENT: (taskId) => `/api/comments/${taskId}`, // Add a new comment to a task
    DELETE_COMMENT: (commentId) => `/api/comments/${commentId}`, // Delete a comment
},

IMAGE: {
    UPLOAD_IMAGE:"/api/auth/upload-image"
},
}