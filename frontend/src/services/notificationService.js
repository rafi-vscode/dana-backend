import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Ambil semua notifikasi user
export const getUserNotifications = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/notifications/${userId}`);
    return res.data; // Harus array
  } catch (err) {
    console.error("❌ Gagal mengambil semua notifikasi:", err);
    return []; // fallback kosong
  }
};

// Ambil notifikasi yang belum dibaca
export const getUnreadNotifications = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE_URL}/notifications/unread/${userId}`);
    return res.data;
  } catch (err) {
    console.error("❌ Gagal mengambil notifikasi belum dibaca:", err);
    return []; // fallback kosong
  }
};

// Tandai notifikasi sebagai sudah dibaca
export const markNotificationRead = async (notificationId) => {
  try {
    await axios.post(`${API_BASE_URL}/notifications/read`, {
      notificationId,
    });
  } catch (err) {
    console.error("❌ Gagal tandai notifikasi dibaca:", err);
  }
};
