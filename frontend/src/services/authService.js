import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const login = async (username, password) => {
  const res = await axios.post(`${API_BASE_URL}/auth/login`, {
    username,
    password,
  });
  return res.data;
};
