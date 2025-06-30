import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Kirim from "./pages/Kirim";
import Use from "./pages/Use";
import History from "./pages/History";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";

import Navbar from "./components/NavBar";
import Assistant from "./components/Assistant";

// Cek apakah user sudah login
const isLoggedIn = () => !!localStorage.getItem("token");

function LayoutWrapper({ children }) {
  const location = useLocation();
  const hideLayout = location.pathname === "/" || location.pathname === "/register";

  return (
    <>
      {!hideLayout && <Navbar />}
      {!hideLayout && <Assistant />}
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LayoutWrapper>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Semua halaman ini hanya bisa diakses saat login */}
          {isLoggedIn() && (
            <>
              <Route path="/home" element={<Home />} />
              <Route path="/kirim" element={<Kirim />} />
              <Route path="/use" element={<Use />} />
              <Route path="/history" element={<History />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profil" element={<Profile />} />
            </>
          )}

          {/* Jika belum login, redirect ke login */}
          {!isLoggedIn() && <Route path="*" element={<Navigate to="/" />} />}
        </Routes>
      </LayoutWrapper>
    </BrowserRouter>
  );
}
