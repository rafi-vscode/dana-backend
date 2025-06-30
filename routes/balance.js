// routes/balance.js
import express from "express";
import db from "../db.js";
const router = express.Router();

// Ambil saldo dana yang diterima user, termasuk nama pengirim
router.get('/:userId', (req, res) => {
  const { userId } = req.params;

  const query = `
    SELECT 
      t.from_user_id,
      u.username AS from_username,
      t.label,
      SUM(t.amount) AS amount
    FROM transactions t
    LEFT JOIN users u ON t.from_user_id = u.id
    WHERE t.to_user_id = ? AND t.type = 'pengiriman' AND t.status = 'sukses'
    GROUP BY t.from_user_id, u.username, t.label
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error("❌ Error ambil balance:", err);
      return res.status(500).json({ message: 'Gagal ambil saldo dana' });
    }
    res.json(result);
  });
});

export default router;
