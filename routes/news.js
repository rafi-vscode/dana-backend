import express from "express";
import axios from "axios";
import xml2js from "xml2js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const response = await axios.get("https://www.antaranews.com/rss/ekonomi.xml");

    const rssData = await xml2js.parseStringPromise(response.data, {
      explicitArray: false,
      mergeAttrs: true
    });

    const items = rssData.rss.channel.item;

    const newsList = items.slice(0, 10).map(item => ({
      title: item.title,
      link: item.link,
      summary: item.description,
      pubDate: item.pubDate,
      img: extractImageFromDescription(item.description)
    }));

    console.log("✅ Jumlah berita ditemukan:", newsList.length);
    res.json({ items: newsList });
  } catch (err) {
    console.error("❌ Gagal ambil RSS ANTARA:", err.message);
    res.status(500).json({ error: "Gagal ambil RSS ANTARA", detail: err.message });
  }
});

// ✅ Fungsi bantu ambil gambar dari <img ...> di description
function extractImageFromDescription(desc) {
  const match = desc.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
}

export default router;
