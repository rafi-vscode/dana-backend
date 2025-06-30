import express from 'express';
import db from '../db.js';
const router = express.Router();

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

// Notifikasi untuk user tertentu
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

// Optional: tandai notifikasi sudah dibaca
router.post('/read', (req, res) => {
  const { notificationId } = req.body;
  db.query(`UPDATE notifications SET is_read = 1 WHERE id = ?`, [notificationId]);
  res.json({ message: '✅ Diberi status dibaca' });
});


export default router;
