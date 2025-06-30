import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { Html5Qrcode } from "html5-qrcode";
import {
  QrCode, Send, User, DollarSign, Tag, MessageSquare,
  Camera, CheckCircle, AlertCircle, XCircle
} from "lucide-react";
import nailongImg from "../assets/nailong.gif"; // Gambar Nailong mental-mentul

const InputField = ({ icon: Icon, value, onChange, name, placeholder, type = "text", required = false }) => (
  <div className="mb-4">
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        {Icon && <Icon size={20} className="text-gray-400" />}
      </div>
      <input
        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete="off"
      />
    </div>
  </div>
);

const Kirim = () => {
  const [toUserId, setToUserId] = useState("");
  const [toUsername, setToUsername] = useState("");
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const scannerRef = useRef(null);

  const resetForm = () => {
    setToUserId("");
    setToUsername("");
    setAmount("");
    setLabel("");
    setNote("");
  };

  const handleSend = useCallback(async () => {
    const from_user_id = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!from_user_id) {
      setMsg("❌ User ID tidak ditemukan. Harap login ulang.");
      setSuccess(false);
      return;
    }

    const numericAmount = parseFloat(amount.toString().replace(/\./g, ""));
    if (!toUserId || !toUsername || !amount || !label || isNaN(numericAmount) || numericAmount <= 0) {
      setMsg("❌ Semua field wajib diisi dan jumlah harus angka positif");
      setSuccess(false);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/transaction/send`,
        {
          to_user_id: toUserId,
          to_username: toUsername,
          amount: numericAmount,
          label,
          note,
          from_user_id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setMsg(res.data.message);
      resetForm();
    } catch (err) {
      setSuccess(false);
      setMsg(err.response?.data?.message || "❌ Gagal kirim dana");
    } finally {
      setLoading(false);
    }
  }, [toUserId, toUsername, amount, label, note]);

  const handleQRScan = useCallback(async () => {
    const qrRegionId = "qr-reader";

    try {
      const scanner = new Html5Qrcode(qrRegionId);
      const config = { fps: 10, qrbox: 250 };

      await scanner.start(
        { facingMode: "environment" },
        config,
        async (decodedText) => {
          try {
            const data = JSON.parse(decodedText);
            if (data.id && data.username) {
              if (scannerRef.current) {
                await scanner.stop();
                await scanner.clear();
              }
              document.getElementById(qrRegionId).innerHTML = "";
              document.querySelector("video")?.remove();
              scannerRef.current = null;
              setToUserId(data.id.toString());
              setToUsername(data.username.trim());
              setMsg("✅ Data QR berhasil diisi");
              setSuccess(true);
              setScannerActive(false);
            } else {
              alert("QR tidak valid (data tidak lengkap)");
            }
          } catch {
            alert("QR tidak valid");
          }
        },
        () => {}
      );

      scannerRef.current = scanner;
    } catch (err) {
      console.error("Gagal inisialisasi QR scanner", err);
      alert("Gagal memulai QR scanner");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          document.getElementById("qr-reader").innerHTML = "";
          document.querySelector("video")?.remove();
          scannerRef.current = null;
        }).catch(console.error);
      }
    };
  }, []);

  return (
    <div className="min-h-screen pb-28 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-b-3xl shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Send size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Kirim Dana</h1>
            <p className="text-blue-100">Transfer uang dengan mudah</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* ✅ Popup Modal Notifikasi */}
        {msg && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative bg-white rounded-2xl p-6 w-[90%] max-w-md border shadow-xl text-center animate-fade-in">
              <img
                src={nailongImg}
                alt="Nailong"
                className="mx-auto w-24 h-24 mb-4 animate-bounce "
              />
              <div className="flex items-center justify-center gap-2 mb-4">
                {success ? <CheckCircle size={24} className="text-green-500" /> : <AlertCircle size={24} className="text-red-500" />}
                <h2 className="text-xl font-bold">{success ? "Berhasil!" : "Gagal!"}</h2>
              </div>
              <p className="text-gray-700 mb-6">{msg}</p>
              <button
                onClick={() => setMsg("")}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full transition"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* 📷 QR Scanner Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <QrCode size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Scan QR Code</h3>
              <p className="text-gray-500 text-sm">Scan untuk mengisi data penerima</p>
            </div>
          </div>

          {!scannerActive ? (
            <button
              onClick={() => {
                setScannerActive(true);
                handleQRScan();
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg transform hover:scale-105"
            >
              <Camera size={20} />
              Scan QR Code
            </button>
          ) : (
            <button
              onClick={() => {
                setScannerActive(false);
                if (scannerRef.current) {
                  scannerRef.current.stop().then(() => {
                    document.getElementById("qr-reader").innerHTML = "";
                  });
                }
              }}
              className="w-full bg-red-100 text-red-600 py-2 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:bg-red-200"
            >
              <XCircle size={18} />
              Tutup Scanner
            </button>
          )}
        </div>

        {scannerActive && (
          <div id="qr-reader" className="mb-6 rounded-2xl overflow-hidden" />
        )}

        {/* 📝 Form Transfer */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <User size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Detail Transfer</h3>
              <p className="text-gray-500 text-sm">Lengkapi informasi penerima</p>
            </div>
          </div>

          <div className="space-y-2">
            <InputField icon={User} name="to_user_id" placeholder="ID Penerima" required value={toUserId} onChange={(e) => setToUserId(e.target.value)} />
            <InputField icon={User} name="to_username" placeholder="Username Penerima" required value={toUsername} onChange={(e) => setToUsername(e.target.value)} />
            <InputField icon={DollarSign} name="amount" placeholder="Jumlah Dana" type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} />
            <InputField icon={Tag} name="label" placeholder="Label Transfer" required value={label} onChange={(e) => setLabel(e.target.value)} />
            <InputField icon={MessageSquare} name="note" placeholder="Catatan (Opsional)" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={loading}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg transform mb-6 ${
            loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:scale-105"
          }`}
        >
          <Send size={24} />
          {loading ? "Memproses..." : "Kirim Dana"}
        </button>
      </div>
    </div>
  );
};

export default Kirim;
