import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./Login.css";

const fakeJWT = {
  admin: "fake_admin_jwt_token_123",
  teacher: "fake_teacher_jwt_token_456",
};

interface LoginProps {
  setIsAuthenticated: (value: boolean) => void;
}

function Login({ setIsAuthenticated }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("access");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
  }, [setIsAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (username === "admin" && password === "1234") {
      localStorage.setItem("access", fakeJWT.admin);
      localStorage.setItem("role", "admin");
      localStorage.setItem("username", "Admin Cikgu");
      setIsAuthenticated(true);
      navigate("/dashboard");

    } else if (username === "teacher" && password === "1234") {
      localStorage.setItem("access", fakeJWT.teacher);
      localStorage.setItem("role", "teacher");
      localStorage.setItem("username", "Guru Cikgu");
      setIsAuthenticated(true);
      navigate("/dashboard");

    } else {
      setError("invalid credentials");
    }
  };

//   const response = await fetch("http://your-backend/api/token/", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({ username, password }),
// });
// const data = await response.json();
// localStorage.setItem("access", data.access);

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
