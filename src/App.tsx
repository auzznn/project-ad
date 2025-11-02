import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
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

  const isLoginPage = location.pathname.toLowerCase() === "/login";

  return (
    <div style={{ display: "flex" }}>
      {!isLoginPage && isAuthenticated && <SideBar setIsAuthenticated={setIsAuthenticated} />}

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
