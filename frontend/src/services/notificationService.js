import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getUserNotifications = async (userId) => {
  const res = await axios.get(`${API_BASE_URL}/notifications/${userId}`);
  return res.data; // ini harus langsung array
};

export const markNotificationRead = async (notificationId) => {
  await axios.post(`${API_BASE_URL}/notifications/read`, {
    notificationId,
  });
};
