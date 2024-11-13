// src/config/db.js
const mysql = require('mysql2');

// Koneksi ke MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // Ganti dengan username MySQL Anda
  password: '',  // Ganti dengan password MySQL Anda
  database: 'pansastore'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  } else {
    console.log('Connected to MySQL database.');
  }
});

module.exports = db;
