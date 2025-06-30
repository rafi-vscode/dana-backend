// setup-db.js
import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
});

const sql = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255),
  password VARCHAR(255)
);
`;

conn.connect((err) => {
  if (err) {
    console.error("❌ Setup DB gagal:", err.message);
  } else {
    console.log("✅ Koneksi ke DB berhasil!");
    conn.query(sql, (err) => {
      if (err) console.error("❌ Gagal buat table:", err.message);
      else console.log("✅ Table berhasil dibuat atau sudah ada.");
      conn.end();
    });
  }
});
