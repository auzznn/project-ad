export const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("access");

  // Detect if body is FormData
  const isFormData = options.body instanceof FormData;

  // Create Headers instance
  const headers = new Headers(options.headers);

  // Add Authorization if token exists
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Only set Content-Type for JSON requests, NOT FormData
  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let res = await fetch(url, { ...options, headers });

  // Handle 401 – try refresh
  if (res.status === 401) {
    const refreshToken = localStorage.getItem("refresh");
    if (refreshToken) {
      try {
        const refreshRes = await fetch(
          "https://backend.eduqr.cloud/api/authentication/token/refresh",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
          }
        );

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          const newAccess = data.access;
          localStorage.setItem("access", newAccess);

          // Retry original request with new access token
          headers.set("Authorization", `Bearer ${newAccess}`);
          res = await fetch(url, { ...options, headers });
        } else {
          // Refresh failed -> redirect to login
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
          return res;
        }
      } catch (err) {
        console.error("Token refresh failed:", err);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
        return res;
      }
    } else {
      // No refresh token -> redirect
      localStorage.removeItem("access");
      window.location.href = "/login";
      return res;
    }
  }

  return res;
};
