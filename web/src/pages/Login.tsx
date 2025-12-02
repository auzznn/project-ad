import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

import "./Login.css";

interface LoginProps {
  setIsAuthenticated: (value: boolean) => void;
}

function Login({ setIsAuthenticated }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.removeItem("access");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
  }, [setIsAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

   try {
  const response = await fetch("http://127.0.0.1:8080/api/authentication/token", {

    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    return setError(data.detail || "Invalid credentials");
  }

  if (!data.access || !data.refresh) {
    return setError("Token not provided by server");
  }

  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);

  const decoded = jwtDecode<{ role?: string }>(data.access);

  if (!decoded.role) {
    console.warn("No role found in token");
  } else {
    localStorage.setItem("role", decoded.role);
  }

  setIsAuthenticated(true);
  window.location.href = "/dashboard";

} catch (err: any) {
  console.error(err);
  setError("Network error or server is down");
}
  }
  

  return (
    <div className="login-page">
      <div className="login-container">

          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input className="input"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <br />
            <input className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)
              }
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
