import React, { createContext, useState, useCallback, useContext } from "react";

const AuthContext = createContext(null);

/**
 * AuthProvider — shared login state (useState + useCallback), read via
 * useContext anywhere in the app through the useAuth() helper below.
 */
export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const login = useCallback(async ({ email, password, fullName }) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise((resolve, reject) =>
        setTimeout(() => {
          if (password && password.length < 6) {
            reject(new Error("Password must be at least 6 characters."));
          } else {
            resolve();
          }
        }, 700)
      );
      setUser({ email, fullName: fullName || "Analyst" });
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = { login, logout, isLoading, error, user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an <AuthProvider>");
  return ctx;
}
