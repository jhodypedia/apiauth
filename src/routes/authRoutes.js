// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rute untuk registrasi
router.post('/register', authController.register);

// Rute untuk login
router.post('/login', authController.login);

// Rute untuk forgot password
router.post('/forgot-password', authController.forgotPassword);

// Rute untuk reset password
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
