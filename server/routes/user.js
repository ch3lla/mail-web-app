const express = require("express");
const router = express.Router();
const authController = require("../controllers/AuthController");
const authenticateUser = require("../middleware/auth");

// User routes
router.get("/", authController.homepage);
router.get("/register", authController.registerPage);
router.get("/login", authController.loginPage);
router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.get("/logout", authController.logoutUser);
router.get("/email", authController.emailPage);
router.post("/email", authenticateUser, authController.sendEmail);

module.exports = router;
