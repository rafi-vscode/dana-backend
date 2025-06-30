import { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { CreditCard, TrendingUp, Wallet, Eye, EyeOff, BarChart3 } from "lucide-react";

export default function FinancialDashboard() {
  const [balances, setBalances] = useState([]);
  const [msg, setMsg] = useState("");
  const [data, setData] = useState([]);
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const username = localStorage.getItem("username") || "User";
  const [avatarUrl, setAvatarUrl] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setMsg("❌ User belum login");
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/balance/${userId}`);

        setBalances(res.data);
      } catch (err) {
        console.error("Error saat fetch saldo:", err);
        setMsg("❌ Gagal mengambil saldo");
      }
    };
    fetchBalances();
  }, [API_BASE_URL]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user_id = localStorage.getItem("userId");
        const res = await axios.get(`${API_BASE_URL}/history/${user_id}`);

        const grouped = {};

        res.data.forEach((tx) => {
          const date = tx.timestamp.split("T")[0];
          const amount = parseFloat(tx.amount);
          const delta = tx.type === "penggunaan" ? -amount : amount;

          if (!grouped[date]) {
            grouped[date] = 0;
          }
          grouped[date] += delta;
      });

      const sortedDates = Object.keys(grouped).sort();
      let runningTotal = 0;
      const chartData = sortedDates.map((date) => {
        runningTotal += grouped[date];
        return {
          date,
          balance: runningTotal,
        };
      });

      setData(chartData);
    } catch (err) {
      console.error("❌ Gagal mengambil data riwayat:", err);
    }
  };

  fetchHistory();
}, [API_BASE_URL]);

useEffect(() => {
  const fetchAvatar = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {
      const res = await axios.get(`${API_BASE_URL}/profile/avatar/${userId}`);
      if (res.data.avatar) {
        setAvatarUrl(`${API_BASE_URL.replace("/api", "")}${res.data.avatar}`);
      }
    } catch (err) {
      console.warn("⚠️ Avatar tidak ditemukan:", err.response?.data?.message || err.message);
    }
  };
  fetchAvatar();
}, [API_BASE_URL]);

  const totalBalance = balances.reduce((sum, balance) => sum + parseFloat(balance.amount || 0), 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const TabButton = ({ id, label, icon: Icon, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center justify-center py-3 px-4 rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
          : 'bg-white text-gray-600 hover:bg-gray-50'
      }`}
    >
      {Icon && <Icon size={20} className="mb-1" />}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-b-3xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-white/20 rounded-full overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.target.style.display = "none")}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                  {username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Hai, {username}!</h1>
              <p className="text-blue-100">Selamat datang kembali</p>
            </div>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-full bg-white" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-blue-190">Total Saldo</span>
            <button onClick={() => setShowBalance(!showBalance)} className="p-2 hover:bg-white/10 rounded-full">
              {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          <div className="text-3xl font-bold mb-1">
            {showBalance ? formatCurrency(totalBalance) : "Rp ••••••••"}
          </div>
          <div className="flex items-center text-red-200">
            <TrendingUp size={16} className="mr-1" />
            <span className="text-sm">Saldo berlabel tersedia</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="flex space-x-3 bg-gray-300 p-2 rounded-2xl">
          <TabButton id="home" label="Beranda" icon={Wallet} active={activeTab === "home"} />
          <TabButton id="analytics" label="Analitik" icon={BarChart3} active={activeTab === "analytics"} />
        </div>
      </div>

      <div className="px-6 pb-6">
        {msg && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 font-medium text-center">{msg}</p>
          </div>
        )}

        {activeTab === "home" && (
          <div className="space-y-4">
            {balances.length === 0 ? (
              <div className="text-center py-12">
                <Wallet size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Tidak ada saldo yang tersedia</p>
              </div>
            ) : (
              <div className="space-y-3">
                {balances.map((b, idx) => (
                  <div key={idx} className="bg-green-100 rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                          <span className="font-bold text-gray-800 text-lg">🏷️ {b.label}</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          {showBalance ? `Rp ${b.amount}` : "Rp ••••••"}
                        </div>
                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Dari: <b>{b.from_username}</b></span>
                          <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">ID: {b.from_user_id}</span>
                        </div>
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                        <CreditCard size={24} className="text-blue-600" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            {data.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-2xl">
                  <div className="text-sm opacity-90">Tertinggi</div>
                  <div className="text-xl font-bold">
                    {formatCurrency(Math.max(...data.map(d => d.balance)))}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-2xl">
                  <div className="text-sm opacity-90">Rata-rata</div>
                  <div className="text-xl font-bold">
                    {formatCurrency(data.reduce((sum, d) => sum + d.balance, 0) / data.length)}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Grafik Saldo Harian</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} />
                  <YAxis
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(val) => `Rp ${val.toLocaleString("id-ID")}`}
                    width={100}
                  />
                  <Tooltip
                    formatter={(value) => `Rp ${value.toLocaleString("id-ID")}`}
                    labelFormatter={(label) => `Tanggal: ${label}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="#00b894"
                    strokeWidth={3}
                    dot={{ r: 6, fill: '#00b894', strokeWidth: 2, stroke: 'white' }}
                    activeDot={{ r: 8, fill: '#00b894' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
