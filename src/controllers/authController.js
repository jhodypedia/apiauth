// src/controllers/authController.js
const authService = require('../services/authService');

// Controller untuk registrasi user baru
const register = async (req, res) => {
  const { email, nohp, username, nama_lengkap, password } = req.body;

  try {
    const user = await authService.registerUser(email, nohp, username, nama_lengkap, password);
    res.status(201).json({
      message: 'User created successfully',
      user: {
        email: user.email,
        nohp: user.nohp,
        apikey: user.apikey,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Controller untuk login user
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { message, user, token } = await authService.loginUser(email, password);
    res.status(200).json({
      message,
      user: {
        email: user.email,
        nohp: user.nohp
      },
      token
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Controller untuk forgot password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    await authService.sendResetEmail(email);
    res.status(200).json({ message: 'Reset email sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Controller untuk reset password
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    await authService.resetPassword(token, newPassword);
    res.status(200).json({ message: 'Password has been successfully updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { register, login, forgotPassword, resetPassword };
