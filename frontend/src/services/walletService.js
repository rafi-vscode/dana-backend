import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

export const fetchBalance = (token) => {
  return axios.get(`${API}/balance`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const sendMoney = (payload) => {
  return axios.post(`${API}/transaction/send`, payload);
};

export const useMoney = (payload) => {
  return axios.post(`${API}/transaction/use`, payload);
};
