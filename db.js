// db.js
import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

conn.connect((err) => {
  if (err) {
    console.error("❌ Koneksi DB gagal:", err.message);
  } else {
    console.log("✅ MySQL Connected!");
  }
});

export default conn;
