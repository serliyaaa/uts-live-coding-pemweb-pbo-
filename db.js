const mysql = require('mysql');

// Konfigurasi koneksi
const connection = mysql.createConnection({
  host: 'localhost',                // Ganti dengan host database yang benar
  user: 'root',          // Ganti dengan nama user database yang benar
  password: '',        // Ganti dengan password database yang benar
  database: 'file_management'         // Ganti dengan nama database yang benar
});

// Fungsi untuk menghubungkan ke database
function connectDB() {
  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
    } else {
      console.log('Database connected');
    }
  });
}

// Ekspor connectDB dan connection
module.exports = { connectDB, connection };
