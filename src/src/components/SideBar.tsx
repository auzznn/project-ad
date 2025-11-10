import { NavLink, useNavigate } from "react-router-dom";
import "./SideBar.css";

function SideBar({
  setIsAuthenticated,
}: {
  setIsAuthenticated: (value: boolean) => void;
}) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const menuItems = [
    { to: "/dashboard", label: "Papan Pemuka", roles: ["admin", "teacher"] },
    { to: "/kehadiran", label: "Pengurusan Kehadiran", roles: ["admin", "teacher"], },
    { to: "/rmt", label: "Imbasan RMT", roles: ["admin", "teacher"] },
    { to: "/sahsiah", label: "Pengurusan Sahsiah", roles: ["admin", "teacher"] },
    { to: "/pengguna", label: "Pengurusan Pengguna", roles: ["admin"]}
  ];

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <div
      style={{
        width: "250px",
        height: "100vh",

        padding: "20px",

        color: "whitesmoke",
        backgroundColor: "#1e293b",
      }}
    >
      <div className="sidebar">
        <nav>
          <ul>
            {menuItems
              .filter((item) => item.roles.includes(role || ""))
              .map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} className="btn">
                    {item.label}
                  </NavLink>
                </li>
              ))}
            <li>
              <button className="btn" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default SideBar;
