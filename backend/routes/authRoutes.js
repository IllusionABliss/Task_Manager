const express = require("express");
const { registerUser, loginUser, getUserProfile, updateUserProfile, changePassword } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const { validateRegister, validateLogin, validateChangePassword, validateUpdateProfile } = require("../middlewares/validationMiddleware");
const { loginLimiter, registerLimiter } = require("../middlewares/rateLimitMiddleware");

const router =  express.Router();

//Auth Routes   
router.post("/register", registerLimiter, validateRegister, registerUser);
router.post("/login", loginLimiter, validateLogin, loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, validateUpdateProfile, upload.single("profileImage"), updateUserProfile);
router.put("/change-password", protect, validateChangePassword, changePassword);

router.post("/upload-image", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded"});
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
    }`;
    res.status(200).json({ imageUrl });
});

module.exports = router;