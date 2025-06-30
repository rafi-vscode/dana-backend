import axios from "axios";
import { saveChat } from "../models/Chat.js";
import dotenv from "dotenv";
dotenv.config();

export const chatWithAssistant = async (req, res) => {
  const { user_id, username, message } = req.body;

  try {
    // 🔒 Cek apakah API key tersedia
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ message: "API key belum dikonfigurasi." });
    }

    // 🔁 Kirim permintaan ke OpenRouter (GPT)
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek/deepseek-chat-v3-0324:free", // Gratis
        messages: [
          {
            role: "system",
            content: `
              Kamu adalah Nailong 🐲, asisten virtual yang ramah, lucu, akrab dan bersahabat.
              Pengguna ini bernama "${username}". Sapa pengguna dengan namanya di setiap balasan.

              Kamu bekerja di aplikasi E-KORUPT, aplikasi pengelola dana berlabel antara orang tua dan anak. atau mungkin bisa lebih luas lagi bukan hanya orangtua dan anak saja, tetapi semua kalangan.
              Jawabanmu harus ringan, sopan, manusiawi, penuh semangat dan ramah. Hindari nada robotik.

              Contoh gaya balasan:
              "Hai ${username}! Ada yang bisa Nailong bantu hari ini? 😊"
            `.trim(),
          },
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000", // Ubah jika sudah dihosting
          "X-Title": "Nailong Assistant",
        },
      }
    );

    const reply = response.data.choices[0].message.content;

    // 💾 Simpan chat ke database
    await saveChat(user_id, message, reply);

    // 🔁 Kirim balasan ke frontend
    res.json({ reply });
  } catch (error) {
    console.error("❌ Gagal:", error.response?.data || error.message);
    res.status(500).json({ message: "Gagal menghubungi GPT API" });
  }
};
