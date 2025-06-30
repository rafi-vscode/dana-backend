// routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();

// =========================
// 🔐 REGISTER
// =========================
router.post("/register", async (req, res) => {
  try {
    let { username, password } = req.body;

    // Trim whitespace
    username = username.trim();
    password = password.trim();

    if (!username || !password) {
      return res.status(400).json({ message: "Username dan password wajib diisi" });
    }

    // Tidak perlu cek apakah username sudah ada, karena boleh sama
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan ke database
    db.query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Gagal daftar" });
        }

        return res.status(201).json({ message: "✅ Registrasi berhasil", user_id: result.insertId });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// =========================
// 🔓 LOGIN
// =========================
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  const query = 'SELECT id, password FROM users WHERE username = ?';
  db.query(query, [username], async (err, result) => {
    if (err || result.length === 0) {
      return res.status(401).json({ message: 'Username tidak ditemukan' });
    }

    const match = await bcrypt.compare(password, result[0].password);
    if (!match) return res.status(401).json({ message: 'Password salah' });

    const token = jwt.sign(
      { userId: result[0].id, username },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token, userId: result[0].id, username });
  });
});

export default router;
