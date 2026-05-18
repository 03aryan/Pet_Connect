// In development, Vite proxies /api → localhost:5000 (see vite.config.js).
// In production, VITE_API_URL should be set to the deployed backend URL.
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export { API_BASE_URL };

export async function apiRequest(path, options = {}) {
  const { method = "GET", token, body, signal } = options;

  const headers = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}
