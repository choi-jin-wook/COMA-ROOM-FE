import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type User = {
  id: number;
  name: string;
  studentId: string;
  role: "admin" | "user";
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  isInitialized: boolean;
  login: (payload: { user: User; accessToken: string; refreshToken?: string }) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;

  if (value === "undefined" || value === "null" || value === "[object Object]") return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUserRaw = localStorage.getItem("user");

    if (token && token !== "undefined" && token !== "null") {
      setAccessToken(token);
    } else {
      localStorage.removeItem("accessToken");
    }

    const storedUser = safeJsonParse<User>(storedUserRaw);
    if (storedUser) {
      setUser(storedUser);
    } else {
      localStorage.removeItem("user");
    }

    setIsInitialized(true);
  }, []);

  const login: AuthState["login"] = ({ user, accessToken, refreshToken }) => {
    setUser(user);
    setAccessToken(accessToken);

    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("name", user.name);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("name");
  };

  const value = useMemo(() => ({ user, accessToken, isInitialized, login, logout }), [user, accessToken, isInitialized]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}