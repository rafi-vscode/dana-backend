import { useEffect, useState } from "react";
import axios from "axios";

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Remove HTML tags and decode HTML entities from description
function cleanDescription(description) {
  if (!description) return "";
  // Remove HTML tags
  const text = description.replace(/<[^>]+>/g, "");
  // Optionally decode HTML entities
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

export default function Notifications() {
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:3000/api/news")
      .then(res => setArticles(res.data.items))
      .catch(() => setError("❌ Gagal muat berita"))
      .finally(() => setLoading(false));
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-24">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-b-3xl shadow-xl">
        <h1 className="text-2xl font-bold">📰 Berita Terkini</h1>
        <p className="text-blue-100 mt-1">Update berita ekonomi dunia terbaru hari ini</p>
      </div>

      <div className="p-6 space-y-4">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Memuat berita...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            <p className="font-medium">Terjadi Kesalahan</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Articles */}
        {!loading && !error && articles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Tidak ada berita yang tersedia saat ini.</p>
          </div>
        )}

        {!loading && articles.length > 0 && articles.map((article) => (
          <div key={article.link} className="bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border border-gray-100">
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline block transition"
            >
              {article.title}
            </a>
            
            <p className="text-sm text-gray-500 mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDate(article.pubDate)}
            </p>
            
            <p className="text-gray-700 mt-3 leading-relaxed line-clamp-3">
              {cleanDescription(article.description)}
            </p>
            
            <div className="mt-3 pt-3 border-t border-gray-100">
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center transition"
              >
                Baca Selengkapnya
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}