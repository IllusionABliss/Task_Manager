require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db")
const { apiLimiter } = require("./middlewares/rateLimitMiddleware");

const app = express();

const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const taskRoutes = require("./routes/taskRoutes")
const reportRoutes = require("./routes/reportRoutes")
const commentRoutes = require("./routes/commentRoutes")

// Initialize cron jobs
require("./cron/overdueTaskChecker");

//Middleware to handle CORS
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Apply general rate limiting to all API routes
app.use("/api/", apiLimiter);

//Connect Database
connectDB();

// Middleware
app.use(express.json());

// Ensure 'uploads' folder exists
const fs = require("fs");
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}


//Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/comments", commentRoutes);

// Server uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));