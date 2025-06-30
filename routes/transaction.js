import express from 'express';
import db from '../db.js';
const router = express.Router();

// ==============================
// 1. Kirim Dana (boleh tanpa label)
// ==============================

router.post('/send', (req, res) => {
  console.log("📨 Incoming send request:", req.body);
  let { from_user_id, to_user_id, to_username, amount, label, note } = req.body;

  const nominal = parseFloat(amount);
  label = (label || '').trim();
  note = (note || '').trim();
  if (label === '') label = 'Tidak Ditetapkan';

  if (!from_user_id || !to_user_id || !to_username || !amount) {
    return res.status(400).json({ message: 'Semua field wajib diisi' });
  }

  if (nominal <= 0 || isNaN(nominal)) {
    return res.status(400).json({ message: 'Jumlah harus berupa angka dan > 0' });
  }

  // Validasi penerima
  db.query('SELECT username FROM users WHERE id = ?', [to_user_id], (err, toResult) => {
    if (err || toResult.length === 0) {
      return res.status(404).json({ message: 'ID penerima tidak ditemukan' });
    }

    const actualUsername = toResult[0].username;
    if (actualUsername !== to_username) {
      return res.status(400).json({ message: `ID dimiliki oleh ${actualUsername}, bukan ${to_username}` });
    }

    // Ambil nama asli pengirim & penerima
    db.query('SELECT username FROM users WHERE id IN (?, ?)', [from_user_id, to_user_id], (err, userRows) => {
      if (err || userRows.length < 2) {
        return res.status(500).json({ message: 'Gagal mengambil data pengguna' });
      }

      const fromUsername = userRows.find(u => u.username !== to_username).username;
      const toUsername = to_username;

      // Cek apakah saldo dengan label sudah ada
      const checkQuery = `
        SELECT amount FROM balances 
        WHERE from_user_id = ? AND user_id = ? AND label = ?
      `;
      db.query(checkQuery, [from_user_id, to_user_id, label], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Gagal cek saldo berlabel' });
        }

        const handleInsertTransaction = () => {
          db.query(`
  INSERT INTO transactions 
  (from_user_id, to_user_id, to_username, amount, label, note, type, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`, [
  from_user_id,
  to_user_id,
  to_username,
  nominal,
  label,
  note || '', // fallback jika kosong
  'pengiriman',
  'sukses'
], (err) => {
  if (err) {
    console.error(err);
    return res.status(500).json({ message: 'Gagal simpan transaksi' });
  }
            const labelDesc = label !== 'Tidak Ditetapkan' ? `untuk ${label}` : 'tanpa label tertentu';
            const noteDesc = note !== '' ? ` (Catatan: ${note})` : '';

            const notifTo = `📥 Anda menerima Rp${nominal} dari ${fromUsername} (ID ${from_user_id}) ${labelDesc}${noteDesc}`;
            db.query(`INSERT INTO notifications (user_id, message) VALUES (?, ?)`, [to_user_id, notifTo]);

            const notifFrom = `📤 Anda mengirim Rp${nominal} ke ${toUsername} (ID ${to_user_id}) ${labelDesc}${noteDesc}`;
            db.query(`INSERT INTO notifications (user_id, message) VALUES (?, ?)`, [from_user_id, notifFrom]);

            return res.json({ message: '✅ Kirim dana berhasil!' });
          });
        };

        if (result.length > 0) {
          const newAmount = parseFloat(result[0].amount) + nominal;
          db.query(`
            UPDATE balances SET amount = ? 
            WHERE from_user_id = ? AND user_id = ? AND label = ?
          `, [newAmount, from_user_id, to_user_id, label], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: 'Gagal update saldo' });
            }

            handleInsertTransaction();
          });

        } else {
          db.query(`
            INSERT INTO balances (from_user_id, user_id, label, amount)
            VALUES (?, ?, ?, ?)
          `, [from_user_id, to_user_id, label, nominal], (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: 'Gagal tambah saldo' });
            }

            handleInsertTransaction();
          });
        }
      });
    });
  });
});

