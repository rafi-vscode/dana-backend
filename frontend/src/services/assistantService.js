import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const chatWithNailong = async (userId, message) => {
  try {
    const res = await axios.post(`${API_BASE_URL}/assistant/chat`, {
      user_id: userId,
      username: localStorage.getItem("username"),
      message: message,
    });
    return res.data;
  } catch (err) {
    console.error("Gagal kirim ke backend:", err.message);
    return { reply: "Aku sedang tidak bisa menjawab, coba lagi nanti ya!" };
  }
};
