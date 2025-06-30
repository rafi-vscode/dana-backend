import express from "express";
import db from '../db.js';
const router = express.Router();

// Ambil semua transaksi yang melibatkan user (sebagai pengirim atau penerima)
router.get('/:userId', (req, res) => {
  const { userId } = req.params;

  db.query(`
    SELECT 
      t.*, 
      COALESCE(u1.username, 'Tidak diketahui') AS from_username, 
      COALESCE(u2.username, 'Tidak diketahui') AS to_username
    FROM transactions t
    LEFT JOIN users u1 ON t.from_user_id = u1.id
    LEFT JOIN users u2 ON t.to_user_id = u2.id
    WHERE t.from_user_id = ? OR t.to_user_id = ?
    ORDER BY t.created_at DESC
  `, [userId, userId], (err, result) => {
    if (err) {
      console.error("❌ Gagal ambil riwayat transaksi:", err);
      return res.status(500).json({ message: 'Gagal mengambil riwayat transaksi' });
    }
    res.json(result);
  });
});

export default router;
