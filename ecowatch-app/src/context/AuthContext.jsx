import React, { createContext, useState, useCallback, useContext, useEffect } from "react";
import { apiRequest } from "../lib/api";
import safeStorage from "../lib/safeStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const request = useCallback(async (path, options = {}) => {
    const body = await apiRequest(path, options);
    if (body?.offlineFallback) throw new Error("Cannot connect to backend server.");
    return body;
  }, []);

  const DEFAULT_USER = {
    id: 2,
    name: "Subhasree Pitchaiya",
    email: "24104031@nec.edu.in",
    role: "System Admin",
    organization: "EcoWatch Global / NEC",
    location: "Chennai, Tamil Nadu",
  };

  useEffect(() => {
    const token = safeStorage.getItem("ecowatch-token");
    const savedUser = safeStorage.getItem("ecowatch-user");
    const isLoggedOut = safeStorage.getItem("ecowatch-logged-out") === "true";

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(DEFAULT_USER);
      }
    } else if (!isLoggedOut) {
      setUser(DEFAULT_USER);
      safeStorage.setItem("ecowatch-user", JSON.stringify(DEFAULT_USER));
    }

    if (!token) {
      setIsReady(true);
      return;
    }
    request("/auth/me")
      .then(({ user: currentUser }) => {
        setUser(currentUser);
        safeStorage.setItem("ecowatch-user", JSON.stringify(currentUser));
      })
      .catch(() => {
        // Retain local session if present
      })
      .finally(() => setIsReady(true));
  }, [request]);

  const login = useCallback(async ({ email, password, fullName, mobile, location }) => {
    setIsLoading(true);
    setError(null);
    try {
      safeStorage.removeItem("ecowatch-logged-out");
      const endpoint = fullName ? "/auth/register" : "/auth/login";
      const result = await request(endpoint, {
        method: "POST",
        body: JSON.stringify({ email, password, name: fullName, fullName, mobile, location }),
      });
      safeStorage.setItem("ecowatch-token", result.token);
      safeStorage.setItem("ecowatch-user", JSON.stringify(result.user));
      setUser(result.user);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [request]);

  const logout = useCallback(() => {
    safeStorage.removeItem("ecowatch-token");
    safeStorage.removeItem("ecowatch-user");
    safeStorage.setItem("ecowatch-logged-out", "true");
    setUser(null);
  }, []);

  const loginWithGoogle = useCallback(async ({ idToken }) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!idToken) throw new Error("Google did not return a valid credential.");
      const result = await request("/auth/google", {
        method: "POST",
        body: JSON.stringify({ idToken }),
      });
      safeStorage.setItem("ecowatch-token", result.token);
      safeStorage.setItem("ecowatch-user", JSON.stringify(result.user));
      setUser(result.user);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [request]);

  const loginWithFastOAuth = useCallback(async ({ provider = "Google", email, name, role } = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await request("/auth/oauth-fast", {
        method: "POST",
        body: JSON.stringify({ provider, email, name, role }),
      });
      safeStorage.setItem("ecowatch-token", result.token);
      safeStorage.setItem("ecowatch-user", JSON.stringify(result.user));
      setUser(result.user);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [request]);

  const updateUser = useCallback((updatedUserData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUserData };
      safeStorage.setItem("ecowatch-user", JSON.stringify(merged));
      return merged;
    });
  }, []);

  const value = { login, loginWithGoogle, loginWithFastOAuth, logout, updateUser, isLoading, isReady, error, user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an <AuthProvider>");
  return ctx;
}
