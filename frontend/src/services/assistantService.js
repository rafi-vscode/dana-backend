import axios from "axios";

export const chatWithNailong = async (userId, message) => {
  try {
    
    const res = await axios.post("http://localhost:3000/api/assistant/chat", {
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