// ==============================
// 2. Gunakan Dana (label opsional)
// ==============================
router.post('/use', express.json(), (req, res) => {
  console.log("🧾 Data penggunaan:", req.body);
  let { user_id, from_user_id, label_use, label_input, amount, note } = req.body;
  const nominal = parseFloat(amount);

  label_use = (label_use || '').trim();
  label_input = (label_input || '').trim();
  if (label_use === '') label_use = 'Tidak Ditetapkan';
  if (label_input === '') label_input = 'Tidak Ditetapkan';

  if (!user_id || !from_user_id || !amount || isNaN(nominal)) {
    return res.status(400).json({ message: '❌ Semua data wajib diisi dan jumlah harus angka' });
  }

  if (nominal <= 0) {
    return res.status(400).json({ message: '❌ Jumlah harus > 0' });
  }

  const checkQuery = `
    SELECT amount FROM balances
    WHERE from_user_id = ? AND user_id = ? AND label = ?
  `;

  db.query(checkQuery, [from_user_id, user_id, label_use], (err, result) => {
    if (err || result.length === 0) {
      return insertFailedTransaction('Label tidak ditemukan atau tidak ada saldo');
    }

    const saldo = parseFloat(result[0].amount);

    if (label_use !== label_input) {
      return insertFailedTransaction(`Label tidak sesuai (Label: ${label_use}, digunakan: ${label_input})`);
    }

    if (saldo < nominal) {
      return insertFailedTransaction('Saldo tidak cukup');
    }

    const newAmount = saldo - nominal;

    db.query(`
      UPDATE balances SET amount = ?
      WHERE from_user_id = ? AND user_id = ? AND label = ?
    `, [newAmount, from_user_id, user_id, label_use], (err) => {
      if (err) return res.status(500).json({ message: '❌ Gagal mengurangi saldo' });

      db.query(`
        INSERT INTO transactions 
        (from_user_id, to_user_id, amount, label, note, type, status)
        VALUES (?, ?, ?, ?, ?, 'penggunaan', 'sukses')
      `, [from_user_id, user_id, nominal, label_input, note], (err) => {
        if (err) return res.status(500).json({ message: '❌ Gagal simpan transaksi' });

        sendNotifications();
        return res.json({ message: '✅ Penggunaan dana berhasil!' });
      });
    });
  });

  function insertFailedTransaction(reason) {
    db.query(`
      INSERT INTO transactions 
      (from_user_id, to_user_id, amount, label, note, type, status, reason)
      VALUES (?, ?, ?, ?, ?, 'penggunaan', 'gagal', ?)
    `, [from_user_id, user_id, nominal, label_input, note, reason], () => {
      return res.status(400).json({ message: `❌ Transaksi gagal: ${reason}` });
    });
  }

  function sendNotifications() {
    db.query(`SELECT username FROM users WHERE id = ?`, [from_user_id], (err, result1) => {
      const fromName = result1?.[0]?.username || `User ${from_user_id}`;
      db.query(`SELECT username FROM users WHERE id = ?`, [user_id], (err2, result2) => {
        const userName = result2?.[0]?.username || `User ${user_id}`;
        db.query(`INSERT INTO notifications (user_id, message) VALUES (?, ?)`,
          [user_id, `✅ Anda menggunakan Rp${nominal} dari dana '${label_use}' milik ${fromName}`]);
        db.query(`INSERT INTO notifications (user_id, message) VALUES (?, ?)`,
          [from_user_id, `⚠️ Dana '${label_use}' Anda digunakan oleh ${userName} sebesar Rp${nominal}`]);
      });
    });
  }
});

// ==============================
// 3. History Tetap Sama
// ==============================
router.get('/history/:user_id', (req, res) => {
  const userId = req.params.user_id;

  const query = `
    SELECT t.*, u.username AS from_username, r.username AS to_username
    FROM transactions t
    LEFT JOIN users u ON t.from_user_id = u.id
    LEFT JOIN users r ON t.to_user_id = r.id
    WHERE t.from_user_id = ? OR t.to_user_id = ?
    ORDER BY t.created_at DESC
  `;

  db.query(query, [userId, userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Gagal ambil riwayat transaksi' });
    res.json(result);
  });
});

export default router;
