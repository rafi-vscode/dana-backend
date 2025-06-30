import axios from "axios";

export const getUserNotifications = async (userId) => {
  const res = await axios.get(`http://localhost:3000/api/notifications/${userId}`);
  return res.data; // ini harus langsung array
};

export const markNotificationRead = async (notificationId) => {
  await axios.post(`http://localhost:3000/api/notifications/read`, {
    notificationId,
  });
};
