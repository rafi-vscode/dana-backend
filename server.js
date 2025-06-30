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

// Health check endpoint untuk Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Root endpoint untuk Railway
app.get("/", (req, res) => {
  res.json({
    message: "🚀 Dana Backend API is running!",
    status: "active",
    timestamp: new Date().toISOString(),
    endpoints: [
      "/api/auth",
      "/api/balance", 
      "/api/transaction",
      "/api/history",
      "/api/notifications",
      "/api/assistant",
      "/api/profile",
      "/api/news",
      "/health"
    ]
  });
});

// Routes utama
app.use("/api/auth", authRoutes);
app.use("/api/balance", balanceRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/assistant", assistantRoutes); 
app.use("/api/profile", profileRoutes);
app.use('/api/news', newsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

// Start server dengan binding ke 0.0.0.0 untuk Railway
const PORT = process.env.PORT || 8080; // Gunakan 8080 default seperti di log
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`🔗 Health check available at: http://localhost:${PORT}/health`);
  
  // Immediate self-ping untuk memastikan server ready
  setTimeout(() => {
    console.log('🔄 Mengirim self-ping untuk memastikan server ready...');
    // Tidak perlu HTTP call, cukup log bahwa server siap
    console.log('✅ Server siap menerima request');
  }, 1000);
  
  // Keep-alive mechanism untuk Railway
  setInterval(() => {
    console.log(`💓 Server heartbeat - ${new Date().toISOString()}`);
    console.log(`📊 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
  }, 10000); // Setiap 10 detik
});

// Graceful shutdown untuk Railway
process.on('SIGTERM', () => {
  console.log('🛑 Menerima SIGTERM dari Railway, shutdown gracefully...');
  console.log(`⏰ Uptime sebelum shutdown: ${process.uptime()} seconds`);
  console.log(`💾 Memory usage: ${JSON.stringify(process.memoryUsage())}`);
  server.close(() => {
    console.log('✅ Server ditutup dengan baik');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Menerima SIGINT, shutdown gracefully...');
  console.log(`⏰ Uptime sebelum shutdown: ${process.uptime()} seconds`);
  server.close(() => {
    console.log('✅ Server ditutup dengan baik');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});