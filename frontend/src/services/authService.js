import axios from 'axios';

const API = 'http://localhost:3000/api/auth';

export const login = async (username, password) => {
  const res = await axios.post(`${API}/login`, { username, password });
  return res.data;
};
