import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FileDown, ArrowUpRight, ArrowDownLeft, Clock, User, CheckCircle, XCircle } from "lucide-react";

const History = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = localStorage.getItem("userId");
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Pastikan key-nya adalah 'user_id'
      try {
        
        const res = await axios.get(`${API_BASE_URL}/history/${userId}`);
        setTransactions(res.data);
      } catch (err) {
        console.error("❌ Gagal mengambil riwayat:", err);
      }
    };
    fetchHistory();
  }, []);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Riwayat Transaksi", 14, 10);
    const rows = transactions.map((t) => [
      t.type,
      t.label,
      t.amount,
      t.note,
      t.status,
      new Date(t.timestamp).toLocaleString(),
      t.from_username || "-",
      t.to_username || "-",
    ]);
    doc.autoTable({
      head: [["Tipe", "Label", "Jumlah", "Catatan", "Status", "Tanggal", "Dari", "Ke"]],
      body: rows,
    });
    doc.save("riwayat_transaksi.pdf");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-b-3xl shadow-xl mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">📚 Riwayat Transaksi</h2>
            <p className="text-blue-100">Kelola dan pantau semua aktivitas keuangan Anda</p>
          </div>
          <button
            onClick={exportToPDF}
            className="bg-white/10 backdrop-blur-sm text-white px-4 py-3 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            <FileDown size={18} />
            <span className="font-medium">Export PDF</span>
          </button>
        </div>
      </div>

      <div className="px-6">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <Clock size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Tidak ada riwayat transaksi</p>
            <p className="text-gray-400 text-sm mt-2">Transaksi Anda akan muncul di sini</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      tx.type === "penggunaan" 
                        ? "bg-gradient-to-br from-red-100 to-orange-100" 
                        : "bg-gradient-to-br from-green-100 to-blue-100"
                    }`}>
                      {tx.type === "penggunaan" ? (
                        <ArrowUpRight size={20} className="text-red-600" />
                      ) : (
                        <ArrowDownLeft size={20} className="text-green-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-lg capitalize">
                        {tx.type === "penggunaan"
                          ? `Penggunaan Dana - ${tx.label}`
                          : `Pengiriman Dana - ${tx.label}`}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          tx.status === "sukses" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {tx.status === "sukses" ? (
                            <CheckCircle size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}
                          {tx.status === "sukses" ? "Berhasil" : `Gagal`}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-xl font-bold ${
                      tx.type === "penggunaan" ? "text-red-600" : "text-green-600"
                    }`}>
                      {tx.type === "penggunaan" ? "-" : "+"}{formatCurrency(parseFloat(tx.amount || 0))}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(tx.timestamp).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>Dari: <span className="font-semibold text-gray-800">{tx.from_username || "-"} {tx.from_user_id ? `(ID: ${tx.from_user_id})` : ""}</span></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>Ke: <span className="font-semibold text-gray-800">{tx.to_username || "-"} {tx.to_user_id ? `(ID: ${tx.to_user_id})` : ""}</span></span>
                    </div>
                  </div>
                  
                  {tx.note && (
                    <div className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-xl mb-2">
                      "{tx.note}"
                    </div>
                  )}

                  {tx.status !== "sukses" && (
  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-xl mb-2">
    <span className="font-medium">Alasan gagal:</span>{" "}
    {tx.reason ? tx.reason.replace("asli:", "Label:") : "Tidak tersedia"}
  </div>
)}


                  {tx.type === "penggunaan" && (
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <div className="text-sm text-blue-700">
                        <span className="font-medium">💡 Info:</span> Dana dari <span className="font-bold">{tx.from_username || "-"} {tx.from_user_id ? `(ID: ${tx.from_user_id})` : ""}</span>{" "} digunakan oleh <span className="font-bold">{tx.to_username || "-"} {tx.to_user_id ? `(ID: ${tx.to_user_id})` : ""}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;