import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const TOKEN_STORAGE_KEY = "pet_connect_token";
const USER_STORAGE_KEY = "pet_connect_user";

const createApiError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const parseStoredUser = () => {
  const rawUser = localStorage.getItem(USER_STORAGE_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

const normalizeUser = (user) => {
  if (!user) return null;

  const fullName =
    user.name ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  const nameParts = fullName ? fullName.split(" ") : [];

  return {
    ...user,
    name: fullName,
    firstName: user.firstName || nameParts[0] || "",
    lastName: user.lastName || nameParts.slice(1).join(" "),
  };
};

const requestJson = async (url, payload) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw createApiError(data.message || "Request failed", response.status);
  }

  return data;
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_STORAGE_KEY) || null,
  );
  const [user, setUser] = useState(() => normalizeUser(parseStoredUser()));

  const persistAuth = (nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);

    if (nextToken) {
      localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    if (nextUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  const applyAuthResponse = (responseData) => {
    const nextUser = normalizeUser(responseData.user);
    const nextToken = responseData.token || null;
    persistAuth(nextUser, nextToken);
    return { user: nextUser, token: nextToken };
  };

  const updateUser = (nextUserData) => {
    const nextUser = normalizeUser(nextUserData);
    persistAuth(nextUser, token);
    return nextUser;
  };

  const login = async (credentials) => {
    const data = await requestJson(
      `${API_BASE_URL}/api/auth/login`,
      credentials,
    );
    return applyAuthResponse(data);
  };

  const signup = async (formData) => {
    const payload = {
      name: [formData.firstName, formData.lastName]
        .filter(Boolean)
        .join(" ")
        .trim(),
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    const primaryUrl = `${API_BASE_URL}/api/auth/signup`;
    const fallbackUrl = `${API_BASE_URL}/api/auth/register`;

    try {
      const data = await requestJson(primaryUrl, payload);
      return applyAuthResponse(data);
    } catch (error) {
      if (error.status !== 404) throw error;

      const data = await requestJson(fallbackUrl, payload);
      return applyAuthResponse(data);
    }
  };

  const logout = () => {
    persistAuth(null, null);
  };

  const refreshUser = async () => {
    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw createApiError(
        data.message || "Failed to refresh user",
        response.status,
      );
    }

    const nextUser = normalizeUser(data.user);
    persistAuth(nextUser, token);
    return nextUser;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      signup,
      logout,
      refreshUser,
      updateUser,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
