// routes/profileRoutes.js
import express from 'express';
import { updateAvatar, deleteAvatar, getAvatar } from '../controllers/profileController.js';
import upload from '../middleware/uploadAvatar.js';

const router = express.Router();

// Middleware logging
router.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.originalUrl}`);
  next();
});

router.post('/upload/:user_id', upload.single('avatar'), updateAvatar);
router.delete('/avatar/:user_id', deleteAvatar);
router.get('/avatar/:user_id', getAvatar);

export default router;
