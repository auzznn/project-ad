import { NavLink, useNavigate } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "./SideBar.css";

// Tambahkan link Bootstrap Icons jika belum ada
if (typeof document !== 'undefined' && !document.querySelector('link[href*="bootstrap-icons"]')) {
  const link = document.createElement('link');
  link.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css";
  link.rel = "stylesheet";
  document.head.appendChild(link);
}

function SideBar({
  setIsAuthenticated,
  handleLogout,
}: {
  setIsAuthenticated: (value: boolean) => void;
  handleLogout: () => void;
}) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const menuItems = [
    { to: "/dashboard", label: "Papan Pemuka", icon: "bi-house", roles: ["admin", "teacher"] },
    { to: "/kehadiran", label: "Pengurusan Kehadiran", icon: "bi-clipboard-check", roles: ["admin", "teacher"], },
    { to: "/rmt", label: "Imbasan RMT", icon: "bi-graph-up", roles: ["admin", "teacher"] },
    { to: "/sahsiah", label: "Pengurusan Sahsiah", icon: "bi-star", roles: ["admin", "teacher"] },
    { to: "/pengguna", label: "Pengurusan Pengguna", icon: "bi-people", roles: ["admin"]}
  ];

  const handleLogoutLocal = () => {
    handleLogout();
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        QR
      </div>
      <nav>
        <ul>
          {menuItems
            .filter((item) => item.roles.includes(role || ""))
            .map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className={({ isActive }) => `btn ${isActive ? 'active' : ''}` }>
                  <i className={`bi ${item.icon}`}></i>
                  {item.label}
                </NavLink>
              </li>
            ))}
          <li>
            <button className="btn" onClick={handleLogoutLocal}>
              <i className="bi bi-box-arrow-left"></i>
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default SideBar;
