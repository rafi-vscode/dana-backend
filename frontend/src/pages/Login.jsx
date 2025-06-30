import { useState } from "react";
import { login } from "../services/authService";
import nailong from "../assets/nailong.png"; // pastikan file ini ada

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await login(username, password);
      localStorage.setItem("token", res.token);
      localStorage.setItem("userId", res.userId);
      localStorage.setItem("username", res.username);
      setMsg("✅ Login berhasil!");
      window.location.href = "/home";
    } catch {
      setMsg("❌ Login gagal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex flex-col justify-center py-12 px-6 sm:px-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-24 h-24 mb-4 rounded-full overflow-hidden border-4 border-blue-300 shadow-md animate-bounce">
            <img src={nailong} alt="Nailong" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Selamat Datang di <span className="text-primary">E-KORUPT</span></h1>
        <p className="text-sm text-gray-500 mt-1">Silakan login untuk melanjutkan</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md rounded-xl">
          {msg && (
            <div
              className={`mb-4 p-3 rounded-md text-sm font-medium ${
                msg.startsWith("✅")
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {msg}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center px-4 py-2 bg-primary text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60"
            >
              {isLoading ? "Masuk..." : "Masuk ke Aplikasi"}
            </button>
          </form>

          <p className="mt-6 text-sm text-center">
            Belum punya akun?{" "}
            <a href="/register" className="text-blue-600 font-semibold hover:underline">
              Daftar di sini
            </a>
          </p>
        </div>

        <div className="mt-6 text-xs text-gray-500 text-center space-x-4">
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Contact</a>
        </div>
      </div>
    </div>
  );
}
