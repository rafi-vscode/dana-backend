import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import axios from "axios";

const Profile = () => {
  const id = localStorage.getItem("userId");
  const username = localStorage.getItem("username");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const fileInputRef = useRef(null);

  const qrData = JSON.stringify({ id, username });

  useEffect(() => {
  if (id) {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/profile/avatar/${id}`)

      .then((res) => {
        const base = import.meta.env.VITE_API_BASE_URL.replace("/api", "");
        setAvatarUrl(`${base}${res.data.avatar}?${Date.now()}`);
      })
      .catch(() => {
        setAvatarUrl(""); // fallback jika avatar tidak ada
      });
  }
}, [id]);


  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !id) return;

    const ext = file.name.split(".").pop();
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/profile/upload/${id}`, formData);
      const base = import.meta.env.VITE_API_BASE_URL.replace("/api", "");
      setAvatarUrl(`${base}/uploads/avatars/${id}.${ext}?${Date.now()}`);
      setStatusMsg("✅ Foto profil berhasil diperbarui.");
    } catch (err) {
      console.error("❌ Upload gagal:", err);
      setStatusMsg("❌ Gagal upload foto.");
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      const confirmed = window.confirm("Yakin ingin menghapus foto profil?");
      if (!confirmed) return;

      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/profile/avatar/${id}`);
      setAvatarUrl("");
      setStatusMsg("✅ Foto profil berhasil dihapus.");
    } catch (err) {
      console.error(err);
      setStatusMsg("❌ Gagal menghapus foto profil.");
    }
  };

  const renderAvatar = () => {
    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt="Avatar"
          onError={() => setAvatarUrl("")}
          className="object-cover w-full h-full"
        />
      );
    }
    return (
      <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
        {username?.charAt(0).toUpperCase() || "?"}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24 p-6">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-6">
        <h2 className="text-xl font-bold text-center mb-6 text-blue-700">👤 Profil Pengguna</h2>

        {/* Status Message */}
        {statusMsg && (
          <div className="mb-4 px-4 py-2 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm text-center">
            {statusMsg}
          </div>
        )}

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-28 h-28 rounded-full border-4 border-blue-200 shadow-md overflow-hidden mb-3">
            {renderAvatar()}
          </div>

          <button
            className="text-sm text-blue-600 hover:underline mb-1"
            onClick={() => fileInputRef.current.click()}
          >
            📷 Upload Foto Profil
          </button>

          {avatarUrl && (
            <button
              className="text-sm text-red-500 hover:underline"
              onClick={handleDeleteAvatar}
            >
              🗑️ Hapus Foto Profil
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </div>

        {/* Informasi Akun */}
        <div className="space-y-4 mb-6">
          <div className="bg-blue-100 p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-700 mb-1">🆔 ID Pengguna</p>
            <div className="text-lg font-semibold text-blue-800 text-center">{id || "Belum tersedia"}</div>
          </div>

          <div className="bg-yellow-100 p-4 rounded-xl shadow-sm">
            <p className="text-sm text-gray-700 mb-1">👤 Nama Pengguna</p>
            <div className="text-lg font-semibold text-purple-800 text-center">{username || "Belum tersedia"}</div>
          </div>
        </div>

        {/* QR Code Tengah */}
        <div className="flex flex-col items-center justify-center bg-gray-70 p-4 rounded-xl shadow-sm">
          <QRCode value={qrData} size={160} />
          <p className="text-sm text-gray-600 mt-2">📷 Kode QR Akun</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
