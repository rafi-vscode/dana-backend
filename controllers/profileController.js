// controllers/profileController.js
import fs from "fs";
import path from "path";
import conn from "../db.js";

const __dirname = path.resolve();

export const updateAvatar = (req, res) => {
  const { user_id } = req.params;
  const file = req.file;

  if (!user_id || !file) {
    return res.status(400).json({ message: "user_id dan file wajib diisi." });
  }

  const avatarPath = `/uploads/avatars/${file.filename}`;

  conn.query(
    "UPDATE users SET avatar = ? WHERE id = ?",
    [avatarPath, user_id],
    (err) => {
      if (err) return res.status(500).json({ message: "Gagal update avatar" });
      res.json({ message: "Avatar diperbarui", avatar: avatarPath });
    }
  );
};

export const deleteAvatar = (req, res) => {
  const { user_id } = req.params;

  conn.query("SELECT avatar FROM users WHERE id = ?", [user_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const avatarPath = results[0].avatar;
    const fullPath = path.join(__dirname, "public", avatarPath);

    fs.unlink(fullPath, (fsErr) => {
      if (fsErr) console.warn("⚠️ Gagal hapus file lokal:", fsErr.message);
    });

    conn.query("UPDATE users SET avatar = NULL WHERE id = ?", [user_id], (err2) => {
      if (err2) return res.status(500).json({ message: "Gagal hapus avatar" });
      res.json({ message: "Avatar berhasil dihapus" });
    });
  });
};

export const getAvatar = (req, res) => {
  const { user_id } = req.params;

  conn.query("SELECT avatar FROM users WHERE id = ?", [user_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const avatar = results[0].avatar;

    if (!avatar) {
      return res.status(404).json({ message: "Avatar tidak ditemukan" });
    }

    res.json({ avatar });
  });
};