import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getTransactionHistory = async (userId) => {
  const res = await axios.get(`${API_BASE_URL}/history/${userId}`);
  return res.data;
};
