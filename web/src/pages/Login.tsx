import { useState, useEffect } from "react";
import "./Login.css";

/* ================= JWT PARSER ================= */
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to parse JWT:", error);
    return null;
  }
};

/* ================= INTERFACES ================= */
interface LoginProps {
  setIsAuthenticated: (value: boolean) => void;
}

interface TokenResponse {
  access: string;
  refresh: string;
  detail?: string;
}

/* ================= COMPONENT ================= */
function Login({ setIsAuthenticated }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  /* Clear old auth data */
  useEffect(() => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
  }, [setIsAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8080/api/authentication/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      const data: TokenResponse = await response.json();

      /* Handle login error */
      if (!response.ok) {
        setError(data.detail || "Invalid credentials");
        return;
      }

      /* Store tokens */
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      /* Decode role from JWT */
      const payload = parseJwt(data.access);
      console.log("JWT payload:", payload);

      if (payload?.role) {
        localStorage.setItem("role", payload.role);
      } else {
        console.warn("No role found in JWT payload");
      }

      setIsAuthenticated(true);
      window.location.href = "/dashboard";

    } catch (err) {
      console.error("Login error:", err);
      setError("Network error or server is down");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Login</h2>

        <form onSubmit={handleLogin}>
          <input
            className="input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <br />

          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <br />

          <button type="submit">Login</button>
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}

export default Login;
