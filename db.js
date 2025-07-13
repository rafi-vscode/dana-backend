// db.js
import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

// Gunakan connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Coba satu query untuk memastikan koneksi berhasil
pool.query("SELECT 1", (err, results) => {
  if (err) {
    console.error("❌ Koneksi ke MySQL gagal:");
    console.error(`🛠 Host: ${process.env.DB_HOST}`);
    console.error(`🛠 Port: ${process.env.DB_PORT}`);
    console.error(`🛠 DB: ${process.env.DB_NAME}`);
    console.error(err.message);
  } else {
    console.log("✅ MySQL Pool Connected!");
  }
});

export default pool;
