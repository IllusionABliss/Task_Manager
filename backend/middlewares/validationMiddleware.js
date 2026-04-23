const { body, validationResult } = require("express-validator");

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Validation error", errors: errors.array() });
  }
  next();
};

// Auth validation
const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("email")
    .normalizeEmail()
    .isEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  handleValidationErrors,
];

const validateLogin = [
  body("email")
    .normalizeEmail()
    .isEmail()
    .withMessage("Valid email is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
  handleValidationErrors,
];

const validateChangePassword = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters"),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required"),
  handleValidationErrors,
];

// Task validation
const validateCreateTask = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 5 })
    .withMessage("Description must be at least 5 characters"),
  body("priority")
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be Low, Medium, or High"),
  body("dueDate")
    .isISO8601()
    .withMessage("Valid due date is required"),
  body("assignedTo")
    .isArray()
    .withMessage("assignedTo must be an array"),
  handleValidationErrors,
];

const validateUpdateTask = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 5 })
    .withMessage("Description must be at least 5 characters"),
  body("priority")
    .optional()
    .isIn(["Low", "Medium", "High"])
    .withMessage("Priority must be Low, Medium, or High"),
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Valid due date is required"),
  handleValidationErrors,
];

const validateUpdateTaskStatus = [
  body("status")
    .isIn(["Pending", "In Progress", "Completed"])
    .withMessage("Status must be Pending, In Progress, or Completed"),
  handleValidationErrors,
];

// User validation
const validateUpdateProfile = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateCreateTask,
  validateUpdateTask,
  validateUpdateTaskStatus,
  validateUpdateProfile,
  handleValidationErrors,
};
