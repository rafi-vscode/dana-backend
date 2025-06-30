import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// ⬇️ Tambahkan di sini
import assistantRoutes from "./routes/assistantRoutes.js";
app.use("/api/assistant", assistantRoutes);

// Handler jika route tidak ditemukan
app.use((req, res) => {
  res.status(404).json({ error: "Route not found", path: req.originalUrl });
});

export default app;
