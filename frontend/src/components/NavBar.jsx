import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";

const Navbar = () => {
  const { pathname } = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ Ambil notifikasi belum dibaca
  const fetchUnread = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId"); // disamakan dengan Assistant.jsx
      if (!userId) return;
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const res = await axios.get(`${API_BASE_URL}/notification/unread/${userId}`);
      const newCount = res.data.count || 0;

      setUnreadCount((prevCount) => (prevCount !== newCount ? newCount : prevCount));
    } catch (err) {
      console.error("Gagal ambil notifikasi:", err);
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [fetchUnread]);

  // ✅ Logout: bersihkan semua data
  const handleLogout = useCallback(() => {
    // Optional: konfirmasi sebelum logout
    // if (!window.confirm("Yakin ingin keluar?")) return;

    // 🔥 Hapus semua obrolan Nailong
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("assistant_chat_")) {
        localStorage.removeItem(key);
      }
    });

    // 🧼 Hapus semua data login
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("token");

    // 🔄 Redirect ke login
    window.location.href = "/";
  }, []);

  // ✅ Item navigasi
  const navItems = useMemo(() => [
    { path: "/home", label: "🏠", name: "Home" },
    { path: "/kirim", label: "📤", name: "Kirim" },
    { path: "/use", label: "📥", name: "Gunakan" },
    { path: "/history", label: "📚", name: "Riwayat" },
    {
      path: "/notifications",
      label: "🔔",
      name: unreadCount > 0 ? `Notifikasi (${unreadCount})` : "Notifikasi",
    },
    { path: "/profil", label: "👤", name: "Profil" },
  ], [unreadCount]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-300 z-50 shadow-md">
      <div className="flex justify-around items-center text-xs sm:text-sm text-gray-700 py-2 px-3 bg-purple-200">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-md transition duration-200 ${
              pathname === item.path
                ? "text-blue-600 font-semibold"
                : "hover:text-blue-500"
            }`}
          >
            <span className="text-lg">{item.label}</span>
            <span className="text-[11px] sm:text-xs">{item.name}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center text-red-500 hover:text-red-600 text-sm px-2 py-1"
        >
          <span className="text-lg">🚪</span>
          <span className="text-[11px] sm:text-xs">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
