import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import authRoutes from "./routes/auth.js";
import balanceRoutes from "./routes/balance.js";
import transactionRoutes from "./routes/transaction.js";
import historyRoutes from "./routes/history.js";
import notificationRoutes from "./routes/notification.js";
import assistantRoutes from "./routes/assistantRoutes.js";
import profileRoutes from "./routes/profile.js";
import newsRoutes from './routes/news.js';

dotenv.config();

import fs from "fs";

// Buat folder public/uploads/avatars jika belum ada
const avatarPath = path.join("public", "uploads", "avatars");
if (!fs.existsSync(avatarPath)) {
  fs.mkdirSync(avatarPath, { recursive: true });
  console.log("📁 Folder 'public/uploads/avatars' berhasil dibuat.");
}


const app = express();

// Middleware umum
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static("public/uploads"));



// Routes utama
app.use("/api/auth", authRoutes);
app.use("/api/balance", balanceRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/assistant", assistantRoutes); 
app.use("/api/profile", profileRoutes);
app.use('/api/news', newsRoutes);

// ✅ Tambahkan ini agar Railway tahu server masih hidup
app.get("/", (req, res) => {
  res.send("🚀 Server is up and running!");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
