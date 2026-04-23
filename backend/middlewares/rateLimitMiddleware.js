const rateLimit = require("express-rate-limit");

// Login rate limiter - strict limit
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 login attempts
  message: "Too many login attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method !== "POST", // Only count POST requests
});

// Registration rate limiter
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Maximum 3 registrations per hour per IP
  message: "Too many accounts created, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Maximum 100 requests per 15 minutes
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict API rate limiter for sensitive operations
const strictApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Maximum 30 requests per 15 minutes
  message: "Too many requests for this resource, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  registerLimiter,
  apiLimiter,
  strictApiLimiter,
};
