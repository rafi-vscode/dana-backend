import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { Html5Qrcode } from "html5-qrcode";
import { QrCode, Wallet, CreditCard, DollarSign, Tag, MessageSquare, Camera, XCircle } from "lucide-react";
import nailongImg from "../assets/nailong.gif"; // Pastikan Anda punya gambar nailong.gif

const InputField = ({ icon: Icon, placeholder, value, onChange, type = "text" }) => (
  <div className="mb-4">
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        {Icon && <Icon size={20} className="text-gray-400" />}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
        autoComplete="off"
      />
    </div>
  </div>
);

const Use = () => {
  const [balances, setBalances] = useState([]);
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [labelInput, setLabelInput] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [popupMsg, setPopupMsg] = useState("");
  const [popupVisible, setPopupVisible] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = useRef(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchLabeledBalances = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/balance/${userId}`);

        setBalances(Array.isArray(res.data) ? res.data : []);
      } catch {
        setBalances([]);
      }
    };
    if (userId) fetchLabeledBalances();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBalance || !labelInput || !amount || isNaN(amount)) {
      setPopupMsg("❌ Semua data wajib diisi dan jumlah harus angka");
      setPopupVisible(true);
      return;
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/transaction/use`, {
        user_id: userId,
        from_user_id: selectedBalance.from_user_id,
        label_use: selectedBalance.label,
        label_input: labelInput,
        amount,
        note,
      });
      setPopupMsg("✅ " + (res.data.message || "Dana berhasil digunakan"));
      setPopupVisible(true);

      // Reset semua field
      setSelectedBalance(null);
      setLabelInput("");
      setAmount("");
      setNote("");
    } catch (err) {
      setPopupMsg("❌ " + (err.response?.data?.message || "Terjadi kesalahan"));
      setPopupVisible(true);
    }
  };

  const handleQRScan = useCallback(async () => {
    const qrRegionId = "qr-reader";
    try {
      const scanner = new Html5Qrcode(qrRegionId);
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          try {
            const data = JSON.parse(decodedText);
            if (data.label) {
              await scanner.stop();
              await scanner.clear();
              document.getElementById(qrRegionId).innerHTML = "";
              scannerRef.current = null;
              setLabelInput(data.label);
              setScannerActive(false);
            } else alert("QR tidak valid");
          } catch {
            alert("QR tidak valid");
          }
        },
        () => {}
      );
      scannerRef.current = scanner;
    } catch (err) {
      console.error("QR gagal jalan", err);
      alert("Gagal memulai QR scanner");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().then(() => {
          const elem = document.getElementById("qr-reader");
          if (elem) elem.innerHTML = "";
          scannerRef.current = null;
        }).catch(console.error);
      }
    };
  }, []);

  const formatCurrency = (amt) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", minimumFractionDigits: 0,
    }).format(amt);

  return (
    <div className="min-h-screen pb-28 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Popup */}
      {popupVisible && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-3xl shadow-xl p-6 w-11/12 max-w-md text-center">
            <img src={nailongImg} alt="Nailong" className="w-24 h-24 mx-auto mb-4 animate-bounce" />
            <p className="text-lg font-semibold mb-6">{popupMsg}</p>
            <button
              onClick={() => setPopupVisible(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-md transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-b-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Wallet size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Gunakan Dana</h1>
            <p className="text-blue-100">Kelola penggunaan dana berlabel</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">

        {/* QR */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <QrCode size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Scan QR Label</h3>
              <p className="text-gray-500 text-sm">Scan untuk mengisi label penggunaan</p>
            </div>
          </div>

          {!scannerActive ? (
            <button
              onClick={() => { setScannerActive(true); handleQRScan(); }}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-medium shadow-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105"
            >
              <Camera size={20} className="inline-block mr-2" /> Scan QR Label
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
              className="w-full bg-red-100 text-red-600 py-3 rounded-xl font-medium hover:bg-red-200"
            >
              <XCircle size={20} className="inline-block mr-2" /> Tutup Scanner
            </button>
          )}
        </div>

        {scannerActive && (
          <div id="qr-reader" className="mb-6 rounded-2xl overflow-hidden" />
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <CreditCard size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Detail Penggunaan</h3>
              <p className="text-gray-500 text-sm">Pilih dana dan isi detail penggunaan</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Wallet size={20} className="text-gray-400" />
                </div>
                <select
                  value={selectedBalance ? JSON.stringify(selectedBalance) : ""}
                  onChange={(e) => {
                    try {
                      setSelectedBalance(JSON.parse(e.target.value));
                    } catch {
                      setSelectedBalance(null);
                    }
                  }}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option disabled value="">
                    {balances.length === 0 ? "❌ Tidak ada dana diterima" : "Pilih Dana (Label + ID Pengirim)"}
                  </option>
                  {balances.map((b, i) => (
                    <option key={i} value={JSON.stringify(b)}>
                      {b.label} dari {b.from_username || `ID ${b.from_user_id}`} - {formatCurrency(b.amount)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <InputField icon={Tag} placeholder="Label penggunaan" value={labelInput} onChange={(e) => setLabelInput(e.target.value)} />
            <InputField icon={DollarSign} type="number" placeholder="Jumlah yang digunakan" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <InputField icon={MessageSquare} placeholder="Catatan (opsional)" value={note} onChange={(e) => setNote(e.target.value)} />

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg transform hover:scale-105"
            >
              <Wallet size={24} />
              Gunakan Dana
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Use;
