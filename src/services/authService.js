const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Koneksi database
const sendEmail = require('./emailService'); // Kirim email

// Fungsi untuk registrasi user baru
const registerUser = (email, nohp, username, nama_lengkap, password) => {
  return new Promise((resolve, reject) => {
    console.log("Registering user with the following data:");
    console.log({ email, nohp, username, nama_lengkap, password });

    // Validasi input untuk memastikan tidak ada nilai undefined atau kosong
    if (!email || !nohp || !username || !nama_lengkap || !password) {
      reject(new Error('Email, Nohp, Username, Nama Lengkap, or Password cannot be undefined or empty'));
      return;
    }

    // Cek apakah email, username, atau nohp sudah terdaftar
    const checkQuery = 'SELECT * FROM users WHERE email = ? OR username = ? OR nohp = ?';
    db.query(checkQuery, [email, username, nohp], (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      // Jika ada hasil, berarti sudah ada pengguna dengan email, username, atau nohp yang sama
      if (results.length > 0) {
        reject(new Error('Email, Username, or Nohp is already registered'));
        return;
      }

      // Jika email, username, dan nohp belum terdaftar, lanjutkan ke proses pembuatan user
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          reject(err);
          return;
        }

        // Menghasilkan apikey dengan awalan 'PN-APIKEY-' dan string acak
        const apikey = `PN-${crypto.randomBytes(6).toString('hex')}`;  // 32 bytes menghasilkan 64 karakter hex string

        // Menyimpan data user baru ke dalam database dengan default role 'user'
        const query = 'INSERT INTO users (email, nohp, username, nama_lengkap, apikey, password, role) VALUES (?, ?, ?, ?, ?, ?, ?)';

        db.query(query, [email, nohp, username, nama_lengkap, apikey, hashedPassword, 'user'], (err, result) => {
          if (err) {
            console.error('Error executing query:', err);
            reject(err);
            return;
          }

          // Pastikan result.insertId ada sebelum melanjutkan
          if (result && result.insertId) {
            resolve({ id: result.insertId, email, nohp, username, nama_lengkap, apikey, role: 'user' });
          } else {
            reject(new Error('Failed to create user'));
          }
        });
      });
    });
  });
};

// Fungsi untuk login user
const loginUser = (email, password) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE email = ? OR username = ? OR nohp = ?';

    db.query(query, [email, email, email], (err, results) => {
      if (err) reject(err);
      if (results.length === 0) {
        reject(new Error('User not found'));
      }

      const user = results[0];
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) reject(err);
        if (!isMatch) {
          reject(new Error('Invalid password'));
        }

        // Generate JWT token
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          'your_jwt_secret_key',  // Ganti dengan kunci rahasia Anda
          { expiresIn: '1h' }     // Token berlaku selama 1 jam
        );

        // Update last_login
        const updateQuery = 'UPDATE users SET last_login = NOW() WHERE id = ?';
        db.query(updateQuery, [user.id]);

        resolve({ message: 'Login successful', user, token });
      });
    });
  });
};

// Fungsi untuk mengirimkan email reset password
const sendResetEmail = (email) => {
  return new Promise((resolve, reject) => {
    const token = crypto.randomBytes(20).toString('hex');
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1); // Token berlaku 1 jam

    // Update database dengan token reset
    const query = 'UPDATE users SET reset_token = ?, reset_token_expiration = ? WHERE email = ?';
    db.query(query, [token, expiration, email], (err, result) => {
      if (err) reject(err);

      // Kirimkan email reset
      const resetLink = `http://localhost:3000/reset-password/${token}`;

      sendEmail(email, 'Password Reset Request', `Please click the following link to reset your password: ${resetLink}`)
        .then((info) => {
          resolve(info);
        })
        .catch((error) => {
          reject(error);
        });
    });
  });
};

// Fungsi untuk mereset password
const resetPassword = (token, newPassword) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiration > NOW()';
    db.query(query, [token], (err, results) => {
      if (err) reject(err);
      if (results.length === 0) {
        reject(new Error('Invalid or expired token'));
      }

      const user = results[0];
      bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) reject(err);

        // Update password dan reset token
        const updateQuery = 'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiration = NULL WHERE id = ?';
        db.query(updateQuery, [hashedPassword, user.id], (err, result) => {
          if (err) reject(err);
          resolve('Password has been successfully updated');
        });
      });
    });
  });
};

module.exports = { registerUser, loginUser, sendResetEmail, resetPassword };
