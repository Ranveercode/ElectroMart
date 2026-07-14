const API = "https://electro-mart-qalg.vercel.app";

// Get the stored JWT token
export const getToken = () => localStorage.getItem("electromart_token");

// Save the JWT token
export const setToken = (token) => {
  if (token) {
    localStorage.setItem("electromart_token", token);
  }
};

// Remove the JWT token
export const removeToken = () => {
  localStorage.removeItem("electromart_token");
};

// Authenticated fetch wrapper — attaches the Bearer token header automatically.
// This works on ALL browsers including mobile Safari which blocks third-party cookies.
export const authFetch = (url, options = {}) => {
  const token = getToken();
  const headers = { ...(options.headers || {}) };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: "include", // Keep cookie fallback for desktop
  });
};

export default API;
