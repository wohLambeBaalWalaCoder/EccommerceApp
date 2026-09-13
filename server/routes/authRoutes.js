const express = require("express");

const router = express.Router();

const {
  register,
  login,
  logout,
  getMe,
} = require("../controllers/authController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes (Customer & Admin)
router.get("/me", protect, getMe);

// Role-protected route (Admin only)
router.get("/admin", protect, authorize("admin"), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Welcome to the Admin portal, ${req.user.name}!`,
    adminUser: req.user,
  });
});

module.exports = router;
