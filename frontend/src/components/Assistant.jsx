import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState, useCallback } from "react";
import nailong from "../assets/nailong-assistant.png";
import { chatWithNailong } from "../services/assistantService";

// ✅ Sapaan awal berdasarkan path
const greetings = {
  "/home": (name) => `Hai ${name}! Senang melihatmu kembali 😊`,
  "/kirim": (name) => `Halo ${name}, siap bantu kirim dana. Mau kirim ke siapa hari ini?`,
  "/use": (name) => `${name}, pastikan dana digunakan sesuai label ya. Perlu bantuan?`,
  "/profil": (name) => `Lihat-lihat profil ya, ${name}? Semoga semuanya sesuai harapanmu 💬`,
  "/notifications": (name) => `Cek notifikasi yuk, ${name}. Ada informasi baru mungkin~`,
  "/history": (name) => `Lihat semua riwayat transaksi di sini ya, ${name} 🔎`,
};

// 🔊 Suara untuk berbagai event
const soundEffects = {
  greeting: "Hai! Selamat datang kembali!",
  touch: "Ada yang bisa kubantu?",
  drag: "Oke, aku ikut kamu!",
  minimize: "Sampai jumpa!",
  expand: "Hai lagi!",
  newMessage: "Ada pesan baru nih!"
};

