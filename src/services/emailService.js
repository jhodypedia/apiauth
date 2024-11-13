// src/services/emailService.js
const nodemailer = require('nodemailer');

// Membuat transporter untuk mengirim email melalui server lokal
const transporter = nodemailer.createTransport({
  host: 'localhost',  // Asumsi Postfix atau server lokal
  port: 25,           // Port standar untuk SMTP
  secure: false,      // Tidak menggunakan SSL/TLS untuk pengaturan lokal
  tls: {
    rejectUnauthorized: false  // Diperlukan untuk pengaturan SMTP lokal
  }
});

// Fungsi untuk mengirim email reset password
const sendResetEmail = (to, resetLink) => {
  const mailOptions = {
    from: 'no-reply@jhody.pw', // Email pengirim (sesuaikan dengan email server lokal Anda)
    to: to,                         // Email penerima
    subject: 'Password Reset Request', // Subjek email
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Request</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }
              .email-container {
                  width: 100%;
                  padding: 30px;
                  background-color: #ffffff;
                  margin: 0 auto;
                  max-width: 600px;
                  border-radius: 8px;
                  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
              }
              .email-header {
                  text-align: center;
                  padding: 20px;
                  background-color: #0066cc;
                  color: white;
                  border-radius: 8px 8px 0 0;
              }
              .email-header h1 {
                  margin: 0;
              }
              .email-content {
                  padding: 20px;
              }
              .email-content p {
                  font-size: 16px;
                  color: #333;
                  line-height: 1.5;
              }
              .reset-button {
                  background-color: #28a745;
                  color: white;
                  padding: 15px 25px;
                  font-size: 18px;
                  border: none;
                  border-radius: 5px;
                  text-decoration: none;
                  display: inline-block;
                  margin-top: 20px;
              }
              .email-footer {
                  font-size: 12px;
                  color: #999;
                  text-align: center;
                  padding-top: 30px;
                  border-top: 1px solid #e0e0e0;
              }
              .email-footer a {
                  color: #0066cc;
                  text-decoration: none;
              }
          </style>
      </head>
      <body>
          <div class="email-container">
              <div class="email-header">
                  <h1>Password Reset Request</h1>
              </div>
              <div class="email-content">
                  <p>Hello,</p>
                  <p>We received a request to reset your password for your account. If you did not request a password reset, please ignore this email.</p>
                  <p>To reset your password, please click the button below:</p>
                  <a href="${resetLink}" class="reset-button">Reset My Password</a>
                  <p>If you have any questions, feel free to contact our support team.</p>
                  <p>Thanks,<br>The Team at YourApp</p>
              </div>
              <div class="email-footer">
                  <p>If you did not request a password reset, you can safely disregard this email.</p>
                  <p>For any questions or assistance, please visit our <a href="https://yourapp.com/support">Support Center</a>.</p>
              </div>
          </div>
      </body>
      </html>
    `
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });
};

module.exports = sendResetEmail ;
