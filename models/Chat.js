import db from '../database.js';

export const saveChat = (user_id, message, response) => {
  return new Promise((resolve, reject) => {
    db.query(
      'INSERT INTO chat_history (user_id, message, response) VALUES (?, ?, ?)',
      [user_id, message, response],
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
};
