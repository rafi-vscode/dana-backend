import axios from "axios";

export const getTransactionHistory = async (userId) => {
  const res = await axios.get(`http://localhost:3000/api/history/${userId}`);
  return res.data;
};
