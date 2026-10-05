import React, { createContext, useState, useCallback, useContext, useEffect } from "react";
import { apiRequest } from "../lib/api";

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

  useEffect(() => {
    const token = localStorage.getItem("ecowatch-token");
    const savedUser = localStorage.getItem("ecowatch-user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        // Ignore parse error
      }
    }
    if (!token) {
      setIsReady(true);
      return;
    }
    request("/auth/me")
      .then(({ user: currentUser }) => {
        setUser(currentUser);
        localStorage.setItem("ecowatch-user", JSON.stringify(currentUser));
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
      const endpoint = fullName ? "/auth/register" : "/auth/login";
      const result = await request(endpoint, {
        method: "POST",
        body: JSON.stringify({ email, password, name: fullName, fullName, mobile, location }),
      });
      localStorage.setItem("ecowatch-token", result.token);
      localStorage.setItem("ecowatch-user", JSON.stringify(result.user));
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
    localStorage.removeItem("ecowatch-token");
    localStorage.removeItem("ecowatch-user");
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
      localStorage.setItem("ecowatch-token", result.token);
      localStorage.setItem("ecowatch-user", JSON.stringify(result.user));
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
      localStorage.setItem("ecowatch-token", result.token);
      localStorage.setItem("ecowatch-user", JSON.stringify(result.user));
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
      localStorage.setItem("ecowatch-user", JSON.stringify(merged));
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
