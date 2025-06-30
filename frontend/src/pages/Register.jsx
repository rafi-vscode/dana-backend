import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import nailong from "../assets/nailong.png"; // pastikan path-nya benar

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const username = form.username.trim();
    const password = form.password.trim();

    if (!username || !password) {
      setMsg("❌ Username dan password wajib diisi");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, { username, password });

      alert("✅ Registrasi berhasil! Silakan login.");
      navigate("/");
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Gagal registrasi");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-yellow-100 px-4">
      <div className="bg-white w-full max-w-sm p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <img
            src={nailong}
            alt="Nailong"
            className="w-20 h-20 rounded-full border-4 border-yellow-200 shadow-md mb-2 animate-pulse"
          />
          <h1 className="text-xl font-bold text-blue-700">Buat Akun Baru</h1>
          <p className="text-sm text-gray-500">Gabung ke aplikasi <strong>E-KORUPT</strong></p>
        </div>

        {msg && (
          <p
            className={`text-sm font-semibold text-center mb-4 ${
              msg.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {msg}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            placeholder="👤 Username"
            value={form.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="🔒 Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-semibold transition"
          >
            ✨ Daftar Sekarang
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Sudah punya akun?{" "}
          <a
            href="/"
            className="text-yellow-600 font-semibold hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
