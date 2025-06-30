import { useState } from "react";
import { login } from "../../../frontend/src/services/authService";
import logo from "../assets/logo.png";
import nailong from "../assets/nailong.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login(username, password);
      localStorage.setItem("token", res.token);
      localStorage.setItem("userId", res.userId);
      localStorage.setItem("username", res.username);
      setMsg("✅ Login berhasil!");
      window.location.href = "/home";
    } catch (err) {
      console.error(err);
      setMsg("❌ Login gagal");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl px-8 py-10 relative">
        {/* Logo di atas */}
        <div className="absolute -top-14 left-1/2 transform -translate-x-1/2">
          <img src={logo} alt="Logo" className="w-20 h-20 rounded-full shadow-md border-4 border-white" />
        </div>

        {/* Isi Card */}
        <div className="mt-10 text-center">
          <img
            src={nailong}
            alt="Maskot"
            className="mx-auto w-16 h-16 mb-4 rounded-full animate-bounce"
          />
          <h2 className="text-xl font-bold text-primary mb-1">Selamat Datang</h2>
          <p className="text-sm text-gray-500 mb-4">Masuk ke akunmu</p>

          {msg && (
            <div className={`mb-4 text-sm font-semibold ${msg.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
              {msg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <input
              type="text"
              placeholder="👤 Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="password"
              placeholder="🔒 Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="w-full py-2 bg-primary hover:bg-blue-700 text-white font-semibold rounded-xl transition duration-300"
            >
              🚀 Login Sekarang
            </button>
          </form>

          <p className="mt-4 text-sm">
            Belum punya akun?{" "}
            <a href="/register" className="text-accent font-bold hover:underline">
              Daftar Sekarang
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
