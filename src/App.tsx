import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./App.css"; // Import CSS baru
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS

// Komponen Header baru
const Header = ({ username, handleLogout }: { username: string, handleLogout: () => void }) => (
  <div className="top-navbar">
    <div className="logo">
      <i className="bi bi-qr-code-scan"></i> Sistem QR SK Sri Siakap
    </div>
    <div className="user-info">
      <span>Selamat Datang, {username}</span>
      <div className="icon-group">
        <i className="bi bi-bell"></i>
        <i className="bi bi-person-circle"></i>
        <i className="bi bi-gear"></i>
        <i className="bi bi-box-arrow-right" onClick={handleLogout} style={{ cursor: 'pointer' }}></i>
      </div>
    </div>
  </div>
);
import SideBar from "./components/SideBar";
import Dashboard from "./pages/Dashboard";
import Kehadiran from "./pages/Kehadiran";
import RMT from "./pages/RMT";
import Sahsiah from "./pages/Sahsiah";
import Pengguna from "./pages/Pengguna";
import Login from "./pages/Login";

function PrivateRoute({ element, isAuthenticated }: { element: React.ReactElement; isAuthenticated: boolean }) {
  return isAuthenticated ? element : <Navigate to="/login" />;
}

function AppContent({
  isAuthenticated,
  setIsAuthenticated,
}: {
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;
}) {
  const location = useLocation();

  // 🔁 Every time route changes, recheck token in localStorage
  useEffect(() => {
    const token = localStorage.getItem("access");
    setIsAuthenticated(!!token);
  }, [location, setIsAuthenticated]);

  // Tambahkan link Bootstrap Icons
  useEffect(() => {
    const link = document.createElement('link');
    link.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const isLoginPage = location.pathname.toLowerCase() === "/login";
  const username = localStorage.getItem("username") || "Admin Cikgu"; // Ambil username dari localStorage atau default

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
  };

  return (
    <div className="app-container">
      {!isLoginPage && isAuthenticated && <SideBar setIsAuthenticated={setIsAuthenticated} handleLogout={handleLogout} />}
      
      <div className="main-content">
        {!isLoginPage && isAuthenticated && <Header username={username} handleLogout={handleLogout} />}
        <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={<PrivateRoute isAuthenticated={isAuthenticated} element={<Dashboard />} />}
        />
        <Route
          path="/kehadiran"
          element={<PrivateRoute isAuthenticated={isAuthenticated} element={<Kehadiran />} />}
        />
        <Route
          path="/rmt"
          element={<PrivateRoute isAuthenticated={isAuthenticated} element={<RMT />} />}
        />
        <Route
          path="/sahsiah"
          element={<PrivateRoute isAuthenticated={isAuthenticated} element={<Sahsiah />} />}
        />
        <Route
          path="/pengguna"
          element={<PrivateRoute isAuthenticated={isAuthenticated} element={<Pengguna />} />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("access"));

  return (
    <Router>
      <AppContent isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
    </Router>
  );
}

export default App;
