// routes/notification.js
import express from 'express';
import db from '../db.js';

const router = express.Router();

// Ambil notifikasi yang belum dibaca
router.get('/unread/:userId', (req, res) => {
  const { userId } = req.params;

  db.query(`
    SELECT * FROM notifications
    WHERE user_id = ? AND is_read = 0
    ORDER BY created_at DESC
  `, [userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Gagal ambil notifikasi belum dibaca' });
    res.json(result);
  });
});

// Ambil semua notifikasi user
router.get('/:userId', (req, res) => {
  const { userId } = req.params;

  db.query(`
    SELECT * FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
  `, [userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Gagal ambil notifikasi' });
    res.json(result);
  });
});

// Tandai sebagai sudah dibaca
router.post('/read', (req, res) => {
  const { notificationId } = req.body;
  db.query(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [notificationId], (err) => {
    if (err) return res.status(500).json({ message: 'Gagal update notifikasi' });
    res.json({ message: '✅ Diberi status dibaca' });
  });
});

export default router;
