// routes/profileRoutes.js
import express from 'express';
import { updateAvatar, deleteAvatar, getAvatar } from '../controllers/profileController.js';
import upload from '../middleware/uploadAvatar.js';

const router = express.Router();

export const getAvatar = (req, res) => {
  const { user_id } = req.params;
  const avatarDir = path.join("public/uploads/avatars");
  const extensions = ['.jpg', '.jpeg', '.png'];

  for (const ext of extensions) {
    const avatarPath = path.join(avatarDir, `${user_id}${ext}`);
    if (fs.existsSync(avatarPath)) {
      return res.sendFile(path.resolve(avatarPath));
    }
  }

  return res.status(404).json({ message: "Avatar tidak ditemukan" });
};

// Middleware logging
router.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.originalUrl}`);
  next();
});

router.post('/upload/:user_id', upload.single('avatar'), updateAvatar);
router.delete('/avatar/:user_id', deleteAvatar);
router.get('/avatar/:user_id', getAvatar);

export default router;