export default function Assistant() {
  const location = useLocation();
  const path = location.pathname;
  const username = localStorage.getItem("username") || "teman";

  const [visible, setVisible] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem(`assistant_chat_${path}`);
    return stored ? JSON.parse(stored) : [];
  });
  const [userMsg, setUserMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  const dragRef = useRef(null);
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });
  const dragStartTime = useRef(0);
  const synthRef = useRef(null);

  // 🔊 Fungsi untuk text-to-speech dengan suara CHIPMUNK
  const speak = useCallback((text, options = {}) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    
    // Hentikan suara sebelumnya jika ada
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Konfigurasi suara CHIPMUNK 🐿️
    utterance.lang = 'id-ID'; // Bahasa Indonesia
    utterance.rate = options.rate || 1.1;    // Lebih cepat untuk efek chipmunk
    utterance.pitch = options.pitch || 1.5;  // Pitch tinggi untuk suara cempreng
    utterance.volume = options.volume || 0.8;
    
    // Prioritas suara perempuan untuk efek chipmunk yang lebih baik
    const voices = window.speechSynthesis.getVoices();
    
    // Cari suara perempuan Indonesia atau English dengan pitch tinggi
    const preferredVoice = voices.find(voice => 
      (voice.lang.includes('id') || voice.lang.includes('en')) && 
      (voice.name.toLowerCase().includes('female') || 
       voice.name.toLowerCase().includes('woman') ||
       voice.name.toLowerCase().includes('sari') ||
       voice.name.toLowerCase().includes('damayanti'))
    ) || voices.find(voice => 
      voice.lang.includes('en') && voice.name.toLowerCase().includes('female')
    ) || voices.find(voice => 
      voice.lang.includes('en')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  // 🔊 Cek apakah ini login pertama kali
  useEffect(() => {
    const hasLoggedBefore = localStorage.getItem('hasLoggedBefore');
    if (!hasLoggedBefore && username !== 'teman') {
      setIsFirstLogin(true);
      localStorage.setItem('hasLoggedBefore', 'true');
    }
  }, [username]);

  // ⬇️ Greeting on route change + suara
  useEffect(() => {
    const initializeChat = async () => {
      const storageKey = `assistant_chat_${location.pathname}`;
      const storedMessages = localStorage.getItem(storageKey);
      const username = localStorage.getItem("username") || "teman";

      if (!username) {
        setTimeout(initializeChat, 100);
        return;
      }

      if (storedMessages && storedMessages !== "[]") {
        // ✅ Sudah pernah ke halaman ini → load obrolan lama
        const parsedMessages = JSON.parse(storedMessages);
        setMessages(parsedMessages);
        
        // Suara untuk halaman yang sudah dikunjungi
        setTimeout(() => {
          speak(soundEffects.greeting);
        }, 1000);
      } else {
        // ❌ Belum pernah ke halaman ini → sapa pertama kali
        const greet = greetings[location.pathname]?.(username) || `Hai ${username}, ada yang bisa kubantu?`;
        const initial = [{ from: "nailong", text: greet }];
        setMessages(initial);
        localStorage.setItem(storageKey, JSON.stringify(initial));
        
        // Suara untuk halaman baru + greeting khusus
        setTimeout(() => {
          if (isFirstLogin) {
            speak(`Selamat datang ${username}! Aku Nailong, asisten digitalmu. ${greet}`);
          } else {
            speak(greet);
          }
        }, 1500);
      }
    };
    
    setMessages([]);
    initializeChat();
  }, [path, location.pathname, username, speak, isFirstLogin]);

  // 💾 Save messages to localStorage
  useEffect(() => {
    const storageKey = `assistant_chat_${location.pathname}`;
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, path, location.pathname]);

  // 🔊 Load voices when available
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    
    if (window.speechSynthesis) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // 🖱️ Handle dragging dengan suara
  const handleMove = useCallback((x, y) => {
    if (!dragRef.current || !isDragging.current) return;

    const el = dragRef.current;
    const width = el.offsetWidth;
    const height = el.offsetHeight;

    const newX = Math.max(0, Math.min(window.innerWidth - width, x - offset.current.x));
    const newY = Math.max(0, Math.min(window.innerHeight - height, y - offset.current.y));

    el.style.left = `${newX}px`;
    el.style.top = `${newY}px`;
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging.current || !e.touches[0]) return;
    e.preventDefault();
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  }, [handleMove]);

  const stopDrag = useCallback(() => {
    if (isDragging.current) {
      // Suara ketika selesai drag
      setTimeout(() => {
        speak("Nah, di sini aja ya!");
      }, 200);
    }
    isDragging.current = false;
    document.body.style.userSelect = "";
    document.body.style.overflow = "";
  }, [speak]);

  const startDrag = useCallback((e) => {
    if (!dragRef.current) return;

    // Cegah default behavior untuk touch
    if (e.type === 'touchstart') {
      e.preventDefault();
    }

    isDragging.current = true;
    dragStartTime.current = Date.now();
    
    // Suara ketika mulai drag
    speak(soundEffects.drag, { rate: 2.2 });
    
    const rect = dragRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    offset.current = {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
    
    document.body.style.userSelect = "none";
    document.body.style.overflow = "hidden";
  }, [speak]);

  useEffect(() => {
    const handleMouseUp = (e) => stopDrag(e);
    const handleTouchEnd = (e) => stopDrag(e);

    document.addEventListener("mousemove", handleMouseMove, { passive: false });
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleMouseMove, stopDrag, handleTouchMove]);

  // Handle click untuk expand dari mini mode
  const handleMiniClick = useCallback(() => {
    setVisible(true);
    speak(soundEffects.expand);
  }, [speak]);

  const handleNailongClick = useCallback((e) => {
    e.stopPropagation();
    
    // Cek apakah ini adalah hasil dari drag
    const dragDuration = Date.now() - dragStartTime.current;
    const wasDragging = dragDuration > 150;
    
    // Hanya toggle jika bukan drag
    if (!wasDragging) {
      if (minimized) {
        setVisible(false);
        setMinimized(false);
        speak(soundEffects.minimize);
      } else {
        setMinimized(true);
        speak(soundEffects.touch);
      }
    }
  }, [minimized, speak]);

  const sendMessage = useCallback(async () => {
    if (!userMsg.trim() || loading) return;
    const text = userMsg.trim();
    const newMessages = [...messages, { from: "user", text }];
    setMessages(newMessages);
    setUserMsg("");
    setLoading(true);

    try {
      const res = await chatWithNailong(localStorage.getItem("userId"), text);
      const reply = res?.reply?.trim() || "Hmm... aku belum bisa menjawab itu 😅";
      setTimeout(() => {
        setMessages((prev) => [...prev, { from: "nailong", text: reply }]);
        setLoading(false);
        
        // Bacakan balasan dari AI
        speak(reply);
      }, 500);
    } catch (err) {
      console.error("❌ Assistant error:", err);
      const errorMsg = "Ups! Aku kesulitan menjawabnya 😢";
      setMessages((prev) => [
        ...prev,
        { from: "nailong", text: errorMsg },
      ]);
      speak(errorMsg);
      setLoading(false);
    }
  }, [userMsg, messages, loading, speak]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Toggle voice on/off
  const toggleVoice = useCallback(() => {
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled) {
      speak("Suara diaktifkan!");
    } else {
      // Hentikan suara yang sedang berjalan
      window.speechSynthesis.cancel();
    }
  }, [voiceEnabled, speak]);

  // MINI mode (hanya avatar)
  if (!visible) {
    return (
      <div
        ref={dragRef}
        className="fixed bottom-4 right-4 z-50 cursor-move touch-none"
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        style={{ position: "fixed", userSelect: "none" }}
      >
        <img
          src={nailong}
          alt="Nailong Mini"
          className="w-12 h-12 rounded-full shadow-lg animate-bounce cursor-pointer"
          onClick={handleMiniClick}
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div
      ref={dragRef}
      className="fixed bottom-20 right-4 z-50 w-72 select-none cursor-move touch-none"
      style={{ position: "fixed", userSelect: "none" }}
    >
      {/* Chat Box */}
      {!minimized && (
        <div 
          className="bg-white p-3 rounded-xl shadow-xl max-h-80 overflow-y-auto text-sm space-y-2"
          onMouseDown={startDrag}
          onTouchStart={startDrag}
        >
          {/* Voice Toggle Button */}
          <div className="flex justify-between items-center mb-2 pb-2 border-b">
            <span className="text-xs text-gray-500">🐲 Nailong Assistant</span>
            <button
              onClick={toggleVoice}
              className={`text-xs px-2 py-1 rounded ${
                voiceEnabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {voiceEnabled ? '🔊 ON' : '🔇 OFF'}
            </button>
          </div>

          {messages.map((m, i) => (
            <p key={i} className={m.from === "nailong" ? "text-green-800" : "text-gray-700"}>
              <b>{m.from === "nailong" ? "🐲" : "👤"}</b> {m.text}
            </p>
          ))}
          {loading && <p className="text-green-600 animate-pulse">🐲 sedang mengetik...</p>}

          <div className="flex gap-1 mt-2">
            <input
              value={userMsg}
              onChange={(e) => setUserMsg(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              placeholder="Balas Nailong..."
              autoComplete="off"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-blue-600 text-white px-2 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              Kirim
            </button>
          </div>
        </div>
      )}

      {/* Nailong Avatar */}
      <div 
        className="flex justify-center mt-2"
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      >
        <img
          src={nailong}
          className="w-20 h-20 rounded-full animate-bounce cursor-pointer"
          onClick={handleNailongClick}
          draggable={false}
          alt="Nailong"
        />
      </div>
    </div>
  );
}