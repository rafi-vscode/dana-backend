import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Kirim from "./pages/Kirim";
import Use from "./pages/Use";
import History from "./pages/History";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Navbar from "./components/NavBar";
import Analytics from "./pages/Analytics";

function AppRoutes() {
  const location = useLocation();

  // Sembunyikan navbar di halaman login dan register
  const hideNavbar = ["/", "/register"].includes(location.pathname);

  return (
    <>
      {/* Routes utama */}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/kirim" element={<Kirim />} />
        <Route path="/use" element={<Use />} />
        <Route path="/history" element={<History />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profil" element={<Profile />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>

      {/* Navbar hanya muncul jika bukan di halaman login/register */}
      {!hideNavbar && <Navbar />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
